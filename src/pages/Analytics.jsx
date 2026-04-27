import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { smartLockApi } from '../services/api';

const COLORS = {
  access: '#38bdf8',
  alert: '#f59e0b',
  success: '#22c55e',
  danger: '#ef4444',
  purple: '#a855f7',
  cyan: '#2dd4bf',
  blue: '#0f62fe',
  muted: '#64748b',
};

const ACTION_META = {
  UNLOCKED: { label: 'Mo khoa', color: COLORS.success, icon: 'lock_open' },
  LOCKED: { label: 'Khoa cua', color: COLORS.blue, icon: 'lock' },
  DENIED: { label: 'Tu choi', color: COLORS.danger, icon: 'block' },
  TAMPERED: { label: 'Can thiep', color: COLORS.alert, icon: 'warning' },
  SETTINGS_UPDATED: { label: 'Cai dat', color: COLORS.cyan, icon: 'settings' },
};

const METHOD_META = {
  REMOTE: { label: 'Remote', color: COLORS.blue },
  FINGERPRINT: { label: 'Van tay', color: COLORS.purple },
  APP: { label: 'Ung dung', color: COLORS.access },
  KEYPAD: { label: 'Keypad', color: COLORS.cyan },
};

const SEVERITY_META = {
  CRITICAL: { label: 'Nguy cap', color: COLORS.danger },
  HIGH: { label: 'Cao', color: COLORS.alert },
  MEDIUM: { label: 'Trung binh', color: COLORS.access },
  LOW: { label: 'Thap', color: COLORS.success },
};

const EMPTY_WEEK = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'];

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0));

const formatPercent = (value) => `${Number(value || 0).toFixed(0)}%`;

const formatChange = (value) => {
  if (value == null) return '0.0%';
  const sign = Number(value) > 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(1)}%`;
};

const formatDateTime = (value) => {
  if (!value) return 'Chua co moc thoi gian';
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const relativeTime = (value) => {
  if (!value) return 'Chua cap nhat';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} phut truoc`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} gio truoc`;
  return `${Math.floor(hours / 24)} ngay truoc`;
};

const mapTrend = (trend = {}) => {
  const entries = Object.entries(trend || {});
  if (entries.length) {
    return entries.map(([label, value]) => ({ label, value: Number(value || 0) }));
  }
  return EMPTY_WEEK.map((label) => ({ label, value: 0 }));
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const Panel = ({ children, className = '' }) => (
  <section
    className={`relative overflow-hidden rounded-[1.75rem] border border-outline-variant/12 bg-surface-container p-5 shadow-sm ${className}`}
  >
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

const EmptyState = ({ title = 'Chua co du lieu', detail = 'He thong se hien thi khi backend ghi nhan du lieu moi.' }) => (
  <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-high/50 px-4 py-6 text-center">
    <span className="material-symbols-outlined text-3xl text-outline">query_stats</span>
    <p className="mt-2 text-sm font-bold text-on-surface">{title}</p>
    <p className="mt-1 max-w-sm text-xs leading-5 text-outline">{detail}</p>
  </div>
);

const Sparkline = ({ data = [], color = COLORS.access }) => {
  const values = data.map((item) => Number(item.value ?? item ?? 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 116 + 2;
    const y = 38 - ((value - min) / range) * 34;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg viewBox="0 0 120 42" className="h-11 w-28" aria-hidden="true">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length ? <circle cx={points.at(-1).split(',')[0]} cy={points.at(-1).split(',')[1]} r="3" fill={color} /> : null}
    </svg>
  );
};

const KpiCard = ({ label, value, detail, icon, color, trend, spark }) => (
  <div className="group relative overflow-hidden rounded-[1.5rem] border border-outline-variant/12 bg-surface-container p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/25">
    <div
      className="absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] opacity-10"
      style={{ background: color }}
      aria-hidden="true"
    />
    <div className="relative flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${color}18`, color }}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-outline">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-on-surface">{value}</p>
        </div>
      </div>
      {spark ? <Sparkline data={spark} color={color} /> : null}
    </div>
    <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-outline">{detail}</p>
      {trend != null ? (
        <span
          className="rounded-full px-2.5 py-1 text-xs font-black"
          style={{
            background: Number(trend) >= 0 ? `${COLORS.success}16` : `${COLORS.danger}16`,
            color: Number(trend) >= 0 ? COLORS.success : COLORS.danger,
          }}
        >
          {formatChange(trend)}
        </span>
      ) : null}
    </div>
  </div>
);

const AreaChart = ({ accessData, alertData }) => {
  const width = 720;
  const height = 280;
  const pad = { top: 18, right: 20, bottom: 38, left: 42 };
  const labels = accessData.map((item) => item.label);
  const allValues = [...accessData, ...alertData].map((item) => item.value);
  const max = Math.max(...allValues, 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const x = (index) => pad.left + (index / Math.max(labels.length - 1, 1)) * innerW;
  const y = (value) => pad.top + innerH - (Number(value || 0) / max) * innerH;

  const makePath = (data) =>
    data
      .map((item, index) => {
        const currentX = x(index);
        const currentY = y(item.value);
        if (index === 0) return `M${currentX},${currentY}`;
        const prevX = x(index - 1);
        const prevY = y(data[index - 1].value);
        const midX = (prevX + currentX) / 2;
        return `C${midX},${prevY} ${midX},${currentY} ${currentX},${currentY}`;
      })
      .join(' ');

  const accessPath = makePath(accessData);
  const alertPath = makePath(alertData);
  const areaPath = `${accessPath} L${x(accessData.length - 1)},${pad.top + innerH} L${x(0)},${pad.top + innerH} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((tick) => Math.round(tick * max));

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-surface-container-high/50 px-2 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Bieu do xu huong truy cap va canh bao trong 7 ngay">
        <defs>
          <linearGradient id="access-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.access} stopOpacity="0.28" />
            <stop offset="100%" stopColor={COLORS.access} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick, index) => (
          <g key={`${tick}-${index}`}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="currentColor" strokeOpacity="0.08" />
            <text x={pad.left - 10} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.45">
              {tick}
            </text>
          </g>
        ))}

        {labels.map((label, index) => (
          <text key={`${label}-${index}`} x={x(index)} y={height - 12} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.55">
            {label}
          </text>
        ))}

        <path d={areaPath} fill="url(#access-area)" />
        <path d={accessPath} fill="none" stroke={COLORS.access} strokeWidth="3" strokeLinecap="round" />
        <path d={alertPath} fill="none" stroke={COLORS.alert} strokeWidth="3" strokeLinecap="round" strokeDasharray="8 8" />

        {accessData.map((item, index) => (
          <circle key={`a-${item.label}-${index}`} cx={x(index)} cy={y(item.value)} r="4" fill={COLORS.access} stroke="var(--color-surface-container)" strokeWidth="2" />
        ))}
        {alertData.map((item, index) => (
          <g key={`b-${item.label}-${index}`}>
            <rect x={x(index) - 4} y={y(item.value) - 4} width="8" height="8" rx="2" fill={COLORS.alert} />
          </g>
        ))}
      </svg>
    </div>
  );
};

const DonutChart = ({ segments, centerValue, centerLabel }) => {
  const size = 170;
  const radius = 58;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  const arcs = segments.reduce((items, segment) => {
    const dash = (segment.value / total) * circumference;
    const previousOffset = items.length ? items[items.length - 1].nextOffset : 0;
    items.push({
      ...segment,
      dash,
      offset: previousOffset,
      nextOffset: previousOffset + dash,
    });
    return items;
  }, []);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-44 w-44 shrink-0" role="img" aria-label="Bieu do vong ti le su kien">
        <circle cx="85" cy="85" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={stroke} />
        {arcs.map((segment) => (
          <circle
            key={segment.label}
            cx="85"
            cy="85"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(segment.dash - 3, 0)} ${circumference}`}
            strokeDashoffset={-(segment.offset - circumference * 0.25)}
          />
        ))}
        <text x="85" y="80" textAnchor="middle" fontSize="25" fontWeight="900" fill="currentColor">
          {centerValue}
        </text>
        <text x="85" y="101" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" opacity="0.5">
          {centerLabel}
        </text>
      </svg>
      <div className="min-w-0 flex-1 space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
            <span className="flex-1 text-sm font-semibold text-on-surface">{segment.label}</span>
            <span className="text-sm font-black" style={{ color: segment.color }}>
              {formatNumber(segment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, color = COLORS.access }) => {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex h-56 items-end gap-2 rounded-2xl bg-surface-container-high/50 px-3 pb-3 pt-6">
      {data.map((item) => {
        const height = clamp((item.value / max) * 100, item.value > 0 ? 8 : 2, 100);
        return (
          <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-black text-on-surface">{formatNumber(item.value)}</span>
            <div className="w-full rounded-t-2xl" style={{ height: `${height}%`, background: `linear-gradient(180deg, ${color}, ${color}88)` }} />
            <span className="w-full truncate text-center text-[11px] font-semibold text-outline">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const Gauge = ({ value }) => {
  const safeValue = clamp(Number(value || 0), 0, 100);
  const color = safeValue >= 80 ? COLORS.success : safeValue >= 50 ? COLORS.alert : COLORS.danger;
  const radius = 70;
  const circumference = Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 190 120" className="h-36 w-full max-w-56" role="img" aria-label={`Suc khoe thiet bi ${safeValue.toFixed(0)} phan tram`}>
        <path d="M25 95 A70 70 0 0 1 165 95" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="18" strokeLinecap="round" />
        <path
          d="M25 95 A70 70 0 0 1 165 95"
          fill="none"
          stroke={color}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${(safeValue / 100) * circumference} ${circumference}`}
        />
        <text x="95" y="80" textAnchor="middle" fontSize="32" fontWeight="900" fill={color}>
          {safeValue.toFixed(0)}
        </text>
        <text x="95" y="102" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor" opacity="0.5">
          HEALTH SCORE
        </text>
      </svg>
    </div>
  );
};

const HorizontalBars = ({ data }) => {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-on-surface">{item.label}</span>
            <span className="text-sm font-black" style={{ color: item.color }}>
              {formatNumber(item.value)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const EventTimeline = ({ events }) => {
  if (!events.length) return <EmptyState title="Chua co su kien gan day" detail="Nhat ky truy cap se xuat hien tai day sau khi co thao tac khoa/mo cua." />;

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const meta = ACTION_META[event.action] || { label: event.action || 'Su kien', color: COLORS.muted, icon: 'fiber_manual_record' };
        return (
          <div key={event.id || `${event.createdAt}-${event.action}`} className="grid gap-3 rounded-2xl bg-surface-container-high/70 p-4 sm:grid-cols-[44px_minmax(0,1fr)_120px] sm:items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${meta.color}16`, color: meta.color }}>
              <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black text-on-surface">{meta.label}</p>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-outline">{event.method || 'SYSTEM'}</span>
              </div>
              <p className="mt-1 truncate text-sm text-outline">
                {event.detail || event.personName || event.userName || event.deviceName || 'He thong ghi nhan su kien'}
              </p>
            </div>
            <p className="text-xs font-semibold text-outline sm:text-right">{relativeTime(event.createdAt)}</p>
          </div>
        );
      })}
    </div>
  );
};

const DeviceGrid = ({ devices }) => {
  if (!devices.length) return <EmptyState title="Chua co thiet bi" detail="Khi backend tra ve danh sach thiet bi, trang thai online va cam bien se duoc cap nhat tai day." />;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {devices.map((device) => (
        <div key={device.id || device.deviceCode} className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-on-surface">{device.deviceName || device.deviceCode || 'Smart lock'}</p>
              <p className="mt-1 text-xs font-semibold text-outline">{device.deviceCode || 'No code'}</p>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-black"
              style={{
                background: device.online ? `${COLORS.success}16` : `${COLORS.danger}16`,
                color: device.online ? COLORS.success : COLORS.danger,
              }}
            >
              {device.online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface px-2 py-2">
              <p className="text-sm font-black text-on-surface">{device.temperature ?? '--'}</p>
              <p className="text-[10px] font-bold text-outline">C</p>
            </div>
            <div className="rounded-xl bg-surface px-2 py-2">
              <p className="text-sm font-black text-on-surface">{device.gasValue ?? '--'}</p>
              <p className="text-[10px] font-bold text-outline">Gas</p>
            </div>
            <div className="rounded-xl bg-surface px-2 py-2">
              <p className="text-sm font-black text-on-surface">{device.ldrValue ?? '--'}</p>
              <p className="text-[10px] font-bold text-outline">Lux</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-outline">Cap nhat {relativeTime(device.lastSensorAt || device.lastSeen)}</p>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [weeklySnapshot, setWeeklySnapshot] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(30);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [snap, weekly, logs, alertData, deviceData] = await Promise.all([
        smartLockApi.getAnalyticsSnapshot(),
        smartLockApi.getWeeklySnapshot(),
        smartLockApi.getAccessLogs({ page: 0, size: 60 }),
        smartLockApi.getAlerts({ page: 0, size: 40 }),
        smartLockApi.getDevices(),
      ]);
      setSnapshot(snap || null);
      setWeeklySnapshot(weekly || null);
      setRecentLogs(Array.isArray(logs) ? logs : []);
      setAlerts(Array.isArray(alertData) ? alertData : []);
      setDevices(Array.isArray(deviceData) ? deviceData : []);
      setLastUpdated(new Date());
      setCountdown(30);
    } catch (err) {
      setError(err.message || 'Khong the tai du lieu phan tich.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          loadAll();
          return 30;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadAll]);

  const accessTrendData = useMemo(() => mapTrend(weeklySnapshot?.dailyAccessTrend), [weeklySnapshot]);
  const alertTrendData = useMemo(() => mapTrend(weeklySnapshot?.dailyAlertTrend), [weeklySnapshot]);

  const actionBreakdown = useMemo(() => {
    const totals = Object.keys(ACTION_META).map((action) => ({
      ...ACTION_META[action],
      key: action,
      value: 0,
    }));
    recentLogs.forEach((log) => {
      const item = totals.find((entry) => entry.key === log.action);
      if (item) item.value += 1;
    });
    return totals;
  }, [recentLogs]);

  const methodBreakdown = useMemo(() => {
    const totals = Object.keys(METHOD_META).map((method) => ({
      ...METHOD_META[method],
      key: method,
      value: 0,
    }));
    recentLogs.forEach((log) => {
      const item = totals.find((entry) => entry.key === log.method);
      if (item) item.value += 1;
    });
    return totals;
  }, [recentLogs]);

  const severityBreakdown = useMemo(() => {
    const totals = Object.keys(SEVERITY_META).map((severity) => ({
      ...SEVERITY_META[severity],
      key: severity,
      value: 0,
    }));
    alerts.forEach((alert) => {
      const item = totals.find((entry) => entry.key === alert.severity);
      if (item) item.value += 1;
    });
    return totals.filter((item) => item.value > 0);
  }, [alerts]);

  const eventSegments = useMemo(() => {
    const success = recentLogs.filter((log) => ['UNLOCKED', 'LOCKED', 'SETTINGS_UPDATED'].includes(log.action)).length;
    const denied = recentLogs.filter((log) => log.action === 'DENIED').length;
    const tampered = recentLogs.filter((log) => log.action === 'TAMPERED').length;
    const segments = [
      { label: 'Thanh cong', value: success, color: COLORS.success },
      { label: 'Tu choi', value: denied, color: COLORS.danger },
      { label: 'Can thiep', value: tampered, color: COLORS.alert },
    ].filter((item) => item.value > 0);
    return segments.length ? segments : [{ label: 'Chua co su kien', value: 1, color: COLORS.muted }];
  }, [recentLogs]);

  const totalClassifiedEvents = eventSegments.reduce((sum, item) => sum + item.value, 0);
  const successRate = totalClassifiedEvents && eventSegments[0]?.label === 'Thanh cong'
    ? (eventSegments[0].value / totalClassifiedEvents) * 100
    : recentLogs.length === 0
      ? 100
      : 0;

  const healthScore = Number(snapshot?.deviceHealthScore || 0);
  const activeAlerts = alerts.filter((alert) => !alert.resolved);
  const onlineDevices = devices.filter((device) => device.online).length;
  const highRiskCount = alerts.filter((alert) => ['CRITICAL', 'HIGH'].includes(alert.severity)).length;

  return (
    <div className="space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container p-6 shadow-sm sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_34%)]" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-outline">Sentinel analytics</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-on-surface sm:text-5xl">
              Phan tich van hanh theo du lieu backend
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-outline sm:text-base">
              Dashboard tong hop snapshot, bao cao 7 ngay, nhat ky truy cap, canh bao va trang thai thiet bi de theo doi an toan nha thong minh theo thoi gian gan thuc.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-surface-container-high px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Lan cap nhat</p>
              <p className="mt-1 text-sm font-black text-on-surface">{lastUpdated ? lastUpdated.toLocaleTimeString('vi-VN') : 'Dang tai'}</p>
            </div>
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[19px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Lam moi {countdown}s
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm font-semibold text-error">
          <span className="material-symbols-outlined">error</span>
          <span className="flex-1">{error}</span>
          <button type="button" onClick={loadAll} className="cursor-pointer rounded-xl bg-red-500/10 px-3 py-2 font-black">
            Thu lai
          </button>
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
            <KpiCard
              label="Truy cap hom nay"
              value={formatNumber(snapshot?.accessLogsToday)}
              detail={`${formatNumber(weeklySnapshot?.totalAccessThisWeek)} trong 7 ngay`}
              icon="door_front"
              color={COLORS.access}
              trend={weeklySnapshot?.accessChangeRate}
              spark={accessTrendData}
            />
            <KpiCard
              label="Canh bao hom nay"
              value={formatNumber(snapshot?.totalAlertsToday)}
              detail={`${formatNumber(activeAlerts.length)} canh bao dang mo`}
              icon="warning"
              color={COLORS.alert}
              trend={weeklySnapshot?.alertChangeRate}
              spark={alertTrendData}
            />
            <KpiCard
              label="Rui ro cao"
              value={formatNumber(snapshot?.criticalAlertsToday ?? highRiskCount)}
              detail={`${formatNumber(highRiskCount)} muc high/critical trong danh sach`}
              icon="emergency"
              color={COLORS.danger}
            />
            <KpiCard
              label="Suc khoe thiet bi"
              value={formatPercent(healthScore)}
              detail={`${formatNumber(snapshot?.onlineDevices ?? onlineDevices)}/${formatNumber(snapshot?.totalDevices ?? devices.length)} online`}
              icon="sensors"
              color={COLORS.success}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-8">
          <SectionTitle
            label="7 ngay qua"
            title="Xu huong truy cap va canh bao"
            action={
              <div className="flex items-center gap-4 text-xs font-bold text-outline">
                <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 rounded-full" style={{ background: COLORS.access }} />Truy cap</span>
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: COLORS.alert }} />Canh bao</span>
              </div>
            }
          />
          {loading ? <LoadingBlock className="h-72" /> : <AreaChart accessData={accessTrendData} alertData={alertTrendData} />}
          <p className="mt-4 rounded-2xl bg-surface-container-high/60 px-4 py-3 text-sm leading-6 text-outline">
            {weeklySnapshot?.progressSummary || 'Chua co tong hop tu backend cho khoang 7 ngay gan nhat.'}
          </p>
        </Panel>

        <Panel className="xl:col-span-4">
          <SectionTitle label="Ty le su kien" title="Thanh cong / tu choi / can thiep" />
          {loading ? <LoadingBlock className="h-64" /> : (
            <DonutChart segments={eventSegments} centerValue={formatPercent(successRate)} centerLabel="success" />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-4">
          <SectionTitle label="Device health" title="Trang thai doi thiet bi" />
          {loading ? <LoadingBlock className="h-64" /> : (
            <>
              <Gauge value={healthScore} />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-surface-container-high p-3">
                  <p className="text-2xl font-black text-on-surface">{formatNumber(snapshot?.totalDevices ?? devices.length)}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-outline">Tong</p>
                </div>
                <div className="rounded-2xl bg-surface-container-high p-3">
                  <p className="text-2xl font-black" style={{ color: COLORS.success }}>{formatNumber(snapshot?.onlineDevices ?? onlineDevices)}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-outline">Online</p>
                </div>
                <div className="rounded-2xl bg-surface-container-high p-3">
                  <p className="text-2xl font-black" style={{ color: COLORS.danger }}>{formatNumber((snapshot?.totalDevices ?? devices.length) - (snapshot?.onlineDevices ?? onlineDevices))}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-outline">Offline</p>
                </div>
              </div>
            </>
          )}
        </Panel>

        <Panel className="xl:col-span-4">
          <SectionTitle label="Access methods" title="Nguon thao tac khoa cua" />
          {loading ? <LoadingBlock className="h-64" /> : <HorizontalBars data={methodBreakdown} />}
        </Panel>

        <Panel className="xl:col-span-4">
          <SectionTitle label="Alert severity" title="Muc do canh bao" />
          {loading ? <LoadingBlock className="h-64" /> : (
            severityBreakdown.length ? <HorizontalBars data={severityBreakdown} /> : <EmptyState title="Khong co canh bao" detail="Danh sach alert hien tai khong co severity nao de thong ke." />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-5">
          <SectionTitle label="Access volume" title="Luot truy cap theo ngay" />
          {loading ? <LoadingBlock className="h-64" /> : <BarChart data={accessTrendData} color={COLORS.blue} />}
        </Panel>

        <Panel className="xl:col-span-7">
          <SectionTitle
            label="Recent events"
            title="Dong thoi gian truy cap"
            action={<span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-black text-outline">{formatNumber(recentLogs.length)} log</span>}
          />
          {loading ? <LoadingBlock className="h-80" /> : <EventTimeline events={recentLogs.slice(0, 8)} />}
        </Panel>
      </div>

      <Panel>
        <SectionTitle
          label="Live device inventory"
          title="Thiet bi va cam bien tu backend"
          action={<span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />{formatNumber(onlineDevices)} online</span>}
        />
        {loading ? <LoadingBlock className="h-48" /> : <DeviceGrid devices={devices} />}
      </Panel>
    </div>
  );
};

export default Analytics;
