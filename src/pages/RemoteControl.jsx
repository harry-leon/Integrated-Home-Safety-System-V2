import React, { useEffect, useRef, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import GuestAccessModal from '../components/GuestAccessModal';
import ReAuthModal from '../components/ReAuthModal';
import { smartLockApi } from '../services/api';

const QUICK_SETTINGS = [
  { label: 'Auto lock', icon: 'lock_clock', key: 'autoLockEnabled', color: 'text-primary' },
  { label: 'Gas alert', icon: 'gas_meter', key: 'gasAlertEnabled', color: 'text-tertiary' },
  { label: 'PIR alert', icon: 'motion_sensor_active', key: 'pirAlertEnabled', color: 'text-secondary' },
];

const RANGE_SETTINGS = [
  { label: 'Gas threshold (PPM)', key: 'gasThreshold', max: 1000 },
  { label: 'Light threshold (Lux)', key: 'ldrThreshold', max: 1000 },
  { label: 'Auto-lock delay (seconds)', key: 'autoLockDelay', max: 120 },
];

const VOICE_COMMANDS = [
  'Lock the door',
  'Unlock the door',
  'Turn on auto lock',
  'Turn off gas alert',
  'Select device 2',
];

const normalizeSpeech = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const RemoteControl = () => {
  const { t } = useLang();
  const [locked, setLocked] = useState(true);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceSettings, setDeviceSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingCommand, setIsSendingCommand] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [hasPendingSettingsChange, setHasPendingSettingsChange] = useState(false);
  const [verificationState, setVerificationState] = useState({ token: '', expiresAt: 0 });
  const [verificationDialog, setVerificationDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
  });
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceCommand, setVoiceCommand] = useState(null);
  const [voiceFeedback, setVoiceFeedback] = useState('Use voice to lock, unlock, switch device, or toggle quick settings.');
  const [voiceError, setVoiceError] = useState('');
  const isBootstrappingSettings = useRef(false);
  const verificationPromiseRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsVoiceSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError('');
      setVoiceFeedback('Listening for a command...');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      setVoiceTranscript(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceError(event.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice recognition failed. Try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsVoiceSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setIsLoading(true);
      setStatusError('');

      try {
        const deviceList = await smartLockApi.getDevices();
        if (!active) return;

        const normalized = Array.isArray(deviceList) ? deviceList : [];
        setDevices(normalized);

        if (normalized.length > 0) {
          setSelectedDeviceId(normalized[0].id);
        } else {
          setStatusMessage('No devices are configured yet.');
        }
      } catch (error) {
        if (active) {
          setStatusError(error.message || 'Unable to load devices.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) {
      setDeviceSettings(null);
      return;
    }

    let active = true;

    const loadDeviceContext = async () => {
      try {
        const [settings, logs] = await Promise.all([
          smartLockApi.getDeviceSettings(selectedDeviceId),
          smartLockApi.getAccessLogs({ deviceId: selectedDeviceId }),
        ]);

        if (!active) return;

        isBootstrappingSettings.current = true;
        setDeviceSettings(settings);
        setHasPendingSettingsChange(false);

        const latestAction = Array.isArray(logs) && logs.length > 0 ? logs[0].action : null;
        if (latestAction === 'UNLOCKED') {
          setLocked(false);
        } else if (latestAction === 'LOCKED') {
          setLocked(true);
        }
      } catch (error) {
        if (active) {
          setStatusError(error.message || 'Unable to load device status.');
        }
      } finally {
        window.setTimeout(() => {
          isBootstrappingSettings.current = false;
        }, 0);
      }
    };

    loadDeviceContext();

    return () => {
      active = false;
    };
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId || !deviceSettings || !hasPendingSettingsChange || isBootstrappingSettings.current) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        const verificationToken = await requestVerificationToken({
          title: 'Confirm settings update',
          description: 'Enter your password to save device thresholds and automation rules.',
        });

        await smartLockApi.updateDeviceSettings(selectedDeviceId, deviceSettings, verificationToken);
        setStatusMessage('Device settings saved.');
        setStatusError('');
        setHasPendingSettingsChange(false);
      } catch (error) {
        setStatusError(error.message || 'Unable to save device settings.');
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [deviceSettings, hasPendingSettingsChange, selectedDeviceId, verificationState]);

  useEffect(() => {
    return () => {
      if (verificationPromiseRef.current) {
        verificationPromiseRef.current.reject(new Error('Confirmation was cancelled.'));
      }
    };
  }, []);

  const requestVerificationToken = async ({ title, description }) => {
    if (verificationState.token && verificationState.expiresAt > Date.now()) {
      return verificationState.token;
    }

    setVerificationError('');
    setVerificationDialog({
      isOpen: true,
      title,
      description,
    });

    return new Promise((resolve, reject) => {
      verificationPromiseRef.current = { resolve, reject };
    });
  };

  const currentDevice = devices.find((device) => device.id === selectedDeviceId) || null;

  const buildVoiceCommand = (transcript) => {
    const normalized = normalizeSpeech(transcript);
    if (!normalized) return null;

    if (/(unlock|open|mo khoa|mo cua)/.test(normalized)) {
      return {
        type: 'lock',
        targetState: 'unlocked',
        label: 'Unlock the selected door',
        detail: 'The command will open the current device after password verification.',
      };
    }

    if (/(lock|secure|khoa cua|dong cua)/.test(normalized)) {
      return {
        type: 'lock',
        targetState: 'locked',
        label: 'Lock the selected door',
        detail: 'The command will secure the current device after password verification.',
      };
    }

    if (/(auto lock on|enable auto lock|bat auto lock|bat khoa tu dong)/.test(normalized)) {
      return {
        type: 'setting',
        key: 'autoLockEnabled',
        value: true,
        label: 'Enable auto lock',
        detail: 'This will update the quick setting and trigger the existing save flow.',
      };
    }

    if (/(auto lock off|disable auto lock|tat auto lock|tat khoa tu dong)/.test(normalized)) {
      return {
        type: 'setting',
        key: 'autoLockEnabled',
        value: false,
        label: 'Disable auto lock',
        detail: 'This will update the quick setting and trigger the existing save flow.',
      };
    }

    if (/(gas alert on|enable gas alert|bat canh bao gas)/.test(normalized)) {
      return {
        type: 'setting',
        key: 'gasAlertEnabled',
        value: true,
        label: 'Enable gas alert',
        detail: 'This updates the gas warning toggle for the selected device.',
      };
    }

    if (/(gas alert off|disable gas alert|tat canh bao gas)/.test(normalized)) {
      return {
        type: 'setting',
        key: 'gasAlertEnabled',
        value: false,
        label: 'Disable gas alert',
        detail: 'This updates the gas warning toggle for the selected device.',
      };
    }

    if (/(pir alert on|enable pir alert|bat canh bao pir)/.test(normalized)) {
      return {
        type: 'setting',
        key: 'pirAlertEnabled',
        value: true,
        label: 'Enable PIR alert',
        detail: 'This updates the motion warning toggle for the selected device.',
      };
    }

    if (/(pir alert off|disable pir alert|tat canh bao pir)/.test(normalized)) {
      return {
        type: 'setting',
        key: 'pirAlertEnabled',
        value: false,
        label: 'Disable PIR alert',
        detail: 'This updates the motion warning toggle for the selected device.',
      };
    }

    const deviceMatch = normalized.match(/(?:device|thiet bi)\s+(\d+)/);
    if (deviceMatch) {
      const index = Number(deviceMatch[1]) - 1;
      if (devices[index]) {
        return {
          type: 'device',
          deviceId: devices[index].id,
          label: `Switch to ${devices[index].deviceName}`,
          detail: 'The working device in the control screen will be updated.',
        };
      }
    }

    return null;
  };

  useEffect(() => {
    if (!voiceTranscript.trim()) {
      setVoiceCommand(null);
      return;
    }

    const nextCommand = buildVoiceCommand(voiceTranscript);
    setVoiceCommand(nextCommand);
    if (nextCommand) {
      setVoiceFeedback(`Command recognized: ${nextCommand.label}`);
      setVoiceError('');
    } else {
      setVoiceFeedback('Voice captured, but no supported command was found.');
    }
  }, [voiceTranscript, devices]);

  const closeVerificationDialog = () => {
    if (isVerifying) {
      return;
    }

    setVerificationDialog((current) => ({ ...current, isOpen: false }));
    setVerificationError('');

    if (verificationPromiseRef.current) {
      verificationPromiseRef.current.reject(new Error('Confirmation was cancelled.'));
      verificationPromiseRef.current = null;
    }
  };

  const handleVerificationConfirm = async (password) => {
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
    } catch (error) {
      setVerificationError(error.message || 'Unable to verify your password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleLock = async () => {
    if (!selectedDeviceId) return;
    if (!currentDevice?.online) {
      setStatusError('This device is offline. Reconnect it before sending a command.');
      return;
    }

    setIsSendingCommand(true);
    setStatusMessage('');
    setStatusError('');

    try {
      const verificationToken = await requestVerificationToken({
        title: locked ? 'Unlock door' : 'Lock door',
        description: `Enter your password to ${locked ? 'unlock' : 'lock'} ${currentDevice?.deviceName || 'this device'}. This action will be recorded.`,
      });

      const commandId = await smartLockApi.sendLockToggle(selectedDeviceId, verificationToken);
      setLocked((current) => !current);
      setStatusMessage(`Command queued successfully. Reference: ${commandId}`);
    } catch (error) {
      setStatusError(error.message || 'Unable to send lock command.');
    } finally {
      setIsSendingCommand(false);
    }
  };

  const updateSetting = (key, value) => {
    setDeviceSettings((current) => ({ ...current, [key]: value }));
    setHasPendingSettingsChange(true);
    setStatusMessage('Saving device changes...');
    setStatusError('');
  };

  const startVoiceRecognition = () => {
    if (!recognitionRef.current) {
      setVoiceError('Voice recognition is not supported in this browser.');
      return;
    }

    setVoiceTranscript('');
    setVoiceCommand(null);
    setVoiceError('');
    recognitionRef.current.start();
  };

  const stopVoiceRecognition = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const runVoiceCommand = async () => {
    if (!voiceCommand) return;

    setVoiceError('');

    if (voiceCommand.type === 'device') {
      setSelectedDeviceId(voiceCommand.deviceId);
      setVoiceFeedback(`Device switched: ${voiceCommand.label}`);
      return;
    }

    if (voiceCommand.type === 'setting') {
      updateSetting(voiceCommand.key, voiceCommand.value);
      setVoiceFeedback(`Setting updated: ${voiceCommand.label}`);
      return;
    }

    if (voiceCommand.type === 'lock') {
      if (voiceCommand.targetState === 'locked' && locked) {
        setVoiceFeedback('The selected device is already locked.');
        return;
      }

      if (voiceCommand.targetState === 'unlocked' && !locked) {
        setVoiceFeedback('The selected device is already unlocked.');
        return;
      }

      await handleToggleLock();
      return;
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface transition-colors duration-300">
            {t('remote_control')}
          </h2>
          <p className="mt-1 font-medium text-outline">Real-time access control and device safety.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {devices.length > 0 && (
            <select
              value={selectedDeviceId}
              onChange={(event) => setSelectedDeviceId(event.target.value)}
              className="rounded-xl border border-outline-variant/10 bg-surface-container px-4 py-2 text-sm text-on-surface outline-none"
            >
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.deviceName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsGuestModalOpen(true)}
            className="hidden items-center gap-2 rounded-xl border border-primary/20 bg-primary-container px-4 py-2 font-bold text-on-primary-container shadow-sm transition-all hover:opacity-90 sm:flex"
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            Guest access
          </button>

          <div className="flex items-center gap-2 rounded-full border border-outline-variant/10 bg-surface-container px-4 py-2 shadow-sm transition-colors duration-300">
            <div className={`h-2 w-2 rounded-full ${currentDevice?.online ? 'bg-green-500 animate-pulse' : 'bg-error'}`} />
            <span className="text-xs font-semibold text-on-surface">
              {currentDevice?.online ? 'SYSTEM ONLINE' : 'DEVICE OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container p-10 shadow-sm transition-colors duration-300 md:col-span-7">
          <h3 className="relative z-10 mb-12 text-xs font-bold uppercase tracking-widest text-outline">
            Current lock state
          </h3>

          <button
            onClick={handleToggleLock}
            disabled={isSendingCommand || !selectedDeviceId || !currentDevice?.online}
            aria-busy={isSendingCommand}
            className={`relative z-10 h-64 w-64 rounded-full p-1 outline-none transition-all duration-300 disabled:opacity-60 ${
              locked
                ? 'bg-gradient-to-br from-primary-container to-inverse-primary shadow-[0_0_80px_rgba(15,98,254,0.3)] hover:scale-105 active:scale-95'
                : 'bg-gradient-to-br from-green-500/20 to-green-500/50 shadow-[0_0_80px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95'
            }`}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface-container-low">
              <span
                className={`material-symbols-outlined mb-2 text-7xl ${locked ? 'text-primary' : 'text-green-500'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {locked ? 'lock' : 'lock_open'}
              </span>
              <span className="font-headline text-2xl font-black uppercase tracking-tighter text-on-surface">
                {locked ? t('locked') : t('unlocked')}
              </span>
              <span className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-outline">
                {isSendingCommand ? 'Sending command...' : locked ? 'Tap to unlock' : 'Tap to lock'}
              </span>
            </div>
          </button>

          <p className="relative z-10 mt-12 max-w-xs text-center font-medium text-outline">
            {locked ? 'Unlock' : 'Lock'} the selected entry point. Every command requires password confirmation and is written to the audit log.
          </p>

          {currentDevice && (
            <p className="relative z-10 mt-4 text-center text-xs text-outline">
              Device: <span className="font-semibold text-on-surface">{currentDevice.deviceName}</span>
              {' · '}
              {currentDevice.online ? 'Online' : 'Offline'}
              {currentDevice.lastCommandStatus ? ` · Last command: ${currentDevice.lastCommandStatus}` : ''}
            </p>
          )}

          {statusMessage ? (
            <p className="relative z-10 mt-3 text-center text-sm text-primary" role="status">
              {statusMessage}
            </p>
          ) : null}

          {statusError ? (
            <p className="relative z-10 mt-3 text-center text-sm text-error" role="alert">
              {statusError}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 md:col-span-5">
          <div className="flex flex-col justify-between rounded-[2rem] border border-outline-variant/10 bg-surface-container p-8 shadow-sm transition-colors duration-300 focus-within:ring">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-outline">Quick settings</h4>
            <div className="space-y-6">
              {QUICK_SETTINGS.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high ${item.color}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="font-semibold text-on-surface">{item.label}</span>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={!!deviceSettings?.[item.key]}
                      disabled={!deviceSettings}
                      onChange={(event) => updateSetting(item.key, event.target.checked)}
                    />
                    <div className="h-6 w-11 rounded-full bg-surface-container-highest peer-focus:outline-none peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline after:bg-white after:transition-all after:content-['']" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container p-8 shadow-sm transition-colors duration-300">
            <h4 className="mb-8 text-sm font-bold uppercase tracking-wider text-outline">Thresholds</h4>
            <div className="space-y-8">
              {RANGE_SETTINGS.map((item) => (
                <div key={item.key}>
                  <div className="mb-4 flex justify-between">
                    <span className="text-sm font-medium text-outline">{item.label}</span>
                    <span className="text-sm font-bold text-primary">{deviceSettings?.[item.key] ?? '--'}</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-primary"
                    min="0"
                    max={item.max}
                    value={deviceSettings?.[item.key] ?? 0}
                    disabled={!deviceSettings}
                    onChange={(event) => updateSetting(item.key, Number(event.target.value))}
                  />
                </div>
              ))}
            </div>

            {isLoading ? <p className="mt-4 text-xs text-outline">Syncing device settings...</p> : null}
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container shadow-sm transition-colors duration-300">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,98,254,0.14),transparent_44%)]" />
            <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-outline-variant/25 to-transparent lg:block" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-error animate-pulse' : 'bg-primary'}`} />
                Voice control
              </div>
              <h3 className="mt-5 text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
                Control the device with your voice
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-outline">
                This frontend-only interface listens for simple lock, unlock, device switch, and quick-setting commands, then maps them to the existing control flow.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  disabled={!isVoiceSupported}
                  className={`inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    isListening
                      ? 'bg-error text-white shadow-[0_18px_40px_rgba(220,38,38,0.26)]'
                      : 'bg-primary text-white shadow-[0_18px_40px_rgba(15,98,254,0.24)]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{isListening ? 'mic_off' : 'mic'}</span>
                  {isListening ? 'Stop listening' : 'Start voice command'}
                </button>

                <button
                  type="button"
                  onClick={runVoiceCommand}
                  disabled={!voiceCommand || isSendingCommand}
                  className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/16 bg-surface px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  Run recognized command
                </button>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-outline-variant/12 bg-background/70 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-outline">Live transcript</p>
                  <span className="text-xs font-semibold text-outline">
                    {isVoiceSupported ? 'Browser speech API ready' : 'Speech API unavailable'}
                  </span>
                </div>
                <p className="mt-4 min-h-[68px] text-lg font-semibold leading-8 text-on-surface">
                  {voiceTranscript || (isListening ? 'Listening...' : 'No voice command captured yet.')}
                </p>
                <p className="mt-3 text-sm text-outline">{voiceFeedback}</p>
                {voiceError ? (
                  <p className="mt-3 text-sm font-medium text-error" role="alert">
                    {voiceError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-5 bg-surface-container-high p-8 lg:p-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-outline">Recognized action</p>
              <div className="mt-4 rounded-[1.5rem] border border-outline-variant/12 bg-background px-5 py-5">
                {voiceCommand ? (
                  <>
                    <p className="text-lg font-bold text-on-surface">{voiceCommand.label}</p>
                    <p className="mt-2 text-sm leading-6 text-outline">{voiceCommand.detail}</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-on-surface">No command mapped yet</p>
                    <p className="mt-2 text-sm leading-6 text-outline">
                      Speak a supported phrase, then review the parsed action here before running it.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-outline">Sample phrases</p>
              <div className="mt-4 space-y-3">
                {VOICE_COMMANDS.map((command) => (
                  <button
                    key={command}
                    type="button"
                    onClick={() => setVoiceTranscript(command)}
                    className="w-full rounded-2xl border border-outline-variant/12 bg-background px-4 py-4 text-left text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-outline-variant/12 bg-background px-5 py-5">
              <p className="text-sm font-bold text-on-surface">How it works</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-outline">
                <li>1. Start listening and speak a short command.</li>
                <li>2. Review the transcript and parsed action.</li>
                <li>3. Run the command to reuse the existing frontend control flow.</li>
                <li>4. Lock and unlock still require password verification through the current modal.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ReAuthModal
        isOpen={verificationDialog.isOpen}
        title={verificationDialog.title}
        description={verificationDialog.description}
        confirmLabel="Verify"
        cancelLabel="Cancel"
        isSubmitting={isVerifying}
        error={verificationError}
        onConfirm={handleVerificationConfirm}
        onClose={closeVerificationDialog}
      />

      <GuestAccessModal isOpen={isGuestModalOpen} onClose={() => setIsGuestModalOpen(false)} />
    </div>
  );
};

export default RemoteControl;
