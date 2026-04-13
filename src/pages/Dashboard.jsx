import React, { useEffect, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useTimeWeather } from '../contexts/TimeWeatherContext';

const Dashboard = () => {
  const { t } = useLang();
  const { weather } = useTimeWeather();
  const [wifiSignal, setWifiSignal] = useState(92);

  // Simulate real-time wifi signal fluctuation
  useEffect(() => {
    const wInterval = setInterval(() => {
      setWifiSignal(prev => {
        const fluctuate = Math.floor(Math.random() * 5) - 2; // -2 to +2
        let next = prev + fluctuate;
        if (next > 100) next = 100;
        if (next < 50) next = 50;
        return next;
      });
    }, 5000);
    return () => clearInterval(wInterval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section: Lock Status */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface-container rounded-[2rem] p-12 relative overflow-hidden flex flex-col justify-between min-h-[400px] shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <div className="relative z-10">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">{t('sys_status')}</span>
            <h2 className="text-6xl font-black font-headline mt-4 tracking-tighter text-on-surface transition-colors duration-300">
              {t('locked')}
            </h2>
            <p className="text-outline mt-2 max-w-md">{t('sys_desc')}</p>
          </div>
          
          <div className="flex gap-12 mt-12 relative z-10">
            <div className="flex flex-col">
              <span className="text-outline text-xs font-label mb-1">{t('wifi')}</span>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">wifi</span>
                <span className="font-bold text-xl">Mạnh ({wifiSignal}%)</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-outline text-xs font-label mb-1">{t('battery')}</span>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-tertiary">battery_full</span>
                <span className="font-bold text-xl">85%</span>
              </div>
            </div>
          </div>
          
          {/* Lock Action Button */}
          <button className="absolute bottom-12 right-12 w-24 h-24 rounded-full status-gradient flex items-center justify-center shadow-[0px_20px_40px_rgba(15,98,254,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer pointer-events-auto">
            <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </button>
          
          {/* Decorative background */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        </div>

        {/* Secondary Quick Info */}
        <div className="lg:col-span-4 bg-surface-container-high rounded-[2rem] p-8 flex flex-col shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <h3 className="text-lg font-bold font-headline mb-6 text-on-surface">{t('environment')}</h3>
          <div className="space-y-4 flex-1">
            {/* Weather Element */}
            <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-outline-variant/10 shadow-sm transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center border border-tertiary/20">
                  <span className={`material-symbols-outlined text-tertiary ${weather.icon === 'sync' ? 'animate-pulse' : ''}`}>{weather.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-outline">{t('weather')}</p>
                  <p className="font-bold text-on-surface">{weather.desc}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-on-surface">{weather.temp}°C</span>
            </div>

            <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-outline-variant/10 shadow-sm transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">light_mode</span>
                </div>
                <div>
                  <p className="text-xs text-outline">{t('brightness')}</p>
                  <p className="font-bold text-on-surface">{t('indoor')}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-on-surface">420 lx</span>
            </div>
            
            <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-outline-variant/10 shadow-sm transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <span className="material-symbols-outlined text-green-500">co2</span>
                </div>
                <div>
                  <p className="text-xs text-outline">{t('gas')}</p>
                  <p className="font-bold text-on-surface">{t('safe')}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-on-surface">0.02%</span>
            </div>
          </div>
          <button className="w-full mt-6 py-4 bg-surface-container border border-outline-variant/20 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all shadow-sm">
            {t('sensor_detail')}
          </button>
        </div>
      </section>

      {/* Bento Grid: Analytics & Status */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-surface-container rounded-[2rem] p-8 shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold font-headline text-on-surface">{t('alerts')}</h3>
            <a className="text-primary text-sm font-semibold hover:underline cursor-pointer">{t('view_all')}</a>
          </div>
          <div className="space-y-4">
            {/* Alert Item 1 */}
            <div className="flex items-center p-5 bg-surface-container-low border border-outline-variant/10 rounded-2xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-on-surface">Phát hiện truy cập trái phép</h4>
                  <span className="text-xs font-label text-outline">14:20 Hôm nay</span>
                </div>
                <p className="text-sm text-outline mt-1">Cửa chính đã được thử mở bằng vân tay không hợp lệ 3 lần liên tiếp.</p>
              </div>
            </div>
            {/* Alert Item 2 */}
            <div className="flex items-center p-5 bg-surface-container-low border border-outline-variant/10 rounded-2xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-tertiary">battery_alert</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-on-surface">Pin yếu (Smart Lock B)</h4>
                  <span className="text-xs font-label text-outline">Hôm qua</span>
                </div>
                <p className="text-sm text-outline mt-1">Dung lượng pin dưới 15%. Vui lòng thay pin hoặc sạc thiết bị.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Feed */}
        <div className="bg-surface-container rounded-[2rem] overflow-hidden flex flex-col shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <div className="relative h-64">
            <img className="w-full h-full object-cover" alt="Entrance" src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800"/>
            <div className="absolute top-4 left-4 bg-error px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">{t('live')}</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-surface-container/80 backdrop-blur-md border border-outline-variant/20 px-3 py-1 rounded-lg text-[10px] font-bold text-on-surface">
              CAM_FRONT_01
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold font-headline text-on-surface">{t('front_door')}</h4>
              <p className="text-xs text-outline mt-1">{t('last_update')}: 2 phút trước</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl hover:bg-surface-container-high transition-all group shadow-sm">
                <span className="material-symbols-outlined text-outline group-hover:text-primary">videocam</span>
                <span className="text-xs font-bold text-on-surface">{t('playback')}</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl hover:bg-surface-container-high transition-all group shadow-sm">
                <span className="material-symbols-outlined text-outline group-hover:text-primary">mic</span>
                <span className="text-xs font-bold text-on-surface">{t('talk')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
