import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReAuthModal from '../components/ReAuthModal';
import { useAuth } from './AuthContext';
import { useLang } from './LangContext';
import { smartLockApi } from '../services/api';
import { playErrorTone, playStartTone, playSuccessTone, speakText } from '../utils/audioFeedback';
import { parseVoiceCommand, voiceHelpItems } from '../utils/voiceCommands';

const VoiceCommandContext = createContext(null);

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const getRecognitionLang = (lang) => (lang === 'vn' ? 'vi-VN' : 'en-US');

const getLatestLockState = (logs) => {
  const latestLockAction = (Array.isArray(logs) ? logs : []).find(
    (log) => log.action === 'LOCKED' || log.action === 'UNLOCKED',
  );

  if (!latestLockAction) return 'unknown';
  return latestLockAction.action === 'LOCKED' ? 'locked' : 'unlocked';
};

const describeError = (error, fallback) => error?.message || fallback;

export const VoiceCommandProvider = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lang, t } = useLang();
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedCommand, setParsedCommand] = useState(null);
  const [feedback, setFeedback] = useState('Voice control is ready.');
  const [error, setError] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceSettings, setDeviceSettings] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [verificationState, setVerificationState] = useState({ token: '', expiresAt: 0 });
  const [verificationDialog, setVerificationDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
  });
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const verificationPromiseRef = useRef(null);

  const recognitionLang = getRecognitionLang(lang);
  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) || devices[0] || null,
    [devices, selectedDeviceId],
  );

  const addHistory = useCallback((entry) => {
    setCommandHistory((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
        ...entry,
      },
      ...current,
    ].slice(0, 10));
  }, []);

  const loadVoiceData = useCallback(async () => {
    if (!isAuthenticated) return;

    const [deviceData, alertsData] = await Promise.all([
      smartLockApi.getDevices().catch(() => []),
      smartLockApi.getAlerts({ isResolved: false, size: 10 }).catch(() => []),
    ]);

    const nextDevices = Array.isArray(deviceData) ? deviceData : [];
    setDevices(nextDevices);
    setActiveAlerts(Array.isArray(alertsData) ? alertsData.filter((alert) => !alert.resolved) : []);
    setSelectedDeviceId((current) => current || nextDevices[0]?.id || '');
  }, [isAuthenticated]);

  const requestVerificationToken = useCallback(async ({ title, description }) => {
    if (verificationState.token && verificationState.expiresAt > Date.now()) {
      return verificationState.token;
    }

    setVerificationError('');
    setVerificationDialog({ isOpen: true, title, description });

    return new Promise((resolve, reject) => {
      verificationPromiseRef.current = { resolve, reject };
    });
  }, [verificationState]);

  const closeVerificationDialog = useCallback(() => {
    if (isVerifying) return;

    setVerificationDialog((current) => ({ ...current, isOpen: false }));
    setVerificationError('');

    if (verificationPromiseRef.current) {
      verificationPromiseRef.current.reject(new Error('Confirmation was cancelled.'));
      verificationPromiseRef.current = null;
    }
  }, [isVerifying]);

  const handleVerificationConfirm = useCallback(async (password) => {
    setIsVerifying(true);
    setVerificationError('');

    try {
      const verification = await smartLockApi.reAuthenticate(password);
      const nextState = {
        token: verification.verificationToken,
        expiresAt: Date.now() + 4 * 60 * 1000,
      };

      setVerificationState(nextState);
      setVerificationDialog((current) => ({ ...current, isOpen: false }));

      if (verificationPromiseRef.current) {
        verificationPromiseRef.current.resolve(nextState.token);
        verificationPromiseRef.current = null;
      }
    } catch (err) {
      setVerificationError(describeError(err, 'Unable to verify your password.'));
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const executeCommand = useCallback(async (command) => {
    if (!command || command.type === 'error') {
      throw new Error(command?.detail || 'No supported command was found.');
    }

    setShowHelp(false);

    if (command.type === 'help') {
      setShowHelp(true);
      setFeedback('Here are the supported voice commands.');
      return;
    }

    if (command.type === 'navigate') {
      navigate(command.path);
      setFeedback(command.label);
      return;
    }

    if (command.type === 'device') {
      setSelectedDeviceId(command.deviceId);
      setDeviceSettings(null);
      setFeedback(command.label);
      return;
    }

    const currentDevice = selectedDevice || devices[0];
    if (!currentDevice) {
      throw new Error('No device is available for voice control.');
    }

    if (command.type === 'lock') {
      if (!currentDevice.online) {
        throw new Error('The selected device is offline. Reconnect it before sending a command.');
      }

      const logs = await smartLockApi.getAccessLogs({ deviceId: currentDevice.id, page: 0, size: 8 }).catch(() => []);
      const currentLockState = getLatestLockState(logs);
      if (currentLockState === 'unknown') {
        navigate('/remote');
        throw new Error('Door state is unknown. Review the device on the control page before toggling the lock.');
      }

      if (command.targetState === currentLockState) {
        setFeedback(`The selected device is already ${currentLockState}.`);
        return;
      }

      const commandId = await smartLockApi.sendLockToggle(currentDevice.id);
      setFeedback(`Command queued successfully. Reference: ${commandId}`);
      return;
    }

    if (command.type === 'resolve-alert') {
      const alertsData = activeAlerts.length > 0 ? activeAlerts : await smartLockApi.getAlerts({ isResolved: false, size: 10 }).catch(() => []);
      const alertToResolve = (Array.isArray(alertsData) ? alertsData : []).filter((alert) => !alert.resolved)[0];
      if (!alertToResolve) {
        setFeedback('There are no active alerts to resolve.');
        return;
      }

      const verificationToken = await requestVerificationToken({
        title: 'Resolve alert by voice',
        description: `Enter your password to resolve ${alertToResolve.alertType || 'the latest active alert'}.`,
      });

      await smartLockApi.resolveAlert(alertToResolve.id, verificationToken);
      setActiveAlerts((current) => current.filter((alert) => alert.id !== alertToResolve.id));
      setFeedback('Alert resolved successfully.');
      return;
    }

    if (command.type === 'setting') {
      const settings = deviceSettings || await smartLockApi.getDeviceSettings(currentDevice.id);
      const nextSettings = { ...settings, [command.key]: command.value };
      const verificationToken = await requestVerificationToken({
        title: 'Update device setting by voice',
        description: `Enter your password to ${command.label.toLowerCase()} for ${currentDevice.deviceName || 'the selected device'}.`,
      });

      const updated = await smartLockApi.updateDeviceSettings(currentDevice.id, nextSettings, verificationToken);
      setDeviceSettings(updated || nextSettings);
      setFeedback(`Setting updated: ${command.label}`);
    }
  }, [
    activeAlerts,
    deviceSettings,
    devices,
    navigate,
    requestVerificationToken,
    selectedDevice,
  ]);

  const handleRecognizedSpeech = useCallback(async (spokenText) => {
    const nextCommand = parseVoiceCommand(spokenText, devices);
    setParsedCommand(nextCommand);

    if (!spokenText.trim()) {
      setFeedback('No speech was captured.');
      return;
    }

    if (!nextCommand) {
      const message = 'Voice captured, but no supported command was found.';
      setFeedback(message);
      setError(message);
      addHistory({ transcript: spokenText, status: 'unmatched' });
      playErrorTone();
      return;
    }

    setIsExecuting(true);
    setError('');
    setFeedback(`Command recognized: ${nextCommand.label}`);

    try {
      await executeCommand(nextCommand);
      addHistory({ transcript: spokenText, command: nextCommand.label, status: 'success' });
      playSuccessTone();
      speakText(nextCommand.type === 'help' ? 'Voice help is open.' : 'Done.', recognitionLang);
    } catch (err) {
      const message = describeError(err, 'Unable to run the voice command.');
      setError(message);
      setFeedback(message);
      addHistory({ transcript: spokenText, command: nextCommand.label, status: 'error', error: message });
      playErrorTone();
    } finally {
      setIsExecuting(false);
    }
  }, [addHistory, devices, executeCommand, recognitionLang]);

  const startListening = useCallback(() => {
    if (!isAuthenticated) {
      setError('Please log in before using voice control.');
      return;
    }

    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    try {
      transcriptRef.current = '';
      setTranscript('');
      setParsedCommand(null);
      setError('');
      setShowHelp(false);
      setFeedback('Listening...');
      playStartTone();
      recognitionRef.current.start();
    } catch {
      setError('Voice recognition is already active.');
    }
  }, [isAuthenticated]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const runSampleCommand = useCallback((sample) => {
    setTranscript(sample);
    handleRecognizedSpeech(sample);
  }, [handleRecognizedSpeech]);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    setIsSupported(Boolean(SpeechRecognition));

    if (!SpeechRecognition || !isAuthenticated) {
      recognitionRef.current = null;
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = recognitionLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setFeedback('Listening...');
    };

    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      transcriptRef.current = nextTranscript;
      setTranscript(nextTranscript);
      setParsedCommand(parseVoiceCommand(nextTranscript, devices));
    };

    recognition.onerror = (event) => {
      const message = event.error === 'not-allowed'
        ? 'Microphone permission was denied.'
        : 'Voice recognition failed. Try again.';
      setIsListening(false);
      setError(message);
      setFeedback(message);
      playErrorTone();
    };

    recognition.onend = () => {
      setIsListening(false);
      const spokenText = transcriptRef.current.trim();
      if (spokenText) {
        handleRecognizedSpeech(spokenText);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [devices, handleRecognizedSpeech, isAuthenticated, recognitionLang]);

  useEffect(() => {
    loadVoiceData();
    const intervalId = window.setInterval(loadVoiceData, 60000);
    return () => window.clearInterval(intervalId);
  }, [loadVoiceData]);

  useEffect(() => {
    if (!selectedDeviceId || !isAuthenticated) {
      setDeviceSettings(null);
      return;
    }

    let active = true;
    smartLockApi.getDeviceSettings(selectedDeviceId)
      .then((settings) => {
        if (active) setDeviceSettings(settings);
      })
      .catch(() => {
        if (active) setDeviceSettings(null);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, selectedDeviceId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  useEffect(() => () => {
    if (verificationPromiseRef.current) {
      verificationPromiseRef.current.reject(new Error('Confirmation was cancelled.'));
    }
  }, []);

  const value = useMemo(() => ({
    isSupported,
    isListening,
    isExecuting,
    transcript,
    parsedCommand,
    feedback,
    error,
    commandHistory,
    devices,
    selectedDevice,
    activeAlerts,
    showHelp,
    helpItems: voiceHelpItems,
    startListening,
    stopListening,
    toggleListening,
    executeCommand,
    runSampleCommand,
    runTranscript: handleRecognizedSpeech,
    refreshVoiceData: loadVoiceData,
  }), [
    activeAlerts,
    commandHistory,
    devices,
    error,
    executeCommand,
    feedback,
    isExecuting,
    isListening,
    isSupported,
    loadVoiceData,
    parsedCommand,
    handleRecognizedSpeech,
    runSampleCommand,
    selectedDevice,
    showHelp,
    startListening,
    stopListening,
    toggleListening,
    transcript,
  ]);

  return (
    <VoiceCommandContext.Provider value={value}>
      {children}
      <ReAuthModal
        isOpen={verificationDialog.isOpen}
        title={verificationDialog.title}
        description={verificationDialog.description}
        confirmLabel={t('voice_verify') || 'Verify'}
        cancelLabel={t('voice_cancel') || 'Cancel'}
        isSubmitting={isVerifying}
        error={verificationError}
        onConfirm={handleVerificationConfirm}
        onClose={closeVerificationDialog}
      />
    </VoiceCommandContext.Provider>
  );
};

export const useVoiceCommand = () => {
  const ctx = useContext(VoiceCommandContext);
  if (!ctx) throw new Error('useVoiceCommand must be used within VoiceCommandProvider');
  return ctx;
};
