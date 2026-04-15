import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useTimeWeather } from '../contexts/TimeWeatherContext';
import { smartLockApi } from '../services/api';

const Dashboard = () => {
  const { t } = useLang();
  const { weather } = useTimeWeather();
  const [wifiSignal, setWifiSignal] = useState(92);
  const [alerts, setAlerts] = useState([]);
  const [weeklySnap, setWeeklySnap] = useState(null);
  const [devices, setDevices] = useState([]);
  const [lockState, setLockState] = useState('locked');
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [isLoadingSnap, setIsLoadingSnap] = useState(true);

  const primaryDevice = devices[0] || null;
  const recentAlerts = alerts
    .filter((alert) => !alert.resolved)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  useEffect(() => {
    let isMounted = true;

    const wInterval = setInterval(() => {
      setWifiSignal((prev) => {
        const next = prev + Math.floor(Math.random() * 5) - 2;
        return Math.min(100, Math.max(50, next));
      });
    }, 5000);

    const fetchData = async () => {
      if (!isMounted) return;
      try {
        const [alertsData, snapData, deviceData, logData] = await Promise.all([
          smartLockApi.getAlerts().catch(() => []),
          smartLockApi.getWeeklySnapshot().catch(() => null),
          smartLockApi.getDevices().catch(() => []),
          smartLockApi.getAccessLogs().catch(() => []),
        ]);

        if (!isMounted) return;

        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setWeeklySnap(snapData);
        setDevices(Array.isArray(deviceData) ? deviceData : []);

        const latestLockAction = Array.isArray(logData)
          ? logData.find((log) => log.action === 'LOCKED' || log.action === 'UNLOCKED')
          : null;
        setLockState(latestLockAction?.action === 'UNLOCKED' ? 'unlocked' : 'locked');
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingAlerts(false);
          setIsLoadingSnap(false);
        }
      }
    };

    setIsLoadingAlerts(true);
    setIsLoadingSnap(true);
    fetchData();
    const dataInterval = setInterval(fetchData, 2000);

    return () => {
      isMounted = false;
      clearInterval(wInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const formatAlertType = (alertType) => {
    switch (alertType) {
      case 'GAS_LEAK':
        return 'Canh bao khi gas';
      case 'INTRUDER_ALERT':
        return 'Canh bao chuyen dong';
      case 'FIRE_ALARM':
        return 'Canh bao chay';
      case 'WRONG_PASSWORD':
        return 'Sai mat khau';
      case 'TAMPER_ALERT':
        return 'Canh bao cay pha';
      case 'BATTERY_LOW':
        return 'Pin yeu';
      case 'OFFLINE_ALERT':
        return 'Thiet bi ngoai tuyen';
      default:
        return alertType || 'Canh bao';
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
      default:
        return 'warning';
    }
  };

  const getAlertMessage = (alert) => {
    if (alert.alertType === 'GAS_LEAK' && alert.sensorValue != null) {
      return `Phat hien khi gas vuot nguong: ${alert.sensorValue}`;
    }
    if (alert.alertType === 'INTRUDER_ALERT') {
      return 'Phat hien chuyen dong tu cam bien PIR.';
    }
    return alert.message || 'Khong co mo ta.';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div
          className="
          cyber-card hud-corners neon-border scanlines
          lg:col-span-8 bg-surface-container rounded-[2rem] p-10
          relative overflow-hidden flex flex-col justify-between min-h-[400px]
          shadow-sm border border-outline-variant/10
        "
        >
          <div className="absolute inset-0 cyber-grid opacity-[0.25] pointer-events-none rounded-[2rem]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 data-pulse shadow-[0_0_8px_#4ade80]" />
              <span className="text-primary font-bold tracking-[0.25em] uppercase text-[10px]">
                {t('sys_status')} · SECURE
              </span>
            </div>

            <h2
              className="text-6xl font-black font-headline mt-2 tracking-tighter text-on-surface glitch-text"
              data-text={lockState === 'locked' ? t('locked') : t('unlocked')}
            >
              {lockState === 'locked' ? t('locked') : t('unlocked')}
            </h2>
            <p className="text-outline/70 mt-2 max-w-md text-sm">
              {primaryDevice
                ? `${primaryDevice.deviceName} · ${primaryDevice.online ? 'Ket noi on dinh' : 'Thiet bi dang offline'}`
                : t('sys_desc')}
            </p>
          </div>

          <div className="flex gap-10 mt-10 relative z-10">
            <div className="flex flex-col">
              <span className="text-outline/60 text-[9px] font-bold mb-1 uppercase tracking-[0.2em]">{t('wifi')}</span>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">wifi</span>
                <span className="font-bold tabular-nums">{wifiSignal}%</span>
                <div className="flex items-end gap-0.5 h-4">
                  {[25, 50, 75, 100].map((threshold, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-sm transition-all duration-500 ${
                        wifiSignal >= threshold ? 'bg-primary' : 'bg-outline/20'
                      }`}
                      style={{ height: `${(i + 1) * 4}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-outline/60 text-[9px] font-bold mb-1 uppercase tracking-[0.2em]">{t('battery')}</span>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-tertiary text-[18px]">battery_full</span>
                <span className="font-bold">{primaryDevice?.online ? 'On dinh' : '--'}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-outline/60 text-[9px] font-bold mb-1 uppercase tracking-[0.2em]">UPTIME</span>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-green-400 text-[18px]">schedule</span>
                <span className="font-bold tabular-nums terminal-cursor">{primaryDevice?.lastCommandStatus || 'READY'}</span>
              </div>
            </div>
          </div>

          <button
            className="
            absolute bottom-10 right-10
            w-24 h-24 rounded-full
            status-gradient neon-lock-pulse
            flex items-center justify-center
            hover:scale-110 active:scale-95 transition-transform duration-200
            border border-primary/30
          "
          >
            <span
              className="material-symbols-outlined text-4xl text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {lockState === 'locked' ? 'lock' : 'lock_open'}
            </span>
          </button>
        </div>

        <div
          className="
          cyber-card hud-corners
          lg:col-span-4 bg-surface-container-high rounded-[2rem] p-8
          flex flex-col shadow-sm border border-outline-variant/10 relative overflow-hidden
        "
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-outline/80 mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[16px]">sensors</span>
            {t('environment')}
          </h3>

          <div className="space-y-3 flex-1 text-on-surface">
            {[
              {
                icon: weather.icon,
                color: 'text-tertiary',
                label: t('weather'),
                value: primaryDevice?.temperature != null ? `${primaryDevice.temperature}°C` : `${weather.temp}°C`,
                sub: primaryDevice?.weatherDesc || weather.desc,
              },
              {
                icon: 'light_mode',
                color: 'text-primary',
                label: t('brightness'),
                value: primaryDevice?.ldrValue != null ? `${primaryDevice.ldrValue} lx` : 'N/A',
                sub: t('indoor'),
              },
              {
                icon: 'co2',
                color: 'text-green-500',
                label: t('gas'),
                value: primaryDevice?.gasValue != null ? `${primaryDevice.gasValue}` : 'N/A',
                sub: primaryDevice?.pirTriggered ? 'Motion detected' : t('safe'),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="
                  cyber-card bg-surface-container p-4 rounded-xl
                  flex items-center justify-between
                  border border-outline-variant/10
                "
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${item.color} text-[20px]`}>{item.icon}</span>
                  <div>
                    <p className="text-[9px] text-outline/60 uppercase font-bold tracking-[0.15em]">{item.label}</p>
                    <p className="font-semibold text-sm">{item.sub}</p>
                  </div>
                </div>
                <span className="text-lg font-black tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="
        cyber-card hud-corners neon-border
        bg-surface-container rounded-[2rem] p-8
        shadow-sm border border-outline-variant/10 relative overflow-hidden
      "
      >
        <div className="absolute inset-0 cyber-grid opacity-[0.15] pointer-events-none rounded-[2rem]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-base font-bold tracking-[0.1em] uppercase text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
              Bao cao tuan · 7 ngay qua
            </h3>
            <p className="text-xs text-outline/60 mt-1 font-['Inter'] italic">
              {isLoadingSnap ? 'Dang tong hop...' : (weeklySnap?.progressSummary || 'Chua co du lieu.')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary data-pulse" />
            <span className="px-3 py-1.5 bg-primary/5 border border-primary/15 rounded-lg text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
              LIVE DATA
            </span>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: 'Tong truy cap', val: weeklySnap?.totalAccessThisWeek, rate: weeklySnap?.accessChangeRate, icon: 'login' },
            { label: 'Canh bao', val: weeklySnap?.alertsThisWeek, rate: weeklySnap?.alertChangeRate, icon: 'warning' },
            { label: 'Nguy cap', val: weeklySnap?.criticalAlertsThisWeek, isError: weeklySnap?.criticalAlertsThisWeek > 0, icon: 'crisis_alert' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="
                cyber-card hud-corners
                bg-surface-container-low p-5 rounded-2xl
                border border-outline-variant/10 relative overflow-hidden
              "
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`material-symbols-outlined text-[16px] ${item.isError ? 'text-error' : 'text-primary/60'}`}>
                  {item.icon}
                </span>
                <p className="text-[9px] text-outline/60 uppercase font-black tracking-[0.2em]">{item.label}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black tabular-nums ${item.isError ? 'text-error' : 'text-on-surface'}`}>
                  {isLoadingSnap ? '--' : (item.val ?? '--')}
                </span>
                {!isLoadingSnap && item.rate !== undefined && item.rate !== 0 && (
                  <span className={`text-[9px] font-bold ${item.rate > 0 ? 'text-green-400' : 'text-error'}`}>
                    {item.rate > 0 ? '↑' : '↓'} {Math.abs(item.rate).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="cyber-card bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
            <p className="text-[9px] text-outline/60 uppercase font-black tracking-[0.2em] mb-3">Xu huong 7 ngay</p>
            <div className="flex items-end gap-1 h-12 mt-1">
              {isLoadingSnap ? (
                <div className="w-full h-2 bg-outline-variant/10 rounded-full animate-pulse" />
              ) : (
                Object.entries(weeklySnap?.dailyAccessTrend || {}).map(([day, val], idx) => {
                  const values = Object.values(weeklySnap?.dailyAccessTrend || {});
                  const max = Math.max(...values, 1);
                  const h = (val / max) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/5 rounded-sm relative overflow-hidden h-10">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-primary/50 rounded-sm transition-all"
                          style={{ height: `${h}%`, boxShadow: h > 50 ? '0 0 6px var(--color-primary)' : 'none' }}
                        />
                      </div>
                      <span className="text-[8px] font-bold text-outline/50 uppercase">{day}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          className="
          cyber-card hud-corners
          md:col-span-2 bg-surface-container rounded-[2rem] p-8
          shadow-sm border border-outline-variant/10 relative overflow-hidden
        "
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-error/40 to-transparent" />

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error data-pulse shadow-[0_0_8px_var(--color-error)]" />
              {t('alerts')}
            </h3>
            <Link to="/logs" className="text-primary/70 text-[9px] font-bold hover:text-primary uppercase tracking-[0.2em] transition-colors">
              {t('view_all')} →
            </Link>
          </div>

          <div className="space-y-3">
            {isLoadingAlerts ? (
              <div className="p-8 text-center text-outline/50 animate-pulse text-sm">
                Dang tai canh bao...
              </div>
            ) : recentAlerts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-outline-variant/20 rounded-2xl">
                <span className="material-symbols-outlined text-green-400 text-3xl block mb-2">verified_user</span>
                <p className="text-outline/60 font-medium text-sm">He thong an toan. Khong co canh bao.</p>
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="
                    cyber-card flex items-center p-4
                    bg-surface-container-low border border-outline-variant/10 rounded-xl
                  "
                >
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center mr-4
                    ${alert.severity === 'CRITICAL' ? 'bg-error/10 border border-error/20' : 'bg-tertiary/10 border border-tertiary/20'}
                  `}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${alert.severity === 'CRITICAL' ? 'text-error' : 'text-tertiary'}`}>
                      {getAlertIcon(alert.alertType)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">{formatAlertType(alert.alertType)}</h4>
                      <span className="text-[9px] font-bold text-outline/50 tabular-nums ml-2 shrink-0">
                        {new Date(alert.createdAt).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs text-outline/60 mt-0.5 truncate">{getAlertMessage(alert)}</p>
                  </div>
                  <span
                    className={`
                    ml-3 px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase shrink-0
                    ${alert.severity === 'CRITICAL' ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'}
                  `}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cyber-card bg-surface-container rounded-[2rem] overflow-hidden flex flex-col shadow-sm border border-outline-variant/10 relative">
          <div className="relative h-64 scanlines">
            <img
              className="w-full h-full object-cover"
              alt="Entrance"
              src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary/70" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary/70" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary/70" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary/70" />

            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 border border-error/30">
              <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-error tracking-[0.3em] uppercase">LIVE</span>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute left-0 right-0 h-0.5 bg-primary/30 scanline-sweep" />
            </div>
          </div>

          <div className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-on-surface uppercase tracking-wider text-xs">{t('front_door')}</h4>
              <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">
                ● {primaryDevice?.online ? 'ARMED' : 'OFFLINE'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="
                py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl
                flex flex-col items-center gap-1.5
                hover:bg-primary/5 hover:border-primary/20 transition-all group
              "
              >
                <span className="material-symbols-outlined text-outline/60 group-hover:text-primary text-[18px] transition-colors">videocam</span>
                <span className="text-[9px] font-black text-on-surface/70 tracking-wider uppercase">{t('playback')}</span>
              </button>
              <button
                className="
                py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl
                flex flex-col items-center gap-1.5
                hover:bg-primary/5 hover:border-primary/20 transition-all group
              "
              >
                <span className="material-symbols-outlined text-outline/60 group-hover:text-primary text-[18px] transition-colors">mic</span>
                <span className="text-[9px] font-black text-on-surface/70 tracking-wider uppercase">{t('talk')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
