import React, { useEffect, useMemo, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { smartLockApi } from '../services/api';

const formatSignedRate = (value) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

const Analytics = () => {
  const { t } = useLang();
  const [snapshot, setSnapshot] = useState(null);
  const [weeklySnapshot, setWeeklySnapshot] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const [snapshotData, weeklyData, logsData] = await Promise.all([
        smartLockApi.getAnalyticsSnapshot(),
        smartLockApi.getWeeklySnapshot(),
        smartLockApi.getAccessLogs({ size: 50 }),
      ]);

      setSnapshot(snapshotData);
      setWeeklySnapshot(weeklyData);
      setRecentLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu phân tích hoạt động.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const eventBreakdown = useMemo(() => {
    const base = {
      success: 0,
      denied: 0,
      tampered: 0,
      remote: 0,
      fingerprint: 0,
    };

    recentLogs.forEach((log) => {
      if (log.action === 'UNLOCKED' || log.action === 'LOCKED' || log.action === 'SETTINGS_UPDATED') {
        base.success += 1;
      }
      if (log.action === 'DENIED') {
        base.denied += 1;
      }
      if (log.action === 'TAMPERED') {
        base.tampered += 1;
      }
      if (log.method === 'REMOTE') {
        base.remote += 1;
      }
      if (log.method === 'FINGERPRINT') {
        base.fingerprint += 1;
      }
    });

    return base;
  }, [recentLogs]);

  const successRate = useMemo(() => {
    const totalRelevant = eventBreakdown.success + eventBreakdown.denied + eventBreakdown.tampered;
    if (totalRelevant === 0) return 100;
    return (eventBreakdown.success / totalRelevant) * 100;
  }, [eventBreakdown]);

  const accessTrendEntries = useMemo(
    () => Object.entries(weeklySnapshot?.dailyAccessTrend || {}),
    [weeklySnapshot]
  );

  const alertTrendEntries = useMemo(
    () => Object.entries(weeklySnapshot?.dailyAlertTrend || {}),
    [weeklySnapshot]
  );

  const maxAccess = Math.max(...accessTrendEntries.map(([, value]) => value), 1);
  const maxAlert = Math.max(...alertTrendEntries.map(([, value]) => value), 1);

  const topEvents = useMemo(
    () => recentLogs.slice(0, 6).map((log) => ({
      id: log.id,
      title: log.personName || log.userName || log.deviceName || 'Sự kiện hệ thống',
      detail: log.detail || `${log.action} via ${log.method}`,
      badge: log.action,
      createdAt: log.createdAt,
    })),
    [recentLogs]
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-headline font-bold tracking-tight uppercase text-on-surface">Phân tích hoạt động</h2>
          <p className="text-outline font-body">
            Theo dõi truy cập, cảnh báo và trạng thái thiết bị theo thời gian thực để quản lý hệ thống tốt hơn.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary-container to-primary px-5 py-3 text-sm font-bold text-on-primary-container transition hover:opacity-95"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Làm mới phân tích
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-error/20 bg-error/10 px-5 py-4 text-sm text-error">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Lượt truy cập hôm nay',
            value: snapshot?.accessLogsToday ?? 0,
            icon: 'door_front',
            accent: 'text-primary bg-primary/10 border-primary/20',
          },
          {
            label: 'Cảnh báo hôm nay',
            value: snapshot?.totalAlertsToday ?? 0,
            icon: 'warning',
            accent: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'Cảnh báo nghiêm trọng',
            value: snapshot?.criticalAlertsToday ?? 0,
            icon: 'crisis_alert',
            accent: 'text-error bg-error/10 border-error/20',
          },
          {
            label: 'Thiết bị đang online',
            value: `${snapshot?.onlineDevices ?? 0}/${snapshot?.totalDevices ?? 0}`,
            icon: 'sensors',
            accent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-outline-variant/10 bg-surface-container p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.accent}`}>
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              </div>
              {loading && <span className="text-xs text-outline">Đang tải...</span>}
            </div>
            <p className="text-sm text-outline">{item.label}</p>
            <p className="mt-2 text-4xl font-black tracking-tight text-on-surface">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-8 rounded-[2rem] border border-outline-variant/10 bg-surface-container p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Tổng quan 7 ngày</p>
              <h3 className="mt-2 text-2xl font-headline font-bold text-on-surface">Xu hướng truy cập và cảnh báo</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-outline">
                {weeklySnapshot?.progressSummary || 'Dữ liệu sẽ xuất hiện sau khi hệ thống đồng bộ các bản ghi truy cập và cảnh báo.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-container-high px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-outline">Biến động truy cập</p>
                <p className={`mt-2 text-2xl font-bold ${weeklySnapshot?.accessChangeRate >= 0 ? 'text-emerald-500' : 'text-error'}`}>
                  {formatSignedRate(weeklySnapshot?.accessChangeRate ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-high px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-outline">Biến động cảnh báo</p>
                <p className={`mt-2 text-2xl font-bold ${weeklySnapshot?.alertChangeRate <= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {formatSignedRate(weeklySnapshot?.alertChangeRate ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-surface-container-high p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-outline">Lượt truy cập theo ngày</p>
                  <p className="mt-1 text-sm text-on-surface">Tổng tuần này: {weeklySnapshot?.totalAccessThisWeek ?? 0}</p>
                </div>
                <span className="material-symbols-outlined text-primary">show_chart</span>
              </div>
              <div className="flex h-56 items-end gap-3">
                {accessTrendEntries.map(([label, value]) => (
                  <div key={label} className="flex flex-1 flex-col items-center gap-3">
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-primary to-primary-container shadow-[0_12px_24px_rgba(15,98,254,0.18)]"
                        style={{ height: `${Math.max((value / maxAccess) * 100, value > 0 ? 10 : 4)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-on-surface">{value}</p>
                      <p className="text-[10px] uppercase tracking-widest text-outline">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-surface-container-high p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-outline">Cảnh báo theo ngày</p>
                  <p className="mt-1 text-sm text-on-surface">Cảnh báo tuần này: {weeklySnapshot?.alertsThisWeek ?? 0}</p>
                </div>
                <span className="material-symbols-outlined text-amber-500">stacked_bar_chart</span>
              </div>
              <div className="flex h-56 items-end gap-3">
                {alertTrendEntries.map(([label, value]) => (
                  <div key={label} className="flex flex-1 flex-col items-center gap-3">
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-amber-500 to-orange-300 shadow-[0_12px_24px_rgba(245,158,11,0.18)]"
                        style={{ height: `${Math.max((value / maxAlert) * 100, value > 0 ? 10 : 4)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-on-surface">{value}</p>
                      <p className="text-[10px] uppercase tracking-widest text-outline">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="xl:col-span-4 rounded-[2rem] border border-outline-variant/10 bg-surface-container p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Chỉ số quản lý</p>
            <h3 className="mt-2 text-2xl font-headline font-bold text-on-surface">Chất lượng hoạt động</h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">Tỷ lệ thao tác thành công</span>
                <span className="text-2xl font-black text-primary">{successRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-inverse-primary" style={{ width: `${Math.max(successRate, 6)}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-container-high px-4 py-4">
                <p className="text-[10px] uppercase tracking-widest text-outline">Từ chối truy cập</p>
                <p className="mt-2 text-2xl font-bold text-error">{weeklySnapshot?.failedAttemptsThisWeek ?? eventBreakdown.denied}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-high px-4 py-4">
                <p className="text-[10px] uppercase tracking-widest text-outline">Cảnh báo nghiêm trọng</p>
                <p className="mt-2 text-2xl font-bold text-amber-500">{weeklySnapshot?.criticalAlertsThisWeek ?? 0}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-high p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-outline">Phân loại sự kiện gần đây</p>
              <div className="mt-4 space-y-3">
                {[
                  ['Điều khiển từ xa', eventBreakdown.remote],
                  ['Vân tay', eventBreakdown.fingerprint],
                  ['Từ chối', eventBreakdown.denied],
                  ['Can thiệp bất thường', eventBreakdown.tampered],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-outline">{label}</span>
                    <span className="font-bold text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-outline-variant/10 bg-surface-container p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Dòng sự kiện gần nhất</p>
            <h3 className="mt-2 text-2xl font-headline font-bold text-on-surface">Các hoạt động cần quản lý chú ý</h3>
          </div>
          <p className="text-sm text-outline">Lấy từ các bản ghi truy cập mới nhất trong hệ thống.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-surface-container-high" />
            ))}
          </div>
        ) : topEvents.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high px-5 py-10 text-center text-outline">
            Chưa có dữ liệu hoạt động gần đây để phân tích.
          </div>
        ) : (
          <div className="space-y-4">
            {topEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-high px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[20px]">monitoring</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{event.title}</p>
                    <p className="mt-1 text-sm leading-6 text-outline">{event.detail}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  <span className="inline-flex w-fit items-center rounded-full bg-surface-container px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-outline">
                    {event.badge}
                  </span>
                  <span className="text-xs text-outline">
                    {event.createdAt ? new Date(event.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Không rõ thời gian'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Analytics;
