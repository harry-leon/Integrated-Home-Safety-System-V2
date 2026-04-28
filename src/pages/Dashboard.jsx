import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useTimeWeather } from '../contexts/TimeWeatherContext';
import { useVoiceCommand } from '../contexts/VoiceCommandContext';
import { useAlertModal } from '../contexts/AlertModalContext';
import { smartLockApi } from '../services/api';
import { createAlertSubscription, createTelemetrySubscription } from '../services/realtime';

const formatAlertType = (alertType, t) => {
  switch (alertType) {
    case 'GAS_LEAK':
      return t('alert_gas_leak');
    case 'INTRUDER_ALERT':
      return t('alert_intruder');
    case 'FIRE_ALARM':
      return t('alert_fire');
    case 'WRONG_PASSWORD':
      return t('alert_wrong_password');
    case 'TAMPER_ALERT':
      return t('alert_tamper');
    case 'BATTERY_LOW':
      return t('alert_battery_low');
    case 'OFFLINE_ALERT':
      return t('alert_offline');
    default:
      return alertType || t('reminder_warning');
  }
};

const getAlertIcon = (alertType) => {
  switch (alertType) {
    case 'GAS_LEAK':
      return 'detector_alarm';
    case 'INTRUDER_ALERT':
      return 'motion_sensor_active';
    case 'FIRE_ALARM':
      return 'local_fire_department';
    case 'BATTERY_LOW':
      return 'battery_alert';
    case 'OFFLINE_ALERT':
      return 'wifi_off';
    default:
      return 'warning';
  }
};

const getSeverityStyle = (severity) => {
  if (severity === 'CRITICAL') {
    return {
      tone: 'border-error/30 bg-error/8 text-error',
      badge: 'bg-error text-white',
      iconWrap: 'bg-error/14 text-error',
      label: 'Nguy cap',
    };
  }

  if (severity === 'HIGH') {
    return {
      tone: 'border-amber-500/30 bg-amber-500/8 text-amber-700',
      badge: 'bg-amber-500 text-slate-950',
      iconWrap: 'bg-amber-500/14 text-amber-600',
      label: 'Can chu y',
    };
  }

  return {
    tone: 'border-primary/20 bg-primary/6 text-primary',
    badge: 'bg-primary text-white',
    iconWrap: 'bg-primary/12 text-primary',
    label: 'Theo doi',
  };
};

const formatRelativeTime = (value) => {
  if (!value) return 'Chua cap nhat';

  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));

  if (minutes < 60) return `${minutes} phut truoc`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} gio truoc`;
  const days = Math.round(hours / 24);
  return `${days} ngay truoc`;
};

const formatDateTime = (value) => {
  if (!value) return 'Chua co du lieu';
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const DEFAULT_LDR_THRESHOLD = 700;

const getLightLevel = (ldrValue, ldrThreshold) => {
  if (ldrValue == null) {
    return {
      label: 'Chua co du lieu LDR',
      threshold: ldrThreshold ?? DEFAULT_LDR_THRESHOLD,
    };
  }

  const threshold = Math.max(1, ldrThreshold ?? DEFAULT_LDR_THRESHOLD);

  if (ldrValue <= threshold * 0.2) {
    return { label: 'Rat toi', threshold };
  }

  if (ldrValue <= threshold * 0.5) {
    return { label: 'Toi', threshold };
  }

  if (ldrValue <= threshold) {
    return { label: 'Binh thuong', threshold };
  }

  if (ldrValue <= threshold * 1.35) {
    return { label: 'Sang', threshold };
  }

  return { label: 'Qua sang', threshold };
};

const applyTelemetryToDevices = (deviceList, payload) => {
  if (!Array.isArray(deviceList) || !payload?.deviceCode) {
    return deviceList;
  }

  return deviceList.map((device) => {
    if (device.deviceCode !== payload.deviceCode) {
      return device;
    }

    return {
      ...device,
      online: true,
      lastSeen: payload.recordedAt || device.lastSeen,
      gasValue: payload.gasValue ?? device.gasValue,
      ldrValue: payload.ldrValue ?? device.ldrValue,
      pirTriggered: payload.pirTriggered ?? device.pirTriggered,
      temperature: payload.temperature ?? device.temperature,
      weatherDesc: payload.weatherDesc ?? device.weatherDesc,
      lastSensorAt: payload.recordedAt || device.lastSensorAt,
    };
  });
};

const getDeviceTelemetryTime = (device) => {
  const timestamp = device?.lastSensorAt || device?.lastSeen;
  const parsed = timestamp ? new Date(timestamp).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const getPreferredDashboardDevice = (deviceList) => {
  if (!Array.isArray(deviceList) || deviceList.length === 0) {
    return null;
  }

  return [...deviceList].sort((left, right) => {
    const telemetryDelta = getDeviceTelemetryTime(right) - getDeviceTelemetryTime(left);
    if (telemetryDelta !== 0) {
      return telemetryDelta;
    }

    if (left.online !== right.online) {
      return Number(right.online) - Number(left.online);
    }

    return (left.deviceName || '').localeCompare(right.deviceName || '');
  })[0];
};

const mergeAlertIntoList = (currentAlerts, incomingAlert) => {
  if (!incomingAlert?.id) {
    return currentAlerts;
  }

  const nextAlerts = Array.isArray(currentAlerts) ? [...currentAlerts] : [];
  const existingIndex = nextAlerts.findIndex((alert) => alert.id === incomingAlert.id);

  if (existingIndex >= 0) {
    nextAlerts[existingIndex] = {
      ...nextAlerts[existingIndex],
      ...incomingAlert,
    };
  } else {
    nextAlerts.unshift(incomingAlert);
  }

  nextAlerts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return nextAlerts;
};

const Dashboard = () => {
  const { t, formatDateTime, formatRelativeTime, formatAlertType, formatAccessAction, formatAccessMethod, formatDeviceName, translateSystemText } = useLang();
  const { weather } = useTimeWeather();
  const {
    isSupported: isVoiceSupported,
    isListening,
    isExecuting: isVoiceExecuting,
    transcript: voiceTranscript,
    feedback: voiceFeedback,
    error: voiceError,
    startListening: startVoiceRecognition,
    stopListening: stopVoiceRecognition,
  } = useVoiceCommand();
  const { showAlert } = useAlertModal();
  const navigate = useNavigate();

  const triggerAlertModal = React.useCallback((payload) => {
    const alertType = (payload.alertType || '').toUpperCase();
    const severity = (payload.severity || '').toUpperCase();
    const isSafetyCritical = alertType === 'GAS_LEAK' || alertType === 'INTRUDER_ALERT' || alertType === 'FIRE_ALARM';

    if (severity === 'CRITICAL' || severity === 'HIGH' || isSafetyCritical) {
      showAlert({
        type: (severity === 'CRITICAL' || isSafetyCritical) ? 'error' : 'warning',
        dedupeKey: payload.id ? `alert:${payload.id}` : `alert:${alertType}:${payload.createdAt || ''}`,
        title: formatAlertType(alertType, t),
        message: alertType === 'GAS_LEAK' ? (t('reminder_gas_detected') || payload.message) :
                 alertType === 'INTRUDER_ALERT' ? (t('reminder_intruder_detected') || payload.message) :
                 alertType === 'FIRE_ALARM' ? (t('reminder_fire_detected') || payload.message || 'Phát hiện cháy!') :
                 (payload.message || formatAlertType(alertType, t)),
        confirmText: t('reminder_check_now') || 'Kiểm tra ngay',
        showCancelButton: !isSafetyCritical,
        preventClose: isSafetyCritical,
        onConfirm: () => {
          navigate('/analytics');
        }
      });
    }
  }, [navigate, showAlert, t]);

  const [alerts, setAlerts] = useState([]);
  const [weeklySnap, setWeeklySnap] = useState(null);
  const [devices, setDevices] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [telemetryStatus, setTelemetryStatus] = useState('idle');
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [lastTelemetryAt, setLastTelemetryAt] = useState(null);
  const [telemetrySource, setTelemetrySource] = useState('snapshot');
  const [primaryDeviceSettings, setPrimaryDeviceSettings] = useState(null);
  const telemetryDeviceCodes = useMemo(
    () => Array.from(new Set(devices.map((device) => device?.deviceCode).filter(Boolean))),
    [devices],
  );
  const primaryDevice = useMemo(() => getPreferredDashboardDevice(devices), [devices]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [alertsData, snapData, deviceData, logData] = await Promise.all([
          smartLockApi.getAlerts().catch(() => null),
          smartLockApi.getWeeklySnapshot().catch(() => null),
          smartLockApi.getDevices().catch(() => null),
          smartLockApi.getAccessLogs({ page: 0, size: 6 }).catch(() => null),
        ]);

        if (!active) return;

        if (Array.isArray(alertsData)) {
          setAlerts(alertsData);
        }

        if (snapData) {
          setWeeklySnap(snapData);
        }

        if (Array.isArray(deviceData)) {
          setDevices(deviceData);
          const preferredDevice = getPreferredDashboardDevice(deviceData);
          if (preferredDevice?.lastSensorAt) {
            setLastTelemetryAt((current) => current || preferredDevice.lastSensorAt);
            setTelemetrySource((current) => current || 'snapshot');
          }
        }

        if (Array.isArray(logData)) {
          setAccessLogs(logData);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 15000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (telemetryDeviceCodes.length === 0) {
      setTelemetryStatus('idle');
      return undefined;
    }

    const statusByDevice = new Map();

    const updateAggregateStatus = () => {
      const statuses = Array.from(statusByDevice.values());

      if (statuses.some((status) => status === 'live')) {
        setTelemetryStatus('live');
        setIsFallbackActive(false);
        return;
      }

      if (statuses.some((status) => status === 'connecting')) {
        setTelemetryStatus('connecting');
        return;
      }

      if (statuses.some((status) => status === 'reconnecting')) {
        setTelemetryStatus('reconnecting');
        return;
      }

      setTelemetryStatus('idle');
    };

    const cleanups = telemetryDeviceCodes.map((deviceCode) =>
      createTelemetrySubscription({
        deviceCode,
        onStatusChange: (status) => {
          statusByDevice.set(deviceCode, status);
          updateAggregateStatus();
        },
        onMessage: (payload) => {
          setDevices((current) => applyTelemetryToDevices(current, payload));
          setLastTelemetryAt(payload.recordedAt || new Date().toISOString());
          setTelemetrySource('websocket');
        },
      }),
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
    };
  }, [telemetryDeviceCodes]);

  // Subscribe to the device-specific alert topic (only when device is known)
  useEffect(() => {
    if (!primaryDevice?.deviceCode) return undefined;

    return createAlertSubscription({
      deviceCode: primaryDevice.deviceCode,
      onMessage: (payload) => {
        setAlerts((current) => mergeAlertIntoList(current, payload));
        triggerAlertModal(payload);
      },
    });
  }, [primaryDevice?.deviceCode, triggerAlertModal]);

  // Always subscribe to global alert topic regardless of device status
  useEffect(() => {
    return createAlertSubscription({
      deviceCode: null, // forces /topic/alerts global topic
      onMessage: (payload) => {
        setAlerts((current) => mergeAlertIntoList(current, payload));
        triggerAlertModal(payload);
      },
    });
  }, [triggerAlertModal]);

  useEffect(() => {
    if (!primaryDevice?.lastSensorAt) {
      return;
    }

    setLastTelemetryAt((current) => {
      if (!current) return primaryDevice.lastSensorAt;
      return new Date(primaryDevice.lastSensorAt).getTime() > new Date(current).getTime()
        ? primaryDevice.lastSensorAt
        : current;
    });
  }, [primaryDevice?.lastSensorAt]);

  const [prevOnlineState, setPrevOnlineState] = useState(true);
  useEffect(() => {
    if (primaryDevice) {
      if (prevOnlineState && !primaryDevice.online) {
        showAlert({
          type: 'warning',
          title: formatAlertType('OFFLINE_ALERT', t),
          message: t('reminder_device_offline'),
          confirmText: t('reminder_check_now'),
          onConfirm: () => {
            navigate('/analytics');
          }
        });
      }
      setPrevOnlineState(primaryDevice.online);
    }
  }, [navigate, primaryDevice?.online, prevOnlineState, showAlert, t]);

  useEffect(() => {
    if (!primaryDevice?.id) {
      setPrimaryDeviceSettings(null);
      return undefined;
    }

    let active = true;

    const loadPrimaryDeviceSettings = async () => {
      try {
        const settings = await smartLockApi.getDeviceSettings(primaryDevice.id);
        if (active) {
          setPrimaryDeviceSettings(settings);
        }
      } catch {
        if (active) {
          setPrimaryDeviceSettings(null);
        }
      }
    };

    loadPrimaryDeviceSettings();

    return () => {
      active = false;
    };
  }, [primaryDevice?.id]);

  useEffect(() => {
    if (!primaryDevice?.deviceCode || telemetryStatus === 'live' || telemetryStatus === 'connecting') {
      setIsFallbackActive(false);
      return undefined;
    }

    let active = true;
    setIsFallbackActive(true);

    const pollDevices = async () => {
      try {
        const deviceData = await smartLockApi.getDevices();
        if (!active || !Array.isArray(deviceData)) {
          return;
        }

        setDevices(deviceData);

        const refreshedDevice =
          deviceData.find((device) => device.deviceCode === primaryDevice.deviceCode) ||
          getPreferredDashboardDevice(deviceData);
        if (refreshedDevice?.lastSensorAt) {
          setLastTelemetryAt(refreshedDevice.lastSensorAt);
          setTelemetrySource('polling');
        }
      } catch {
        // Polling is best-effort; keep the current dashboard state on transient errors.
      }
    };

    pollDevices();
    const intervalId = setInterval(pollDevices, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
      setIsFallbackActive(false);
    };
  }, [primaryDevice?.deviceCode, telemetryStatus]);

  const activeAlerts = useMemo(
    () => alerts.filter((alert) => !alert.resolved).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [alerts],
  );
  const topAlert = activeAlerts[0] || null;
  const recentEvents = accessLogs.slice(0, 4);
  const latestLockAction = accessLogs.find((log) => log.action === 'LOCKED' || log.action === 'UNLOCKED');
  const isLocked = latestLockAction?.action !== 'UNLOCKED';
  const telemetryBadge = isFallbackActive
    ? {
        label: 'Fallback',
        tone: 'bg-amber-500/10 text-amber-600',
      }
    : telemetryStatus === 'live'
      ? {
          label: 'Live',
          tone: 'bg-emerald-500/10 text-emerald-600',
        }
      : telemetryStatus === 'connecting'
        ? {
            label: 'Connecting',
            tone: 'bg-blue-500/10 text-blue-600',
          }
        : telemetryStatus === 'reconnecting'
          ? {
              label: 'Reconnecting',
              tone: 'bg-blue-500/10 text-blue-600',
            }
          : {
              label: 'Idle',
              tone: 'bg-outline/10 text-outline',
            };

  const heroStatus = topAlert
    ? {
        eyebrow: t('hero_attention'),
        title: formatAlertType(topAlert.alertType),
        description: t('hero_needs_review'),
        tone: 'border-error/20 bg-error/5',
        accent: 'text-error',
      }
    : {
        eyebrow: t('hero_stable'),
        title: t('system_safe'),
        description: primaryDevice?.online
          ? `${formatDeviceName(primaryDevice.deviceName)} ${t('hero_device_online')}`
          : t('hero_no_device_online'),
        tone: 'border-primary/20 bg-primary/5',
        accent: 'text-primary',
      };

  const statusChips = [
    {
      label: t('door_status'),
      value: isLocked ? t('door_locked_now') : t('door_unlocked_now'),
      icon: isLocked ? 'lock' : 'lock_open',
      tone: isLocked ? 'text-primary' : 'text-amber-500',
      bgColor: isLocked ? 'bg-primary/5' : 'bg-amber-500/5',
    },
    {
      label: t('alerts'),
      value: activeAlerts.length > 0 ? `${activeAlerts.length} ${t('active_alerts_count_suffix')}` : t('safe'),
      icon: activeAlerts.length > 0 ? 'report' : 'verified',
      tone: activeAlerts.length > 0 ? 'text-error' : 'text-emerald-500',
      bgColor: activeAlerts.length > 0 ? 'bg-error/5' : 'bg-emerald-500/5',
    },
    {
      label: t('device_label'),
      value: primaryDevice?.online ? t('online') : t('offline'),
      icon: primaryDevice?.online ? 'sensors' : 'sensors_off',
      tone: primaryDevice?.online ? 'text-blue-500' : 'text-error',
      bgColor: primaryDevice?.online ? 'bg-blue-500/5' : 'bg-error/5',
    },
  ];

  const lightLevel = getLightLevel(primaryDevice?.ldrValue, primaryDeviceSettings?.ldrThreshold);
  const lightDetailText = primaryDevice?.ldrValue != null
    ? `${t('brightness')}: ${translateSystemText(lightLevel.label)} - ${t('threshold_label')}: ${lightLevel.threshold} lx`
    : t('no_sensor_data');

  const environmentCards = [
    {
      label: t('weather'),
      value: primaryDevice?.temperature != null ? `${primaryDevice.temperature}°C` : `${weather.temp}°C`,
      detail: primaryDevice?.weatherDesc || weather.desc,
      icon: 'thermostat',
      color: 'bg-orange-500/10 text-orange-500',
      summary: t('weather_support'),
    },
    {
      label: t('brightness'),
      value: primaryDevice?.ldrValue != null ? `${primaryDevice.ldrValue} lx` : 'N/A',
      icon: 'wb_sunny',
      color: 'bg-amber-500/10 text-amber-500',
      detail: lightDetailText,
      summary: t('ldr_sensor'),
    },
    {
      label: t('gas'),
      value: primaryDevice?.gasValue != null ? `${primaryDevice.gasValue} ppm` : 'N/A',
      detail: primaryDevice?.gasValue != null ? `${t('status')}: ${primaryDevice.gasValue >= 300 ? t('gas_alert') : t('safe')}` : t('no_sensor_data'),
      icon: 'air',
      color: 'bg-blue-500/10 text-blue-500',
      summary: primaryDevice?.pirTriggered ? t('motion_detected') : t('no_intrusion'),
    },
  ];

  const weeklyCards = [
    {
      label: t('total_access'),
      value: weeklySnap?.totalAccessThisWeek ?? '--',
      detail: weeklySnap?.accessChangeRate ? `${weeklySnap.accessChangeRate.toFixed(1)}%` : t('no_major_change'),
      icon: 'insights',
      color: 'bg-indigo-500/10 text-indigo-500',
    },
    {
      label: t('new_alerts'),
      value: weeklySnap?.alertsThisWeek ?? '--',
      detail: weeklySnap?.alertsThisWeek > 0 ? t('review_logs') : t('no_new_alerts'),
      icon: 'notifications_active',
      color: 'bg-rose-500/10 text-rose-500',
    },
    {
      label: t('critical_level'),
      value: weeklySnap?.criticalAlertsThisWeek ?? '--',
      detail: weeklySnap?.criticalAlertsThisWeek > 0 ? t('prioritize_now') : t('system_safe'),
      icon: 'emergency',
      color: 'bg-red-600/10 text-red-600',
    },
  ];

  const topAlertStyle = topAlert ? getSeverityStyle(topAlert.severity) : null;
  const telemetryMeta = lastTelemetryAt
    ? `Cap nhat ${formatRelativeTime(lastTelemetryAt)} qua ${telemetrySource === 'polling' ? 'polling du phong' : telemetrySource === 'websocket' ? 'kenh live' : 'snapshot gan nhat'}.`
    : 'Chua co moc cap nhat sensor.';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section>
        <div className="overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container shadow-sm">
          <div className="grid items-stretch gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.95fr)] lg:p-10">
            <div className="flex h-full flex-col justify-between gap-7">
              <div className="space-y-7">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${heroStatus.tone} ${heroStatus.accent}`}>
                  <span className={`h-2 w-2 rounded-full ${topAlert ? 'bg-error animate-pulse' : 'bg-primary'}`} />
                  {heroStatus.eyebrow}
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] sm:text-sm font-semibold text-outline">Tong quan 3 giay</p>
                  <h1 className="max-w-2xl text-3xl font-black tracking-tight text-on-surface sm:text-4xl lg:text-5xl">
                    {heroStatus.title}
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-outline sm:text-base sm:leading-7">
                    {heroStatus.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {statusChips.map((item) => (
                    <div key={item.label} className={`rounded-2xl ${item.bgColor} border border-outline-variant/5 px-4 py-4 flex flex-col justify-between`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`material-symbols-outlined text-[18px] ${item.tone}`}>{item.icon}</span>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-outline">{item.label}</p>
                      </div>
                      <p className={`text-base font-black tracking-tight sm:text-lg ${item.tone}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/remote"
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isLocked ? 'lock_open' : 'lock'}
                    </span>
                    {isLocked ? 'Mo khoa ngay' : 'Khoa cua ngay'}
                  </Link>
                  <Link
                    to={topAlert ? '/logs' : '/analytics'}
                    className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {topAlert ? 'warning' : 'analytics'}
                    </span>
                    {topAlert ? 'Xem canh bao chi tiet' : 'Xem bao cao tuan'}
                  </Link>
                </div>

                {topAlert ? (
                  <div className={`rounded-[1.5rem] border px-5 py-4 ${topAlertStyle.tone}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`rounded-2xl p-3 ${topAlertStyle.iconWrap}`}>
                          <span className="material-symbols-outlined text-[22px]">
                            {getAlertIcon(topAlert.alertType)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-black uppercase tracking-[0.16em]">
                              {topAlertStyle.label}
                            </p>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${topAlertStyle.badge}`}>
                              {formatAlertType(topAlert.alertType, t)}
                            </span>
                          </div>
                          <p className="mt-2 text-base font-semibold text-on-surface">
                            {topAlert.message || 'He thong vua ghi nhan mot canh bao moi.'}
                          </p>
                          <p className="mt-1 text-sm text-outline">
                            {formatDateTime(topAlert.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/logs"
                        className="inline-flex items-center gap-2 rounded-2xl border border-current/15 bg-white/60 px-4 py-2 text-sm font-semibold text-current transition-colors hover:bg-white/80"
                      >
                        <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                        Xem chi tiet
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="hidden lg:block" />
            </div>

            <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-surface-container-high p-5 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,98,254,0.16),transparent_42%)]" />
              <div className="relative z-10 flex h-full flex-col items-center justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-outline">Voice control</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-on-surface">
                  Tap the mic
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-outline">
                  Nhấn để điều khiển nhanh bằng giọng nói ngay trên dashboard.
                </p>

                <button
                  type="button"
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  disabled={!isVoiceSupported || isVoiceExecuting}
                  className={`relative mx-auto mt-7 flex h-32 w-32 items-center justify-center rounded-full border-[6px] transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-50 sm:h-36 sm:w-36 ${
                    isListening
                      ? 'border-green-400/20 bg-green-500 text-white shadow-[0_0_60px_rgba(34,197,94,0.4)] scale-105'
                      : 'border-primary/10 bg-gradient-to-br from-primary to-primary-container text-white shadow-[0_20px_40px_rgba(15,98,254,0.25)] hover:scale-105'
                  }`}
                >
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full border-2 border-green-300/45 animate-ping" aria-hidden="true" />
                      <span className="absolute -inset-4 rounded-full border border-green-400/20 animate-pulse" aria-hidden="true" />
                    </>
                  )}
                  <span className={`material-symbols-outlined text-5xl sm:text-6xl ${isListening ? 'animate-bounce' : ''}`}>
                    {isListening ? 'graphic_eq' : 'mic'}
                  </span>
                </button>

                <p className="mt-5 text-sm font-semibold text-on-surface">
                  {isListening
                    ? 'Listening...'
                    : isVoiceExecuting
                      ? 'Running command...'
                      : 'Press to start voice control'}
                </p>

                {(voiceTranscript || voiceFeedback) && (
                  <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-outline">
                    {isListening ? voiceTranscript || 'Speak now.' : voiceError || voiceFeedback}
                  </p>
                )}

                {voiceError ? (
                  <p className="mt-2 text-xs font-medium text-error" role="alert">
                    {voiceError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid items-stretch gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex h-full flex-col rounded-[2rem] border border-outline-variant/12 bg-surface-container p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">Su kien gan day</p>
                <p className="mt-1 text-sm text-outline">Tra loi nhanh: cua da khoa chua, ai vua thao tac, co su co nao moi khong.</p>
              </div>
              <Link to="/logs" className="text-sm font-semibold text-primary hover:underline">
                Xem toan bo
              </Link>
            </div>

            <div className="mt-5 flex-1 space-y-3">
              {isLoading ? (
                <div className="rounded-2xl bg-surface-container-high px-4 py-6 text-sm text-outline">Dang tai su kien...</div>
              ) : recentEvents.length === 0 ? (
                <div className="rounded-2xl bg-surface-container-high px-4 py-6 text-sm text-outline">Chua co su kien nao trong nhat ky.</div>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.id} className="grid gap-2 rounded-2xl bg-surface-container-high px-4 py-4 md:grid-cols-[150px_minmax(0,1fr)_120px] md:items-center">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{formatAccessAction(event.action)}</p>
                      <p className="mt-1 text-xs text-outline">{formatAccessMethod(event.method || 'REMOTE')}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-on-surface">{event.detail || `${formatAccessAction(event.action)} qua ${event.method}`}</p>
                      <p className="mt-1 text-xs text-outline">
                        {event.personName || event.userName || formatDeviceName(event.deviceName) || t('system_actor')}
                      </p>
                    </div>
                    <p className="text-xs text-outline md:text-right">{formatDateTime(event.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex h-full flex-col rounded-[2rem] border border-outline-variant/12 bg-surface-container p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">{t('environment')}</p>
                <p className="mt-1 text-sm text-outline">Gia tri hien tai, don vi va muc canh bao co ban.</p>
                <p className="mt-2 text-xs text-outline">{telemetryMeta}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${telemetryBadge.tone}`}>
                  {telemetryBadge.label}
                </span>
                <Link to="/remote" className="text-sm font-semibold text-primary hover:underline">
                  Xem thiet bi
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-1 flex-col gap-3">
              {environmentCards.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col justify-between rounded-2xl bg-surface-container-high px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-xl ${item.color} p-2.5 flex items-center justify-center shadow-sm`}>
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-outline">{item.summary}</p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-on-surface">{item.value}</p>
                  </div>
                  <p className="mt-3 text-sm text-outline">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid items-stretch gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex h-full flex-col rounded-[2rem] border border-outline-variant/12 bg-surface-container p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">Bao cao tuan</p>
                <p className="mt-1 text-sm text-outline">
                  {isLoading ? 'Dang tong hop xu huong 7 ngay qua.' : weeklySnap?.progressSummary || 'Tong hop nhanh de xem he thong co on dinh hay khong.'}
                </p>
              </div>
              <Link to="/analytics" className="text-sm font-semibold text-primary hover:underline">
                Xem phan tich
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {weeklyCards.map((item) => (
                <div key={item.label} className="flex h-full flex-col rounded-[1.5rem] bg-surface-container-high p-5 border border-outline-variant/5">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl ${item.color} p-2 flex items-center justify-center shadow-sm`}>
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface">{item.label}</p>
                  </div>
                  <p className="mt-5 text-3xl font-black tracking-tight text-on-surface">{item.value}</p>
                  <p className="mt-2 text-xs font-medium text-outline">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-surface-container-high px-4 py-4">
              <p className="text-sm font-semibold text-on-surface">Insight nhanh</p>
              <p className="mt-2 text-sm leading-6 text-outline">
                {weeklySnap?.criticalAlertsThisWeek > 0
                  ? 'Tuan nay co canh bao nguy cap. Uu tien vao trang Nhat ky de kiem tra nguyen nhan va thoi diem xay ra.'
                  : weeklySnap?.alertsThisWeek > 0
                    ? 'Co canh bao moi trong tuan nhung chua o muc nguy cap. Nen xem lai nhat ky de dam bao da xu ly day du.'
                    : 'He thong van on dinh trong 7 ngay qua. Tiep tuc theo doi ket noi thiet bi va log truy cap.'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container shadow-sm">
            <div className="relative h-72 bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1000"
                alt="Thiet bi cua chinh"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute left-5 top-5 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {primaryDevice?.online ? 'Hinh anh thiet bi' : 'Preview thiet bi'}
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">{t('front_door')}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-white">
                  {primaryDevice?.deviceName || 'Thiet bi cua chinh'}
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/80">
                  Day la khung preview thiet bi, khong phai live camera. Neu can goc nhin truc tiep, nen tach thanh module camera rieng voi trang thai ket noi ro rang.
                </p>
              </div>
            </div>

            <div className="mt-auto grid gap-3 p-5 sm:grid-cols-2">
              <Link
                to="/remote"
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                {t('live')} camera
              </Link>
              <Link
                to="/logs"
                className="flex items-center justify-center gap-2 rounded-2xl bg-surface-container-high border border-outline-variant/15 px-4 py-3 text-sm font-bold text-on-surface transition-all hover:border-primary/30"
              >
                <span className="material-symbols-outlined text-[18px]">history</span>
                {t('logs')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
