import React, { useEffect, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useTimeWeather } from '../contexts/TimeWeatherContext';
import { smartLockApi } from '../services/api';

const Dashboard = () => {
  const { t } = useLang();
  const { weather } = useTimeWeather();
  const [wifiSignal, setWifiSignal] = useState(92);
  const [alerts, setAlerts] = useState([]);
  const [weeklySnap, setWeeklySnap] = useState(null);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [isLoadingSnap, setIsLoadingSnap] = useState(true);

  useEffect(() => {
    // Wifi signal simulation
    const wInterval = setInterval(() => {
      setWifiSignal(prev => {
        const fluctuate = Math.floor(Math.random() * 5) - 2;
        let next = prev + fluctuate;
        if (next > 100) next = 100;
        if (next < 50) next = 50;
        return next;
      });
    }, 5000);
    
    const fetchData = async () => {
      setIsLoadingAlerts(true);
      setIsLoadingSnap(true);
      try {
        const [alertsData, snapData] = await Promise.all([
          smartLockApi.getAlerts().catch(() => []),
          smartLockApi.getWeeklySnapshot().catch(() => null)
        ]);
        setAlerts(alertsData || []);
        setWeeklySnap(snapData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoadingAlerts(false);
        setIsLoadingSnap(false);
      }
    };
    
    fetchData();
    return () => clearInterval(wInterval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section: Lock Status */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface-container rounded-[2rem] p-12 relative overflow-hidden flex flex-col justify-between min-h-[400px] shadow-sm border border-outline-variant/10">
          <div className="relative z-10">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">{t('sys_status')}</span>
            <h2 className="text-6xl font-black font-headline mt-4 tracking-tighter text-on-surface">
              {t('locked')}
            </h2>
            <p className="text-outline mt-2 max-w-md">{t('sys_desc')}</p>
          </div>
          
          <div className="flex gap-12 mt-12 relative z-10">
            <div className="flex flex-col">
              <span className="text-outline text-xs font-label mb-1 uppercase tracking-widest">{t('wifi')}</span>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">wifi</span>
                <span className="font-bold text-xl">Mạnh ({wifiSignal}%)</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-outline text-xs font-label mb-1 uppercase tracking-widest">{t('battery')}</span>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-tertiary">battery_full</span>
                <span className="font-bold text-xl">85%</span>
              </div>
            </div>
          </div>
          
          <button className="absolute bottom-12 right-12 w-24 h-24 rounded-full status-gradient flex items-center justify-center shadow-lg hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </button>
        </div>

        {/* Environment Info */}
        <div className="lg:col-span-4 bg-surface-container-high rounded-[2rem] p-8 flex flex-col shadow-sm border border-outline-variant/10">
          <h3 className="text-lg font-bold font-headline mb-6 text-on-surface">{t('environment')}</h3>
          <div className="space-y-4 flex-1 text-on-surface">
            <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">{weather.icon}</span>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider">{t('weather')}</p>
                  <p className="font-bold text-sm">{weather.desc}</p>
                </div>
              </div>
              <span className="text-xl font-black">{weather.temp}°C</span>
            </div>

            <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">light_mode</span>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider">{t('brightness')}</p>
                  <p className="font-bold text-sm">{t('indoor')}</p>
                </div>
              </div>
              <span className="text-xl font-black">420 lx</span>
            </div>
            
            <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500">co2</span>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider">{t('gas')}</p>
                  <p className="font-bold text-sm">{t('safe')}</p>
                </div>
              </div>
              <span className="text-xl font-black">0.02%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Analytics Widget */}
      <section className="bg-surface-container rounded-[2rem] p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Báo cáo tiến độ tuần này
            </h3>
            <p className="text-sm text-outline mt-1 italic">
              {isLoadingSnap ? "Đang tổng hợp dữ liệu..." : weeklySnap?.progressSummary || "Dữ liệu chưa sẵn sàng."}
            </p>
          </div>
          <div className="px-3 py-2 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-bold text-primary uppercase tracking-wider">7 ngày qua</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Tổng truy cập', val: weeklySnap?.totalAccessThisWeek, rate: weeklySnap?.accessChangeRate },
            { label: 'Cảnh báo ghi nhận', val: weeklySnap?.alertsThisWeek, rate: weeklySnap?.alertChangeRate },
            { label: 'Nguy cấp', val: weeklySnap?.criticalAlertsThisWeek, isError: (weeklySnap?.criticalAlertsThisWeek > 0) }
          ].map((item, idx) => (
            <div key={idx} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
              <p className="text-[10px] text-outline uppercase font-black tracking-widest mb-1">{item.label}</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${item.isError ? 'text-error' : 'text-on-surface'}`}>
                  {isLoadingSnap ? "--" : item.val}
                </span>
                {!isLoadingSnap && item.rate !== undefined && item.rate !== 0 && (
                  <span className={`text-[10px] font-bold ${item.rate > 0 ? 'text-green-500' : 'text-error'}`}>
                    {item.rate > 0 ? '↑' : '↓'} {Math.abs(item.rate).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 relative group">
            <p className="text-[10px] text-outline uppercase font-black tracking-widest mb-1">Xu hướng 7 ngày</p>
            <div className="flex items-center gap-1 h-10 mt-2">
              {isLoadingSnap ? (
                <div className="w-full h-2 bg-outline-variant/10 rounded-full animate-pulse"></div>
              ) : (
                Object.entries(weeklySnap?.dailyAccessTrend || {}).map(([day, val], idx) => {
                  const dataValues = Object.values(weeklySnap?.dailyAccessTrend || {});
                  const max = Math.max(...dataValues, 1);
                  const h = (val / max) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/5 rounded-sm relative overflow-hidden h-10">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary/40 rounded-sm" 
                          style={{ height: `${h}%` }}
                        ></div>
                      </div>
                      <span className="text-[8px] font-bold text-outline uppercase">{day}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Alerts & Camera Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-surface-container rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold font-headline text-on-surface">{t('alerts')}</h3>
            <span className="text-primary text-sm font-semibold hover:underline cursor-pointer uppercase tracking-widest">{t('view_all')}</span>
          </div>
          <div className="space-y-4">
            {isLoadingAlerts ? (
              <div className="p-8 text-center text-outline animate-pulse">Đang tải cảnh báo...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-outline-variant/20 rounded-2xl">
                <p className="text-outline font-medium text-sm">Hệ thống an toàn. Không có cảnh báo.</p>
              </div>
            ) : (
              alerts.slice(0, 3).map((alert, i) => (
                <div key={i} className="flex items-center p-5 bg-surface-container-low border border-outline-variant/10 rounded-2xl">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-${alert.severity === 'CRITICAL' ? 'error' : 'tertiary'}/10 shadow-sm`}>
                    <span className={`material-symbols-outlined text-${alert.severity === 'CRITICAL' ? 'error' : 'tertiary'}`}>
                      {alert.severity === 'CRITICAL' ? 'warning' : 'notifications'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-on-surface text-sm uppercase">{alert.alertType}</h4>
                      <span className="text-[10px] font-bold text-outline">{new Date(alert.createdAt).toLocaleTimeString('vi-VN')}</span>
                    </div>
                    <p className="text-xs text-outline mt-1">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-surface-container rounded-[2rem] overflow-hidden flex flex-col shadow-sm border border-outline-variant/10">
          <div className="relative h-64">
            <img className="w-full h-full object-cover" alt="Entrance" src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800"/>
            <div className="absolute top-4 left-4 bg-error px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-white tracking-widest uppercase">{t('live')}</span>
            </div>
          </div>
          <div className="p-6">
            <h4 className="font-bold font-headline text-on-surface uppercase tracking-tight">{t('front_door')}</h4>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl flex flex-col items-center gap-2 hover:bg-surface-container-highest transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary">videocam</span>
                <span className="text-[10px] font-black text-on-surface">{t('playback')}</span>
              </button>
              <button className="py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl flex flex-col items-center gap-2 hover:bg-surface-container-highest transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary">mic</span>
                <span className="text-[10px] font-black text-on-surface">{t('talk')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
