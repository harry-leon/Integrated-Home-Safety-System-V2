import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { smartLockApi } from '../services/api';

const eventTypes = [
  { id: 'ALL', labelKey: 'all' },
  { id: 'ACCESS', labelKey: 'access_event' },
  { id: 'WARNING', labelKey: 'warning_event' },
  { id: 'COMMAND', labelKey: 'command_event' },
];

const timeRanges = [
  { value: 'ALL', labelKey: 'all_time' },
  { value: 'TODAY', labelKey: 'today' },
  { value: 'WEEK', labelKey: 'last_7_days' },
  { value: 'MONTH', labelKey: 'this_month' },
];

const getDateFilter = (timeRange) => {
  const now = new Date();
  if (timeRange === 'TODAY') {
    return {
      start: new Date(now.setHours(0, 0, 0, 0)).toISOString().replace('Z', ''),
      end: new Date().toISOString().replace('Z', ''),
    };
  }
  if (timeRange === 'WEEK') {
    return {
      start: new Date(now.setDate(now.getDate() - 7)).toISOString().replace('Z', ''),
      end: new Date().toISOString().replace('Z', ''),
    };
  }
  if (timeRange === 'MONTH') {
    return {
      start: new Date(now.setMonth(now.getMonth() - 1)).toISOString().replace('Z', ''),
      end: new Date().toISOString().replace('Z', ''),
    };
  }
  return { start: null, end: null };
};

const getLogType = (log, t) => {
  if (log.action === 'TAMPERED' || log.action === 'DENIED' || log.action === 'ALARM') {
    return { id: 'WARNING', label: t('warning_event'), icon: 'warning', color: 'orange', entityIcon: 'lock' };
  }
  if (log.method === 'REMOTE' || log.method === 'SYSTEM') {
    return { id: 'COMMAND', label: t('command_event'), icon: 'terminal', color: 'purple', entityIcon: 'shield' };
  }
  return { id: 'ACCESS', label: t('access_event'), icon: 'person', color: 'blue', entityIcon: 'person' };
};

const getStatus = (log, t) => {
  if (log.action === 'DENIED') return { label: t('action_denied'), color: 'red' };
  if (log.action === 'TAMPERED' || log.action === 'ALARM') return { label: t('action_warning'), color: 'red' };
  return { label: t('action_success'), color: 'emerald' };
};

const Logs = () => {
  const {
    t,
    locale,
    formatAccessAction,
    formatAccessMethod,
    formatDeviceName,
    translateSystemText,
  } = useLang();

  const [logs, setLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [timeRange, setTimeRange] = useState('ALL');
  const [eventType, setEventType] = useState('ALL');

  const formatLog = useCallback((log) => {
    const dateObj = new Date(log.createdAt);
    const logType = getLogType(log, t);
    const status = getStatus(log, t);
    return {
      id: log.id,
      time: dateObj.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: dateObj.toLocaleDateString(locale),
      typeId: logType.id,
      type: logType.label,
      typeIcon: logType.icon,
      typeColor: logType.color,
      entityIcon: logType.entityIcon,
      entity: log.personName || log.userName || formatDeviceName(log.deviceName) || t('unknown_info'),
      detail: log.detail
        ? translateSystemText(log.detail)
        : `${formatAccessAction(log.action)} · ${formatAccessMethod(log.method)}`,
      method: formatAccessMethod(log.method),
      status: status.label,
      statusColor: status.color,
    };
  }, [formatAccessAction, formatAccessMethod, formatDeviceName, locale, t, translateSystemText]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { start, end } = getDateFilter(timeRange);
      const data = await smartLockApi.getAccessLogs({
        deviceId: selectedDevice || undefined,
        start: start || undefined,
        end: end || undefined,
      });
      const formatted = Array.isArray(data) ? data.map(formatLog) : [];
      setLogs(eventType === 'ALL' ? formatted : formatted.filter((item) => item.typeId === eventType));
    } catch (err) {
      setError(err.message || t('fingerprints_load_error'));
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [eventType, formatLog, selectedDevice, t, timeRange]);

  useEffect(() => {
    fetchLogs();
    smartLockApi.getDevices()
      .then((data) => setDevices(Array.isArray(data) ? data : []))
      .catch(() => setDevices([]));
  }, [fetchLogs]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const { start, end } = getDateFilter(timeRange);
      const blob = await smartLockApi.exportLogs({
        deviceId: selectedDevice || undefined,
        start: start || undefined,
        end: end || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`${t('export_csv')}: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const deviceOptions = useMemo(() => devices.map((device) => ({
    id: device.id,
    name: formatDeviceName(device.deviceName),
  })), [devices, formatDeviceName]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <section className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-outline-variant/10 pb-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black font-headline tracking-tighter text-on-surface mb-2 uppercase">{t('logs_title')}</h2>
            <p className="text-outline text-sm sm:text-lg">{t('logs_desc')}</p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-container to-primary text-on-primary-container rounded-xl font-bold tracking-tight shadow-sm hover:scale-[0.98] transition-all duration-200 w-full sm:w-auto ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined">{isExporting ? 'sync' : 'description'}</span>
            {isExporting ? t('loading') : t('export_csv')}
          </button>
        </div>
      </section>

      <section>
        <div className="bg-surface-container rounded-2xl p-6 flex flex-wrap items-center gap-6 shadow-sm border border-outline-variant/10">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest pl-1">{t('choose_device')}</label>
            <select
              value={selectedDevice}
              onChange={(event) => setSelectedDevice(event.target.value)}
              className="bg-surface-container-high border-none outline-none rounded-lg text-sm text-on-surface px-4 py-2.5 focus:ring-1 focus:ring-primary w-full"
            >
              <option value="">{t('all_devices')}</option>
              {deviceOptions.map((device) => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest pl-1">{t('time_range')}</label>
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value)}
              className="bg-surface-container-high border-none outline-none rounded-lg text-sm text-on-surface px-4 py-2.5 focus:ring-1 focus:ring-primary w-full"
            >
              {timeRanges.map((item) => (
                <option key={item.value} value={item.value}>{t(item.labelKey)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 flex-[1.5] min-w-[300px]">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest pl-1">{t('event_type')}</label>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setEventType(item.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    eventType === item.id
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container-high text-outline hover:text-on-surface'
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchLogs}
            className="ml-auto p-2.5 bg-surface-container-high text-outline rounded-xl hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            aria-label={t('view_all')}
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-error/20 bg-error/8 px-4 py-3 text-sm font-semibold text-error">
          {translateSystemText(error)}
        </div>
      ) : null}

      <section>
        <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('time')}</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('event_type')}</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('actor')}</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('action_detail')}</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-6"><div className="h-12 rounded-xl bg-surface-container-highest" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-outline">
                      <span className="material-symbols-outlined mb-2 text-4xl opacity-20">history</span>
                      <p>{t('no_matching_logs')}</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-highest/20 transition-colors">
                      <td className="px-6 py-6">
                        <p className="text-sm font-bold text-on-surface">{log.time}</p>
                        <p className="mt-1 text-[10px] text-outline">{log.date}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-${log.typeColor}-500/10 text-${log.typeColor}-500 text-[10px] font-bold uppercase tracking-wider border border-${log.typeColor}-500/20`}>
                          <span className={`h-1.5 w-1.5 rounded-full bg-${log.typeColor}-500`} />
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/10 bg-surface-container-highest text-on-surface">
                            <span className="material-symbols-outlined text-sm">{log.entityIcon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{log.entity}</p>
                            <p className="mt-1 text-xs text-outline">{log.method}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="max-w-sm text-sm leading-relaxed text-outline">{log.detail}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center gap-1.5 rounded-full bg-${log.statusColor}-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-${log.statusColor}-500`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && logs.length > 0 ? (
            <div className="flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low px-6 py-4">
              <p className="hidden text-xs text-outline sm:block">{t('showing_filtered_results')}</p>
              <div className="mx-auto flex items-center gap-2 sm:mx-0">
                <button disabled className="rounded-lg p-2 text-outline opacity-30">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="h-8 w-8 rounded-lg bg-primary text-xs font-bold text-on-primary shadow-sm">1</button>
                <button disabled className="rounded-lg p-2 text-outline opacity-30">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Logs;
