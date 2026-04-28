import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { smartLockApi } from '../services/api';
import {
  PERIOD_OPTIONS,
  SENSOR_SERIES,
  generateAnalyticsSimulation,
} from '../utils/analyticsSimulation';
import { useLang } from '../contexts/LangContext';

const COLORS = {
  access: '#38bdf8',
  alert: '#f59e0b',
  success: '#22c55e',
  danger: '#ef4444',
  surface: 'var(--color-surface-container)',
};

const sensorLabelKeys = {
  temperature: 'sensor_temperature',
  humidity: 'sensor_humidity',
  gas: 'sensor_gas',
  light: 'sensor_light',
  motion: 'sensor_motion',
  doorOpen: 'sensor_door_open',
  doorClose: 'sensor_door_close',
};

const SENSOR_THRESHOLDS = {
  temperature: { note: '> 38°C: quá nóng, cần chú ý', dangerAt: 38, compare: 'above' },
  humidity: { note: '> 85%: không khí quá ẩm', dangerAt: 85, compare: 'above' },
  gas: { note: 'Rò rỉ khí gas (dựa vào ngưỡng người dùng)', dangerAt: 450, compare: 'above', dynamic: true },
  light: { note: '< 80 lux: trời tối', dangerAt: 80, compare: 'below' },
  motion: { note: '> 5 lần/lần đo: có nhiều chuyển động', dangerAt: 5, compare: 'above' },
  doorOpen: { note: '> 5 lần/lần đo: cửa mở bất thường', dangerAt: 5, compare: 'above' },
  doorClose: { note: '> 5 lần/lần đo: cửa đóng liên tục', dangerAt: 5, compare: 'above' },
};

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return 'Đang tải';
  return new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const formatDetailedTime = (value) => {
  if (!value) return 'Chưa có thời gian';
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getSensorStatus = (sensorKey, value, thresholds = SENSOR_THRESHOLDS) => {
  const threshold = thresholds[sensorKey];
  if (!threshold) return { label: 'Bình thường', color: COLORS.success };

  const numeric = Number(value || 0);
  const isDanger = threshold.compare === 'below'
    ? numeric < threshold.dangerAt
    : numeric > threshold.dangerAt;

  return isDanger
    ? { label: 'Cảnh báo', color: COLORS.danger }
    : { label: 'Bình thường', color: COLORS.success };
};

const Panel = ({ children, className = '' }) => (
  <section className={`rounded-[1.75rem] border border-outline-variant/12 bg-surface-container p-5 shadow-sm ${className}`}>
    {children}
  </section>
);

const SectionTitle = ({ label, title, action }) => (
  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-outline">{label}</p>
      <h3 className="mt-1 text-lg font-black tracking-tight text-on-surface">{title}</h3>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

const LoadingBlock = ({ className = 'h-24' }) => (
  <div className={`${className} animate-pulse rounded-2xl bg-surface-container-high`} />
);

const StatCard = ({ label, value, detail, icon, color }) => (
  <div className="relative overflow-hidden rounded-[1.5rem] border border-outline-variant/12 bg-surface-container p-5 shadow-sm">
    <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] opacity-10" style={{ background: color }} />
    <div className="relative flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${color}18`, color }}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-outline">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-on-surface">{value}</p>
        <p className="mt-2 text-sm text-outline">{detail}</p>
      </div>
    </div>
  </div>
);

const LineChart = ({ data, series, title }) => {
  const width = 760;
  const height = 300;
  const pad = { top: 18, right: 24, bottom: 42, left: 46 };
  const labels = data.map((item) => item.label);
  const values = data.flatMap((item) => series.map((entry) => Number(item[entry.key] || 0)));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const x = (index) => pad.left + (index / Math.max(labels.length - 1, 1)) * innerW;
  const y = (value) => pad.top + innerH - ((Number(value || 0) - min) / range) * innerH;

  const makePath = (key) =>
    data
      .map((item, index) => {
        const currentX = x(index);
        const currentY = y(item[key]);
        if (index === 0) return `M${currentX},${currentY}`;
        const prevX = x(index - 1);
        const prevY = y(data[index - 1][key]);
        const midX = (prevX + currentX) / 2;
        return `C${midX},${prevY} ${midX},${currentY} ${currentX},${currentY}`;
      })
      .join(' ');

  const tickValues = [0, 0.25, 0.5, 0.75, 1].map((tick) => Math.round(min + tick * range));

  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-high/50 px-2 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        {tickValues.map((tick, index) => (
          <g key={`${tick}-${index}`}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="currentColor" strokeOpacity="0.08" />
            <text x={pad.left - 10} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.45">
              {tick}
            </text>
          </g>
        ))}
        {labels.map((label, index) => (
          <text
            key={`${label}-${index}`}
            x={x(index)}
            y={height - 14}
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
            opacity={index % Math.ceil(labels.length / 8 || 1) === 0 || index === labels.length - 1 ? 0.6 : 0}
          >
            {label}
          </text>
        ))}
        {series.map((entry) => (
          <path key={entry.key} d={makePath(entry.key)} fill="none" stroke={entry.color} strokeWidth="3" strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
};

const BarCompare = ({ data, series }) => {
  const max = Math.max(...data.flatMap((item) => series.map((entry) => item[entry.key] || 0)), 1);
  const visibleLabels = Math.ceil(data.length / 10);

  return (
    <div className="flex h-72 items-end gap-2 overflow-hidden rounded-2xl bg-surface-container-high/50 px-3 pb-4 pt-6">
      {data.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
          <div className="flex h-full w-full items-end justify-center gap-1">
            {series.map((entry) => (
              <div
                key={entry.key}
                className="w-full rounded-t-xl"
                style={{
                  height: `${clamp(((item[entry.key] || 0) / max) * 100, item[entry.key] > 0 ? 4 : 1, 100)}%`,
                  background: `linear-gradient(180deg, ${entry.color}, ${entry.color}88)`,
                }}
                title={`${entry.label}: ${formatNumber(item[entry.key])}`}
              />
            ))}
          </div>
          <span className="w-full truncate text-center text-[11px] font-semibold text-outline">
            {index % visibleLabels === 0 || index === data.length - 1 ? item.label : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

const SensorBarChart = ({ data, sensor }) => {
  const max = Math.max(...data.map((item) => Number(item[sensor.key] || 0)), 1);
  const visibleLabels = Math.ceil(data.length / 10);

  return (
    <div className="flex h-72 items-end gap-2 overflow-hidden rounded-2xl bg-surface-container-high/50 px-3 pb-4 pt-6">
      {data.map((item, index) => {
        const value = Number(item[sensor.key] || 0);
        return (
          <div key={`${sensor.key}-${item.label}-${index}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-black text-on-surface">{formatNumber(value)}</span>
            <div
              className="w-full rounded-t-2xl"
              style={{
                height: `${clamp((value / max) * 100, value > 0 ? 5 : 1, 100)}%`,
                background: `linear-gradient(180deg, ${sensor.color}, ${sensor.color}88)`,
              }}
              title={`${sensor.label}: ${formatNumber(value)} ${sensor.unit}`}
            />
            <span className="w-full truncate text-center text-[11px] font-semibold text-outline">
              {index % visibleLabels === 0 || index === data.length - 1 ? item.label : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const HeatMap = ({ data }) => {
  const max = Math.max(...data.map((item) => item.motion + item.doorOpen + item.alerts), 1);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
      {data.map((item, index) => {
        const intensity = (item.motion + item.doorOpen + item.alerts) / max;
        return (
          <div
            key={`${item.label}-${index}`}
            className="rounded-2xl border border-outline-variant/10 px-3 py-3"
            style={{ background: `rgba(56, 189, 248, ${0.07 + intensity * 0.28})` }}
          >
            <p className="truncate text-xs font-black text-on-surface">{item.label}</p>
            <p className="mt-2 text-2xl font-black text-on-surface">{formatNumber(item.motion + item.doorOpen)}</p>
            <p className="text-[11px] font-semibold text-outline">Chuyển động và cửa mở</p>
          </div>
        );
      })}
    </div>
  );
};

const HISTORY_PERIOD_OPTIONS = [
  { value: 'day',   label: 'Ngày' },
  { value: 'week',  label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'year',  label: 'Năm' },
];

const DetailTimeline = ({ title, label, icon, color, rows, emptyText, period: activePeriod, onPeriodChange }) => (
  <Panel>
    <SectionTitle
      label={label}
      title={title}
      action={
        <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 text-xs font-black text-outline">
          <span className="material-symbols-outlined text-[16px]" style={{ color }}>{icon}</span>
          {formatNumber(rows.length)} mốc
        </span>
      }
    />
    {onPeriodChange && (
      <div className="mb-4 flex flex-wrap gap-2">
        {HISTORY_PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPeriodChange(opt.value)}
            className={`min-h-9 rounded-xl px-3 text-xs font-black transition ${
              activePeriod === opt.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    )}
    {rows.length ? (
      <div className="space-y-3">
        {rows.slice(0, 10).map((row) => (
          <div key={row.id} className="grid gap-3 rounded-2xl bg-surface-container-high/70 p-4 sm:grid-cols-[44px_minmax(0,1fr)_140px] sm:items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${color}18`, color }}>
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-on-surface">{row.title}</p>
              <p className="mt-1 truncate text-xs font-semibold text-outline">{row.detail}</p>
            </div>
            <p className="text-xs font-bold text-outline sm:text-right">{formatDetailedTime(row.time)}</p>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-high/40 px-4 py-8 text-center text-sm font-semibold text-outline">
        {emptyText}
      </div>
    )}
  </Panel>
);

const DeviceTable = ({ rows, formatDeviceName }) => (
  <div className="overflow-hidden rounded-2xl border border-outline-variant/10">
    <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 bg-surface-container-high px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-outline">
      <span>Thiết bị</span>
      <span>Tình trạng</span>
      <span>Nhiệt độ</span>
      <span>Khí gas</span>
      <span>Độ sáng</span>
    </div>
    {rows.map((row) => (
      <div key={row.id} className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 border-t border-outline-variant/10 px-4 py-4 text-sm">
        <div className="min-w-0">
          <p className="truncate font-black text-on-surface">{formatDeviceName(row.name)}</p>
          <p className="mt-1 truncate text-xs font-semibold text-outline">{row.code} · {row.online ? 'Đang hoạt động' : 'Mất kết nối'}</p>
        </div>
        <span className="font-black text-on-surface">{row.health >= 70 ? 'Tốt' : 'Cần kiểm tra'}</span>
        <span className="font-semibold text-outline">{row.temperature}°C</span>
        <span className="font-semibold text-outline">{row.gas} ppm</span>
        <span className="font-semibold text-outline">{row.light} lux</span>
      </div>
    ))}
  </div>
);

const ToggleChip = ({ active, children, onClick, ...buttonProps }) => (
  <button
    type="button"
    onClick={onClick}
    {...buttonProps}
    className={`min-h-11 rounded-2xl px-4 text-sm font-black transition ${active ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-high text-outline hover:text-on-surface'}`}
  >
    {children}
  </button>
);

const ThresholdHint = ({ sensor, value, thresholds = SENSOR_THRESHOLDS }) => {
  const threshold = thresholds[sensor.key];
  const status = getSensorStatus(sensor.key, value, thresholds);
  if (!threshold) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-outline-variant/10 bg-surface-container-high/60 px-4 py-3">
      <span className="text-xs font-bold text-outline">{threshold.note}</span>
      <span
        className="rounded-full px-2.5 py-1 text-[11px] font-black"
        style={{ background: `${status.color}18`, color: status.color }}
      >
        {status.label}
      </span>
    </div>
  );
};

const Analytics = () => {
  const { t, formatDeviceName, formatAccessMethod } = useLang();
  const [snapshot, setSnapshot] = useState(null);
  const [weeklySnapshot, setWeeklySnapshot] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [period, setPeriod] = useState('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeSensorKeys, setActiveSensorKeys] = useState(['temperature', 'gas', 'light', 'motion', 'doorOpen', 'doorClose']);
  const [selectedVolumeSensorKey, setSelectedVolumeSensorKey] = useState('motion');
  const [sensorHistoryPeriod, setSensorHistoryPeriod] = useState('week');
  const [deviceSettings, setDeviceSettings] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [snap, weekly, logs, alertData, deviceData] = await Promise.all([
        smartLockApi.getAnalyticsSnapshot(),
        smartLockApi.getWeeklySnapshot(),
        smartLockApi.getAccessLogs({ page: 0, size: 80 }),
        smartLockApi.getAlerts({ page: 0, size: 60 }),
        smartLockApi.getDevices(),
      ]);
      setSnapshot(snap || null);
      setWeeklySnapshot(weekly || null);
      setRecentLogs(Array.isArray(logs) ? logs : []);
      setAlerts(Array.isArray(alertData) ? alertData : []);
      setDevices(Array.isArray(deviceData) ? deviceData : []);
      setLastUpdated(new Date());

      // Load device settings for the first device to get user-configured thresholds
      const firstDevice = Array.isArray(deviceData) && deviceData[0];
      if (firstDevice?.id) {
        smartLockApi.getDeviceSettings(firstDevice.id)
          .then((settings) => setDeviceSettings(settings))
          .catch(() => {});
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu cảm biến.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const analytics = useMemo(() => generateAnalyticsSimulation({
    period,
    customStart,
    customEnd,
    snapshot,
    weeklySnapshot,
    logs: recentLogs,
    alerts,
    devices,
  }), [alerts, customEnd, customStart, devices, period, recentLogs, snapshot, weeklySnapshot]);

  // Separate analytics for sensor history section — driven by sensorHistoryPeriod
  const sensorHistoryAnalytics = useMemo(() => generateAnalyticsSimulation({
    period: sensorHistoryPeriod,
    customStart: '',
    customEnd: '',
    snapshot,
    weeklySnapshot,
    logs: recentLogs,
    alerts,
    devices,
  }), [alerts, devices, recentLogs, sensorHistoryPeriod, snapshot, weeklySnapshot]);

  const localizedSensorSeries = useMemo(() => SENSOR_SERIES.map((sensor) => ({
    ...sensor,
    label: t(sensorLabelKeys[sensor.key] || sensor.label),
  })), [t]);

  // Dynamic thresholds — gas and light use user-configured values from device settings
  const dynamicThresholds = useMemo(() => {
    const gasAt = Number(deviceSettings?.gasThreshold) || 450;
    const lightAt = Number(deviceSettings?.ldrThreshold) || 80;
    return {
      ...SENSOR_THRESHOLDS,
      gas: {
        note: `> ${gasAt} ppm: rò rỉ khí gas (ngưỡng bạn đã cài)`,
        dangerAt: gasAt,
        compare: 'above',
      },
      light: {
        note: `< ${lightAt} lux: trời tối (ngưỡng bạn đã cài)`,
        dangerAt: lightAt,
        compare: 'below',
      },
    };
  }, [deviceSettings]);
  const selectedSensorSeries = localizedSensorSeries.filter((item) => activeSensorKeys.includes(item.key));
  const latest = analytics.timeline.at(-1) || {};
  const criticalPoints = analytics.timeline.filter((item) => item.gas > dynamicThresholds.gas.dangerAt || item.alerts > 0).length;
  const doorEventTotal = Number(analytics.totals.doorOpen || 0) + Number(analytics.totals.doorClose || 0);
  const motionTotal = Number(analytics.totals.motion || 0);
  const volumeSensors = localizedSensorSeries.filter((item) => ['doorOpen', 'doorClose', 'motion', 'gas', 'light', 'temperature', 'humidity'].includes(item.key));
  const selectedVolumeSensor = volumeSensors.find((item) => item.key === selectedVolumeSensorKey) || volumeSensors[0];
  const selectedVolumeAverage = analytics.averages[selectedVolumeSensor.key] ?? 0;
  const selectedVolumeTotal = analytics.totals[selectedVolumeSensor.key] ?? 0;
  const selectedVolumePeak = analytics.peaks[selectedVolumeSensor.key]?.[selectedVolumeSensor.key] ?? 0;
  const selectedVolumeLatest = latest[selectedVolumeSensor.key] ?? 0;
  const cumulativeSensorKeys = ['motion', 'doorOpen', 'doorClose'];
  const primarySummaryLabel = cumulativeSensorKeys.includes(selectedVolumeSensor.key) ? t('total_times') : t('current');
  const primarySummaryValue = cumulativeSensorKeys.includes(selectedVolumeSensor.key) ? selectedVolumeTotal : selectedVolumeLatest;
  const fingerprintTotal = useMemo(() => {
    const uniqueNames = new Set(
      recentLogs
        .filter((log) => log.method === 'FINGERPRINT')
        .map((log) => log.personName || log.detail || log.id)
        .filter(Boolean),
    );

    return Math.max(uniqueNames.size, Number(analytics.totals.fingerprint || 0) > 0 ? 1 : 0);
  }, [analytics.totals.fingerprint, recentLogs]);

  const toggleSensor = (key) => {
    setActiveSensorKeys((current) => (
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    ));
  };

  const doorTimelineRows = useMemo(() => {
    const logRows = recentLogs
      .filter((log) => log.action === 'LOCKED' || log.action === 'UNLOCKED')
      .map((log) => ({
        id: log.id || `${log.action}-${log.createdAt}`,
        time: log.createdAt,
        title: log.action === 'LOCKED' ? 'Cửa đã đóng' : 'Cửa đã mở',
        detail: `${formatDeviceName(log.deviceName)} · ${formatAccessMethod(log.method)} · ${log.personName || log.userName || 'Người dùng'}`,
      }));

    if (logRows.length) return logRows;

    return analytics.timeline
      .filter((item) => item.doorOpen > 0 || item.doorClose > 0)
      .map((item, index) => ({
        id: `door-${index}-${item.label}`,
        time: item.date,
        title: `${formatNumber(item.doorOpen)} lần mở · ${formatNumber(item.doorClose)} lần đóng`,
        detail: `Dữ liệu trong mốc ${item.label}`,
      }))
      .reverse();
  }, [analytics.timeline, recentLogs]);

  const motionTimelineRows = useMemo(() => analytics.timeline
    .filter((item) => item.motion > 0)
    .map((item, index) => ({
      id: `motion-${index}-${item.label}`,
      time: item.date,
      title: `Phát hiện ${formatNumber(item.motion)} lần chuyển động`,
      detail: `Ghi nhận tại ${item.label}; cửa mở ${formatNumber(item.doorOpen)} lần trong cùng mốc.`,
    }))
    .reverse(), [analytics.timeline]);

  const gasTimelineRows = useMemo(() => analytics.timeline
    .map((item, index, all) => {
      const previous = all[index - 1];
      const delta = previous ? Number(item.gas || 0) - Number(previous.gas || 0) : 0;
      const isDanger = Number(item.gas || 0) > dynamicThresholds.gas.dangerAt;
      return {
        id: `gas-${index}-${item.label}`,
        time: item.date,
        title: `${formatNumber(item.gas)} ppm, ${delta >= 0 ? 'tăng' : 'giảm'} ${formatNumber(Math.abs(delta))}`,
        detail: isDanger ? `Vượt ngưỡng ${dynamicThresholds.gas.dangerAt} ppm — rò rỉ khí gas` : 'Đang trong mức an toàn',
        delta,
        isDanger,
      };
    })
    .filter((item) => item.isDanger)
    .reverse(), [analytics.timeline, dynamicThresholds.gas.dangerAt]);

  const selectedSensorRows = useMemo(() => {
    if (selectedVolumeSensor.key === 'doorOpen' || selectedVolumeSensor.key === 'doorClose') return doorTimelineRows;
    if (selectedVolumeSensor.key === 'motion') return motionTimelineRows;
    if (selectedVolumeSensor.key === 'gas') return gasTimelineRows;

    return sensorHistoryAnalytics.timeline
      .map((item, index, all) => {
        const previous = all[index - 1];
        const value = Number(item[selectedVolumeSensor.key] || 0);
        const previousValue = previous ? Number(previous[selectedVolumeSensor.key] || 0) : value;
        const delta = value - previousValue;
        return {
          id: `${selectedVolumeSensor.key}-${index}-${item.label}`,
          time: item.date,
          title: `${formatNumber(value)} ${selectedVolumeSensor.unit}, ${delta >= 0 ? 'tăng' : 'giảm'} ${formatNumber(Math.abs(delta))}`,
          detail: `${selectedVolumeSensor.label} thay đổi tại mốc ${item.label}`,
        };
      })
      .filter((_, index) => index > 0)
      .reverse();
  }, [sensorHistoryAnalytics.timeline, doorTimelineRows, gasTimelineRows, motionTimelineRows, selectedVolumeSensor]);

  return (
    <div className="space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container p-6 shadow-sm sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-outline">{t('analytics_sensor_report')}</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-on-surface sm:text-5xl">
              {t('analytics_sensor_title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-outline sm:text-base">
              {t('analytics_sensor_desc')}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[520px]">
            <div className="flex flex-wrap gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <ToggleChip key={option.value} active={period === option.value} onClick={() => setPeriod(option.value)}>
                  {option.label}
                </ToggleChip>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="date"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                className="min-h-11 rounded-2xl border border-outline-variant/12 bg-surface-container-high px-4 text-sm font-semibold text-on-surface outline-none focus:border-primary/40"
                aria-label="Ngày bắt đầu"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="min-h-11 rounded-2xl border border-outline-variant/12 bg-surface-container-high px-4 text-sm font-semibold text-on-surface outline-none focus:border-primary/40"
                aria-label="Ngày kết thúc"
              />
              <button
                type="button"
                onClick={loadAll}
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-black text-white disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                {t('view_all')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm font-semibold text-error">
          <span className="material-symbols-outlined">error</span>
          <span className="flex-1">{error}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <LoadingBlock className="h-40" />
            <LoadingBlock className="h-40" />
            <LoadingBlock className="h-40" />
            <LoadingBlock className="h-40" />
          </>
        ) : (
          <>
            <StatCard label={t('fingerprints_total')} value={formatNumber(fingerprintTotal)} detail={t('fingerprints_registry_desc')} icon="fingerprint" color="#a855f7" />
            <StatCard label="Khí gas cao nhất" value={`${analytics.peaks.gas?.gas || 0} ppm`} detail={`${criticalPoints} mốc cần chú ý`} icon="gas_meter" color={COLORS.danger} />
            <StatCard label="Cửa đóng/mở" value={formatNumber(doorEventTotal)} detail={`${formatNumber(analytics.totals.doorOpen)} lần mở · ${formatNumber(analytics.totals.doorClose)} lần đóng`} icon="sensor_door" color={COLORS.success} />
            <StatCard label="Có chuyển động" value={formatNumber(motionTotal)} detail={`Cập nhật lúc ${formatDateTime(lastUpdated)}`} icon="motion_sensor_active" color={COLORS.access} />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-8">
          <SectionTitle
            label={t('overview_chart')}
            title={t('sensor_values_over_time')}
            action={<span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-black text-outline">{analytics.timeline.length} mốc</span>}
          />
          <div className="mb-4 flex flex-wrap gap-2">
            {localizedSensorSeries.map((item) => (
              <ToggleChip key={item.key} active={activeSensorKeys.includes(item.key)} onClick={() => toggleSensor(item.key)}>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </span>
              </ToggleChip>
            ))}
          </div>
          {loading ? <LoadingBlock className="h-80" /> : <LineChart data={analytics.timeline} series={selectedSensorSeries} title={t('sensor_values_over_time')} />}
        </Panel>

        <Panel className="xl:col-span-4">
          <SectionTitle label={t('common_values')} title={t('sensor_average_title')} />
          <div className="space-y-3">
            {localizedSensorSeries.map((item) => (
              <div key={item.key} className="rounded-2xl bg-surface-container-high/70 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex min-w-0 items-center gap-3 text-sm font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[20px]" style={{ color: item.color }}>{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="text-sm font-black" style={{ color: item.color }}>
                    {formatNumber(analytics.averages[item.key])} {item.unit}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-outline">
                  {dynamicThresholds[item.key]?.note}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7">
          <SectionTitle
            label="Xem từng cảm biến"
            title={`Chi tiết: ${selectedVolumeSensor.label}`}
            action={
              <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 text-xs font-black text-outline">
                <span className="material-symbols-outlined text-[16px]" style={{ color: selectedVolumeSensor.color }}>{selectedVolumeSensor.icon}</span>
                {selectedVolumeSensor.unit}
              </span>
            }
          />
          <div className="mb-4 flex flex-wrap gap-2">
            {volumeSensors.map((sensor) => (
              <ToggleChip
                key={sensor.key}
                active={selectedVolumeSensorKey === sensor.key}
                onClick={() => setSelectedVolumeSensorKey(sensor.key)}
                aria-label={`Xem chi tiết ${sensor.label}`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: sensor.color }} />
                  {sensor.label}
                </span>
              </ToggleChip>
            ))}
          </div>
          {loading ? <LoadingBlock className="h-72" /> : <SensorBarChart data={analytics.timeline} sensor={selectedVolumeSensor} />}
        </Panel>

        <Panel className="xl:col-span-5">
          <SectionTitle label={t('sensor_summary')} title={`${t('sensor_summary')}: ${selectedVolumeSensor.label}`} />
          {loading ? <LoadingBlock className="h-72" /> : (
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl bg-surface-container-high/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-outline">{primarySummaryLabel}</p>
                <p className="mt-2 text-3xl font-black" style={{ color: selectedVolumeSensor.color }}>
                  {formatNumber(primarySummaryValue)} {selectedVolumeSensor.unit}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-high/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-outline">{t('average')}</p>
                <p className="mt-2 text-3xl font-black" style={{ color: selectedVolumeSensor.color }}>
                  {formatNumber(selectedVolumeAverage)} {selectedVolumeSensor.unit}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-high/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-outline">{t('highest')}</p>
                <p className="mt-2 text-3xl font-black" style={{ color: selectedVolumeSensor.color }}>
                  {formatNumber(selectedVolumePeak)} {selectedVolumeSensor.unit}
                </p>
              </div>
              <div className="sm:col-span-3 xl:col-span-1">
                <ThresholdHint sensor={selectedVolumeSensor} value={selectedVolumePeak} thresholds={dynamicThresholds} />
              </div>
            </div>
          )}
        </Panel>
      </div>

      <DetailTimeline
        label={t('sensor_history')}
        title={`Các mốc thay đổi của ${selectedVolumeSensor.label}`}
        icon={selectedVolumeSensor.icon}
        color={selectedVolumeSensor.color}
        rows={selectedSensorRows}
        emptyText="Chưa có dữ liệu chi tiết cho cảm biến đang chọn."
        period={sensorHistoryPeriod}
        onPeriodChange={setSensorHistoryPeriod}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <DetailTimeline
          label="Lịch sử cửa"
          title="Các lần cửa đóng/mở"
          icon="sensor_door"
          color="#22c55e"
          rows={doorTimelineRows}
          emptyText="Chưa có dữ liệu đóng/mở cửa trong khoảng đang xem."
        />
        <DetailTimeline
          label="Lịch sử chuyển động"
          title="Các lần phát hiện chuyển động"
          icon="motion_sensor_active"
          color="#a855f7"
          rows={motionTimelineRows}
          emptyText="Chưa có dữ liệu chuyển động trong khoảng đang xem."
        />
        <DetailTimeline
          label="Lịch sử khí gas"
          title="Các lần khí gas vượt mức nguy hiểm"
          icon="gas_meter"
          color="#ef4444"
          rows={gasTimelineRows}
          emptyText="Không có mốc khí gas nguy hiểm trong khoảng đang xem."
        />
      </div>

      <Panel>
        <SectionTitle label={t('device_label')} title={t('device_sensor_status')} />
        {loading ? <LoadingBlock className="h-72" /> : <DeviceTable rows={analytics.deviceRows} formatDeviceName={formatDeviceName} />}
      </Panel>
    </div>
  );
};

export default Analytics;
