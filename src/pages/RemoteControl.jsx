import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useVoiceCommand } from '../contexts/VoiceCommandContext';
import { useAlertModal } from '../contexts/AlertModalContext';
import GuestAccessModal from '../components/GuestAccessModal';
import ReAuthModal from '../components/ReAuthModal';
import { smartLockApi } from '../services/api';

const QUICK_SETTINGS = [
  { labelKey: 'auto_lock', icon: 'lock_clock', key: 'autoLockEnabled', color: 'text-primary' },
  { labelKey: 'gas_alert', icon: 'gas_meter', key: 'gasAlertEnabled', color: 'text-tertiary' },
  { labelKey: 'motion_alert', icon: 'motion_sensor_active', key: 'pirAlertEnabled', color: 'text-secondary' },
];

const RANGE_SETTINGS = [
  { labelKey: 'gas_threshold', key: 'gasThreshold', max: 1000 },
  { labelKey: 'light_threshold', key: 'ldrThreshold', max: 1000 },
  { labelKey: 'auto_lock_delay', key: 'autoLockDelay', max: 120 },
];

const VOICE_ACTION_PRESETS = [
  { value: 'navigate:/', label: 'Mo dashboard' },
  { value: 'navigate:/remote', label: 'Mo dieu khien' },
  { value: 'navigate:/logs', label: 'Mo nhat ky' },
  { value: 'navigate:/analytics', label: 'Mo analytics' },
  { value: 'navigate:/settings', label: 'Mo cai dat' },
  { value: 'lock:locked', label: 'Khoa cua' },
  { value: 'lock:unlocked', label: 'Mo khoa' },
  { value: 'setting:autoLockEnabled:true', label: 'Bat auto lock' },
  { value: 'setting:autoLockEnabled:false', label: 'Tat auto lock' },
  { value: 'setting:gasAlertEnabled:true', label: 'Bat canh bao gas' },
  { value: 'setting:gasAlertEnabled:false', label: 'Tat canh bao gas' },
  { value: 'setting:pirAlertEnabled:true', label: 'Bat canh bao PIR' },
  { value: 'setting:pirAlertEnabled:false', label: 'Tat canh bao PIR' },
  { value: 'resolve-alert', label: 'Xu ly canh bao moi nhat' },
];

const buildVoiceCommandPayload = ({ phrase, label, actionPreset, matchMode }) => {
  const [type, first, second] = actionPreset.split(':');
  const base = {
    phrase: phrase.trim(),
    label: label.trim() || phrase.trim(),
    matchMode,
  };

  if (type === 'navigate') return { ...base, type, path: first || '/' };
  if (type === 'lock') return { ...base, type, targetState: first || 'locked' };
  if (type === 'setting') return { ...base, type, key: first, value: second === 'true' };
  return { ...base, type: 'resolve-alert' };
};

const RemoteControl = () => {
  const { t, formatDeviceName } = useLang();
  const {
    isSupported: isVoiceSupported,
    isListening,
    isExecuting: isVoiceExecuting,
    transcript: voiceTranscript,
    parsedCommand: voiceCommand,
    feedback: voiceFeedback,
    error: voiceError,
    helpItems: voiceHelpItems,
    customCommands,
    addCustomCommand,
    removeCustomCommand,
    startListening: startVoiceRecognition,
    stopListening: stopVoiceRecognition,
    runTranscript: runVoiceTranscript,
    runSampleCommand,
  } = useVoiceCommand();
  const { showAlert } = useAlertModal();

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
  const [voicePhrase, setVoicePhrase] = useState('');
  const [voiceLabel, setVoiceLabel] = useState('');
  const [voiceActionPreset, setVoiceActionPreset] = useState('navigate:/analytics');
  const [voiceMatchMode, setVoiceMatchMode] = useState('exact');
  const isBootstrappingSettings = useRef(false);
  const verificationPromiseRef = useRef(null);

  const requestVerificationToken = useCallback(async ({ title, description }) => {
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
  }, [verificationState]);

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
          setStatusMessage(t('no_sensor_data'));
        }
      } catch (error) {
        if (active) {
          setStatusError(error.message || t('no_sensor_data'));
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
          setStatusError(error.message || t('no_sensor_data'));
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
          title: t('voice_verify'),
          description: t('preferences_desc'),
        });

        await smartLockApi.updateDeviceSettings(selectedDeviceId, deviceSettings, verificationToken);
        setStatusMessage(t('preferences'));
        setStatusError('');
        setHasPendingSettingsChange(false);

        showAlert({
          type: 'success',
          title: t('reminder_success'),
          message: t('preferences'),
          confirmText: t('reminder_ok'),
        });
      } catch (error) {
        setStatusError(error.message || t('preferences_desc'));
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [deviceSettings, hasPendingSettingsChange, requestVerificationToken, selectedDeviceId, showAlert, t]);

  useEffect(() => {
    return () => {
      if (verificationPromiseRef.current) {
        verificationPromiseRef.current.reject(new Error('Confirmation was cancelled.'));
      }
    };
  }, []);

  const currentDevice = devices.find((device) => device.id === selectedDeviceId) || null;

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
      setStatusError(t('hero_no_device_online'));
      return;
    }

    setIsSendingCommand(true);
    setStatusMessage('');
    setStatusError('');

    try {
      const commandId = await smartLockApi.sendLockToggle(selectedDeviceId);
      setLocked((current) => !current);
      setStatusMessage(`${t('latest_command')}: ${commandId}`);
    } catch (error) {
      setStatusError(error.message || t('next_action_offline'));
    } finally {
      setIsSendingCommand(false);
    }
  };

  const updateSetting = (key, value) => {
    setDeviceSettings((current) => ({ ...current, [key]: value }));
    setHasPendingSettingsChange(true);
    setStatusMessage(t('loading'));
    setStatusError('');
  };

  const handleSaveVoiceCommand = (event) => {
    event.preventDefault();
    if (!voicePhrase.trim()) {
      setStatusError(t('voice_speak_now'));
      return;
    }

    addCustomCommand(buildVoiceCommandPayload({
      phrase: voicePhrase,
      label: voiceLabel,
      actionPreset: voiceActionPreset,
      matchMode: voiceMatchMode,
    }));

    setVoicePhrase('');
    setVoiceLabel('');
    setStatusMessage(t('save_command'));
    setStatusError('');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface transition-colors duration-300">
            {t('remote_control')}
          </h2>
          <p className="mt-1 font-medium text-outline">{t('page_remote_subtitle')}</p>
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
                  {formatDeviceName(device.deviceName)}
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
              {currentDevice?.online ? t('system_online_short') : t('device_offline_short')}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container p-10 shadow-sm transition-colors duration-300 md:col-span-7">
          <h3 className="relative z-10 mb-12 text-xs font-bold uppercase tracking-widest text-outline">
            {t('door_status')}
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
                {isSendingCommand ? t('loading') : locked ? t('unlock_now') : t('lock_now')}
              </span>
            </div>
          </button>

          <p className="relative z-10 mt-12 max-w-xs text-center font-medium text-outline">
            {locked ? t('unlock_now') : t('lock_now')}. {t('page_logs_subtitle')}
          </p>

          {currentDevice && (
            <p className="relative z-10 mt-4 text-center text-xs text-outline">
              {t('device_label')}: <span className="font-semibold text-on-surface">{formatDeviceName(currentDevice.deviceName)}</span>
              {' · '}
              {currentDevice.online ? t('online') : t('offline')}
              {currentDevice.lastCommandStatus ? ` · ${t('latest_command')}: ${currentDevice.lastCommandStatus}` : ''}
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
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-outline">{t('preferences')}</h4>
            <div className="space-y-6">
              {QUICK_SETTINGS.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high ${item.color}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="font-semibold text-on-surface">{t(item.labelKey)}</span>
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
            <h4 className="mb-8 text-sm font-bold uppercase tracking-wider text-outline">{t('threshold_label')}</h4>
            <div className="space-y-8">
              {RANGE_SETTINGS.map((item) => (
                <div key={item.key}>
                  <div className="mb-4 flex justify-between">
                    <span className="text-sm font-medium text-outline">{t(item.labelKey)}</span>
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

            {isLoading ? <p className="mt-4 text-xs text-outline">{t('loading')}</p> : null}
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
                {t('voice_control')}
              </div>
              <h3 className="mt-5 text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
                {t('voice_control')}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-outline">
                {t('voice_speak_now')}
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
                  {isListening ? t('voice_stop') : t('voice_start')}
                </button>

                <button
                  type="button"
                  onClick={() => runVoiceTranscript(voiceTranscript)}
                  disabled={!voiceCommand || isVoiceExecuting || isSendingCommand}
                  className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/16 bg-surface px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  {t('latest_command')}
                </button>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-outline-variant/12 bg-background/70 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-outline">{t('voice_transcript')}</p>
                  <span className="text-xs font-semibold text-outline">
                    {isVoiceSupported ? t('voice_ready') : t('no_data')}
                  </span>
                </div>
                <p className="mt-4 min-h-[68px] text-lg font-semibold leading-8 text-on-surface">
                  {voiceTranscript || (isListening ? t('voice_listening') : t('voice_no_transcript'))}
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
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-outline">{t('latest_command')}</p>
              <div className="mt-4 rounded-[1.5rem] border border-outline-variant/12 bg-background px-5 py-5">
                {voiceCommand ? (
                  <>
                    <p className="text-lg font-bold text-on-surface">{voiceCommand.label}</p>
                    <p className="mt-2 text-sm leading-6 text-outline">{voiceCommand.detail}</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-on-surface">{t('voice_no_transcript')}</p>
                    <p className="mt-2 text-sm leading-6 text-outline">
                      {t('voice_speak_now')}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-outline">{t('voice_examples')}</p>
              <div className="mt-4 space-y-3">
                {voiceHelpItems.slice(0, 5).map((command) => (
                  <button
                    key={command}
                    type="button"
                    onClick={() => runSampleCommand(command)}
                    className="w-full rounded-2xl border border-outline-variant/12 bg-background px-4 py-4 text-left text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveVoiceCommand} className="rounded-[1.5rem] border border-outline-variant/12 bg-background px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-on-surface">{t('custom_commands')}</p>
                  <p className="mt-1 text-xs leading-5 text-outline">{t('custom_commands_desc')}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                  {customCommands.length}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <input
                  type="text"
                  value={voicePhrase}
                  onChange={(event) => setVoicePhrase(event.target.value)}
                  placeholder={t('voice_speak_now')}
                  className="min-h-11 rounded-2xl border border-outline-variant/12 bg-surface-container px-4 text-sm font-semibold text-on-surface outline-none focus:border-primary/40"
                />
                <input
                  type="text"
                  value={voiceLabel}
                  onChange={(event) => setVoiceLabel(event.target.value)}
                  placeholder={t('latest_command')}
                  className="min-h-11 rounded-2xl border border-outline-variant/12 bg-surface-container px-4 text-sm font-semibold text-on-surface outline-none focus:border-primary/40"
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_0.72fr]">
                  <select
                    value={voiceActionPreset}
                    onChange={(event) => setVoiceActionPreset(event.target.value)}
                    className="min-h-11 rounded-2xl border border-outline-variant/12 bg-surface-container px-4 text-sm font-semibold text-on-surface outline-none focus:border-primary/40"
                  >
                    {VOICE_ACTION_PRESETS.map((action) => (
                      <option key={action.value} value={action.value}>{action.label}</option>
                    ))}
                  </select>
                  <select
                    value={voiceMatchMode}
                    onChange={(event) => setVoiceMatchMode(event.target.value)}
                    className="min-h-11 rounded-2xl border border-outline-variant/12 bg-surface-container px-4 text-sm font-semibold text-on-surface outline-none focus:border-primary/40"
                  >
                    <option value="exact">Exact</option>
                    <option value="contains">Contains</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-black text-white transition hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  {t('save_command')}
                </button>
              </div>

              {customCommands.length ? (
                <div className="mt-4 space-y-2">
                  {customCommands.slice(0, 5).map((command) => (
                    <div key={command.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container px-3 py-3">
                      <button
                        type="button"
                        onClick={() => runSampleCommand(command.phrase)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-black text-on-surface">{command.phrase}</p>
                        <p className="truncate text-xs font-semibold text-outline">{command.label}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomCommand(command.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-outline transition hover:bg-error/10 hover:text-error"
                        aria-label={`Remove ${command.phrase}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </form>

            <div className="rounded-[1.5rem] border border-outline-variant/12 bg-background px-5 py-5">
              <p className="text-sm font-bold text-on-surface">{t('how_it_works')}</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-outline">
                <li>1. {t('voice_start')}.</li>
                <li>2. {t('voice_speak_now')}</li>
                <li>3. {t('voice_verify')}.</li>
                <li>4. {t('voice_panel')}.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ReAuthModal
        isOpen={verificationDialog.isOpen}
        title={verificationDialog.title}
        description={verificationDialog.description}
        confirmLabel={t('voice_verify')}
        cancelLabel={t('voice_cancel')}
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
