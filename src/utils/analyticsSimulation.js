const DAY_MS = 24 * 60 * 60 * 1000;

export const PERIOD_OPTIONS = [
  { value: 'day', label: 'Ngày', points: 24, unit: 'hour' },
  { value: 'week', label: 'Tuần', points: 7, unit: 'day' },
  { value: 'month', label: 'Tháng', points: 30, unit: 'day' },
  { value: 'year', label: 'Năm', points: 12, unit: 'month' },
];

export const SENSOR_SERIES = [
  { key: 'temperature', label: 'Nhiệt độ', unit: '°C', color: '#f97316', icon: 'device_thermostat' },
  { key: 'humidity', label: 'Độ ẩm', unit: '%', color: '#38bdf8', icon: 'humidity_percentage' },
  { key: 'gas', label: 'Khí gas', unit: 'ppm', color: '#ef4444', icon: 'gas_meter' },
  { key: 'light', label: 'Độ sáng', unit: 'lux', color: '#facc15', icon: 'wb_sunny' },
  { key: 'motion', label: 'Chuyển động', unit: 'lần', color: '#a855f7', icon: 'motion_sensor_active' },
  { key: 'doorOpen', label: 'Cửa mở', unit: 'lần', color: '#22c55e', icon: 'sensor_door' },
  { key: 'doorClose', label: 'Cửa đóng', unit: 'lần', color: '#0f62fe', icon: 'door_back' },
];

export const FEATURE_SERIES = [
  { key: 'access', label: 'Ra vào', color: '#38bdf8', icon: 'door_front' },
  { key: 'alerts', label: 'Cảnh báo', color: '#f59e0b', icon: 'warning' },
  { key: 'fingerprint', label: 'Vân tay', color: '#a855f7', icon: 'fingerprint' },
  { key: 'remote', label: 'Điều khiển từ xa', color: '#0f62fe', icon: 'settings_remote' },
  { key: 'voice', label: 'Giọng nói', color: '#2dd4bf', icon: 'mic' },
  { key: 'settings', label: 'Cài đặt', color: '#64748b', icon: 'tune' },
];

const hashSeed = (value) =>
  String(value || 'sentinel')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const round = (value, digits = 0) => Number(value.toFixed(digits));

const getPeriodConfig = (period) => PERIOD_OPTIONS.find((item) => item.value === period) || PERIOD_OPTIONS[1];

const getDateLabel = (date, period, index) => {
  if (period === 'day') return `${String(date.getHours()).padStart(2, '0')}:00`;
  if (period === 'year') return date.toLocaleDateString('vi-VN', { month: 'short' });
  if (period === 'week') {
    const weekday = date.toLocaleDateString('vi-VN', { weekday: 'short' });
    return `${weekday} ${date.getDate()}/${date.getMonth() + 1}`;
  }
  if (index % 5 === 0 || index > 27) return `${date.getDate()}/${date.getMonth() + 1}`;
  return String(date.getDate());
};

const stepDate = (date, period, offset) => {
  const next = new Date(date);
  if (period === 'day') next.setHours(next.getHours() + offset, 0, 0, 0);
  if (period === 'week' || period === 'month') next.setTime(next.getTime() + offset * DAY_MS);
  if (period === 'year') next.setMonth(next.getMonth() + offset, 1);
  return next;
};

const buildTimeline = (period, customStart, customEnd) => {
  if (customStart && customEnd) {
    const start = new Date(`${customStart}T00:00:00`);
    const end = new Date(`${customEnd}T23:59:59`);
    const totalDays = Math.max(1, Math.ceil((end - start) / DAY_MS));
    const maxPoints = totalDays > 90 ? 12 : Math.min(Math.max(totalDays + 1, 2), 45);
    const step = totalDays / Math.max(maxPoints - 1, 1);

    return Array.from({ length: maxPoints }, (_, index) => {
      const date = new Date(start.getTime() + index * step * DAY_MS);
      return {
        date,
        label: totalDays > 90
          ? date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })
          : `${date.getDate()}/${date.getMonth() + 1}`,
      };
    });
  }

  const config = getPeriodConfig(period);
  const now = new Date();
  const startOffset = -(config.points - 1);
  return Array.from({ length: config.points }, (_, index) => {
    const date = stepDate(now, period, startOffset + index);
    return {
      date,
      label: getDateLabel(date, period, index),
    };
  });
};

const aggregateLogs = (logs) => {
  const normalized = Array.isArray(logs) ? logs : [];
  return {
    access: normalized.length,
    denied: normalized.filter((log) => log.action === 'DENIED').length,
    fingerprint: normalized.filter((log) => log.method === 'FINGERPRINT').length,
    remote: normalized.filter((log) => log.method === 'REMOTE').length,
    locked: normalized.filter((log) => log.action === 'LOCKED').length,
    unlocked: normalized.filter((log) => log.action === 'UNLOCKED').length,
  };
};

export const generateAnalyticsSimulation = ({
  period = 'week',
  customStart = '',
  customEnd = '',
  snapshot = {},
  weeklySnapshot = {},
  logs = [],
  alerts = [],
  devices = [],
}) => {
  const timeline = buildTimeline(period, customStart, customEnd);
  const deviceList = Array.isArray(devices) && devices.length ? devices : [{ deviceName: 'Khóa cửa chính', online: true }];
  const logStats = aggregateLogs(logs);
  const seed = hashSeed(`${period}-${customStart}-${customEnd}-${deviceList.map((item) => item.deviceCode || item.deviceName).join('|')}`);
  const onlineDevices = deviceList.filter((device) => device.online).length || Number(snapshot?.onlineDevices || 1);
  const totalDevices = deviceList.length || Number(snapshot?.totalDevices || 1);
  const baseAccess = Math.max(Number(snapshot?.accessLogsToday || 0), Number(weeklySnapshot?.totalAccessThisWeek || 0), logStats.access, 2);
  const baseAlerts = Math.max(Number(snapshot?.totalAlertsToday || 0), Number(weeklySnapshot?.alertsThisWeek || 0), alerts.length, 0);
  const health = totalDevices ? (onlineDevices / totalDevices) * 100 : 0;

  const points = timeline.map((item, index) => {
    const wave = Math.sin((index + seed) * 0.74);
    const softWave = Math.cos((index + seed) * 0.43);
    const businessHours = item.date.getHours ? item.date.getHours() >= 7 && item.date.getHours() <= 22 : true;
    const activityFactor = period === 'day' ? (businessHours ? 1.4 : 0.45) : 1 + (index % 6) * 0.08;
    const access = Math.max(0, Math.round((baseAccess / Math.max(timeline.length / 2, 1)) * activityFactor + wave * 2 + (index % 3)));
    const alertsValue = Math.max(0, Math.round((baseAlerts / Math.max(timeline.length, 1)) + (softWave > 0.72 ? 1 : 0)));
    const fingerprint = Math.max(0, Math.round(access * (0.32 + (wave + 1) * 0.08)));
    const remote = Math.max(0, Math.round(access * (0.24 + (softWave + 1) * 0.07)));
    const voice = Math.max(0, Math.round(access * (0.12 + (index % 4) * 0.02)));
    const settings = Math.max(0, Math.round(alertsValue * 0.7 + (index % 9 === 0 ? 1 : 0)));

    return {
      ...item,
      temperature: round(clamp(27 + wave * 3.2 + (period === 'day' ? index * 0.04 : 0), 19, 39), 1),
      humidity: round(clamp(58 + softWave * 12, 30, 88), 0),
      gas: round(clamp(130 + Math.max(0, wave) * 190 + alertsValue * 80 + (index % 11 === 0 ? 140 : 0), 60, 980), 0),
      light: round(clamp(period === 'day' ? (businessHours ? 520 + wave * 210 : 90 + softWave * 40) : 420 + wave * 220, 20, 950), 0),
      motion: Math.max(0, Math.round(access * 0.45 + (wave + 1) * 2)),
      doorOpen: Math.max(0, Math.round(access * 0.58 + remote * 0.2)),
      doorClose: Math.max(0, Math.round(access * 0.52 + fingerprint * 0.18 + (softWave > 0.65 ? 1 : 0))),
      access,
      alerts: alertsValue,
      fingerprint,
      remote,
      voice,
      settings,
      health: round(clamp(health + wave * 8 - alertsValue * 4, 0, 100), 0),
    };
  });

  const totals = [...SENSOR_SERIES, ...FEATURE_SERIES].reduce((acc, series) => {
    acc[series.key] = points.reduce((sum, item) => sum + Number(item[series.key] || 0), 0);
    return acc;
  }, {});

  const averages = SENSOR_SERIES.reduce((acc, series) => {
    acc[series.key] = points.length
      ? round(points.reduce((sum, item) => sum + Number(item[series.key] || 0), 0) / points.length, series.key === 'temperature' ? 1 : 0)
      : 0;
    return acc;
  }, {});

  const peaks = SENSOR_SERIES.reduce((acc, series) => {
    acc[series.key] = points.reduce((max, item) => Number(item[series.key] || 0) > Number(max[series.key] || 0) ? item : max, points[0] || {});
    return acc;
  }, {});

  const deviceRows = deviceList.map((device, index) => {
    const deviceSeed = hashSeed(device.deviceCode || device.deviceName || index);
    const latest = points[points.length - 1] || {};
    return {
      id: device.id || `device-${index}`,
      name: device.deviceName || device.deviceCode || `Thiết bị ${index + 1}`,
      code: device.deviceCode || `SIM-${index + 1}`,
      online: device.online ?? index === 0,
      health: round(clamp((device.online ? 84 : 42) + Math.sin(deviceSeed) * 9, 0, 100), 0),
      temperature: round(Number(device.temperature ?? latest.temperature ?? 0) + (index * 0.7), 1),
      gas: round(Number(device.gasValue ?? latest.gas ?? 0) + (index * 24), 0),
      light: round(Number(device.ldrValue ?? latest.light ?? 0) - (index * 35), 0),
      motion: round((latest.motion || 0) / (index + 1), 0),
    };
  });

  return {
    period,
    timeline: points,
    totals,
    averages,
    peaks,
    deviceRows,
    healthScore: round(points.reduce((sum, item) => sum + item.health, 0) / Math.max(points.length, 1), 0),
    generatedAt: new Date().toISOString(),
  };
};
