import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReAuthModal from '../components/ReAuthModal';
import { useAuth } from './AuthContext';
import { useLang } from './LangContext';
import { smartLockApi } from '../services/api';
import { playErrorTone, playStartTone, playSuccessTone, speakText } from '../utils/audioFeedback';
import { createVoiceCommand, parseVoiceCommand, voiceHelpItems } from '../utils/voiceCommands';

const VoiceCommandContext = createContext(null);
const CUSTOM_COMMANDS_STORAGE_KEY = 'sentinel_voice_commands';

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

// ── Build spoken success feedback per command type ─────────────────────────
const buildSuccessSpeech = (command, lang) => {
  const isVn = lang === 'vn';

  switch (command.type) {
    case 'help':
      return isVn ? 'Danh sách lệnh giọng nói đã mở.' : 'Voice help is open.';

    case 'navigate': {
      const routeNames = {
        '/':            isVn ? 'Tổng quan' : 'Dashboard',
        '/remote':      isVn ? 'Điều khiển' : 'Remote control',
        '/logs':        isVn ? 'Nhật ký' : 'Logs',
        '/analytics':   isVn ? 'Phân tích' : 'Analytics',
        '/fingerprints':isVn ? 'Vân tay' : 'Fingerprints',
        '/settings':    isVn ? 'Cài đặt' : 'Settings',
      };
      const name = routeNames[command.path] || command.label;
      return isVn ? `Mở ${name} thành công.` : `${name} opened successfully.`;
    }

    case 'lock': {
      const action = command.targetState === 'locked'
        ? (isVn ? 'Khóa cửa' : 'Lock door')
        : (isVn ? 'Mở khóa cửa' : 'Unlock door');
      return isVn ? `${action} thành công.` : `${action} successful.`;
    }

    case 'resolve-alert':
      return isVn ? 'Xử lý cảnh báo thành công.' : 'Resolve alert successful.';

    case 'setting': {
      const settingNames = {
        autoLockEnabled: isVn ? 'Tự khóa cửa' : 'Auto lock',
        gasAlertEnabled: isVn ? 'Cảnh báo khí gas' : 'Gas alert',
        pirAlertEnabled: isVn ? 'Cảnh báo chuyển động' : 'Motion alert',
      };
      const name = settingNames[command.key] || command.label;
      const state = command.value
        ? (isVn ? 'bật' : 'enabled')
        : (isVn ? 'tắt' : 'disabled');
      return isVn ? `${name} ${state} thành công.` : `${name} ${state} successfully.`;
    }

    case 'device': {
      return isVn
        ? `Chuyển thiết bị thành công.`
        : `Device switched successfully.`;
    }

    default:
      return isVn ? `${command.label} thành công.` : `${command.label} successful.`;
  }
};

const readStoredCommands = () => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CUSTOM_COMMANDS_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const VoiceCommandProvider = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lang, t } = useLang();
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedCommand, setParsedCommand] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [customCommands, setCustomCommands] = useState(readStoredCommands);
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

  const persistCustomCommands = useCallback((nextCommands) => {
    setCustomCommands(nextCommands);
    window.localStorage.setItem(CUSTOM_COMMANDS_STORAGE_KEY, JSON.stringify(nextCommands));
  }, []);

  const addCustomCommand = useCallback((payload) => {
    const command = createVoiceCommand(payload);
    persistCustomCommands([command, ...customCommands].slice(0, 24));
    return command;
  }, [customCommands, persistCustomCommands]);

  const removeCustomCommand = useCallback((commandId) => {
    persistCustomCommands(customCommands.filter((command) => command.id !== commandId));
  }, [customCommands, persistCustomCommands]);

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
      setVerificationError(describeError(err, t('voice_error_verify')));
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const executeCommand = useCallback(async (command) => {
    if (!command || command.type === 'error') {
      throw new Error(command?.detail || t('voice_no_match'));
    }

    setShowHelp(false);

    if (command.type === 'help') {
      setShowHelp(true);
      setFeedback(t('voice_examples'));
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
      throw new Error(t('voice_error_no_device'));
    }

    if (command.type === 'lock') {
      if (!currentDevice.online) {
        throw new Error(t('next_action_offline'));
      }

      const logs = await smartLockApi.getAccessLogs({ deviceId: currentDevice.id, page: 0, size: 8 }).catch(() => []);
      const currentLockState = getLatestLockState(logs);
      if (currentLockState === 'unknown') {
        navigate('/remote');
        throw new Error(t('voice_error_unknown_state'));
      }

      if (command.targetState === currentLockState) {
        setFeedback(currentLockState === 'locked' ? t('locked') : t('unlocked'));
        return;
      }

      const commandId = await smartLockApi.sendLockToggle(currentDevice.id);
      setFeedback(`${t('latest_command')}: ${commandId}`);
      return;
    }

    if (command.type === 'resolve-alert') {
      const alertsData = activeAlerts.length > 0 ? activeAlerts : await smartLockApi.getAlerts({ isResolved: false, size: 10 }).catch(() => []);
      const alertToResolve = (Array.isArray(alertsData) ? alertsData : []).filter((alert) => !alert.resolved)[0];
      if (!alertToResolve) {
        setFeedback(t('no_active_alerts'));
        return;
      }

      const verificationToken = await requestVerificationToken({
        title: t('voice_verify'),
        description: `${t('voice_verify')}: ${alertToResolve.alertType || t('system_notification')}`,
      });

      await smartLockApi.resolveAlert(alertToResolve.id, verificationToken);
      setActiveAlerts((current) => current.filter((alert) => alert.id !== alertToResolve.id));
      setFeedback(t('reminder_success'));
      return;
    }

    if (command.type === 'setting') {
      const settings = deviceSettings || await smartLockApi.getDeviceSettings(currentDevice.id);
      const nextSettings = { ...settings, [command.key]: command.value };
      const verificationToken = await requestVerificationToken({
        title: t('preferences'),
        description: t('preferences_desc'),
      });

      const updated = await smartLockApi.updateDeviceSettings(currentDevice.id, nextSettings, verificationToken);
      setDeviceSettings(updated || nextSettings);
      setFeedback(`${t('preferences')}: ${command.label}`);
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
    const nextCommand = parseVoiceCommand(spokenText, devices, customCommands);
    setParsedCommand(nextCommand);

    if (!spokenText.trim()) {
      setFeedback(t('voice_no_speech'));
      return;
    }

    if (!nextCommand) {
      const message = t('voice_no_match');
      setFeedback(message);
      setError(message);
      addHistory({ transcript: spokenText, status: 'unmatched' });
      playErrorTone();
      return;
    }

    setIsExecuting(true);
    setError('');
    setFeedback(`${t('voice_recognized')}: ${nextCommand.label}`);

    try {
      await executeCommand(nextCommand);
      addHistory({ transcript: spokenText, command: nextCommand.label, status: 'success' });
      playSuccessTone();
      speakText(buildSuccessSpeech(nextCommand, lang), recognitionLang);
    } catch (err) {
      const message = describeError(err, t('voice_error_run'));
      setError(message);
      setFeedback(message);
      addHistory({ transcript: spokenText, command: nextCommand.label, status: 'error', error: message });
      playErrorTone();
    } finally {
      setIsExecuting(false);
    }
  }, [addHistory, customCommands, devices, executeCommand, recognitionLang]);

  const startListening = useCallback(() => {
    if (!isAuthenticated) {
      setError(t('voice_error_login'));
      return;
    }

    if (!recognitionRef.current) {
      setError(t('voice_error_unsupported'));
      return;
    }

    try {
      transcriptRef.current = '';
      setTranscript('');
      setParsedCommand(null);
      setError('');
      setShowHelp(false);
      setFeedback(t('voice_listening'));
      playStartTone();
      recognitionRef.current.start();
    } catch {
      setError(t('voice_error_active'));
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
      setFeedback(t('voice_listening'));
    };

    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      transcriptRef.current = nextTranscript;
      setTranscript(nextTranscript);
      setParsedCommand(parseVoiceCommand(nextTranscript, devices, customCommands));
    };

    recognition.onerror = (event) => {
      const message = event.error === 'not-allowed'
        ? t('voice_error_permission')
        : t('voice_error_failed');
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
  }, [customCommands, devices, handleRecognizedSpeech, isAuthenticated, recognitionLang]);

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
    customCommands,
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
    addCustomCommand,
    removeCustomCommand,
  }), [
    addCustomCommand,
    activeAlerts,
    commandHistory,
    customCommands,
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
    removeCustomCommand,
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
