import React, { useState } from 'react';
import { useLang } from '../contexts/LangContext';

const RemoteControl = () => {
  const { t } = useLang();
  const [locked, setLocked] = useState(true);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface transition-colors duration-300">
            {t('remote_control')}
          </h2>
          <p className="text-outline font-medium mt-1">Quản lý an ninh thời gian thực</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/10 shadow-sm transition-colors duration-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-on-surface">HỆ THỐNG TRỰC TUYẾN</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Central Lock Control */}
        <div className="md:col-span-7 bg-surface-container rounded-[2rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <h3 className="text-outline font-bold tracking-widest text-xs uppercase mb-12 relative z-10">
            TRẠNG THÁI KHÓA HIỆN TẠI
          </h3>
          
          <button 
            onClick={() => setLocked(!locked)}
            className={`relative w-64 h-64 rounded-full p-1 transition-all duration-300 group z-10 outline-none
              ${locked ? 'bg-gradient-to-br from-primary-container to-inverse-primary hover:scale-105 active:scale-95 shadow-[0_0_80px_rgba(15,98,254,0.3)]' 
                       : 'bg-gradient-to-br from-green-500/20 to-green-500/50 hover:scale-105 active:scale-95 shadow-[0_0_80px_rgba(34,197,94,0.3)]'}
            `}
          >
            <div className="w-full h-full rounded-full bg-surface-container-low flex flex-col items-center justify-center">
              <span className={`material-symbols-outlined text-7xl mb-2 ${locked ? 'text-primary' : 'text-green-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {locked ? 'lock' : 'lock_open'}
              </span>
              <span className="text-2xl font-black text-on-surface tracking-tighter font-headline uppercase">
                {locked ? t('locked') : t('unlocked')}
              </span>
            </div>
          </button>
          <p className="mt-12 text-outline font-medium text-center max-w-xs relative z-10">
            Nhấn vào trung tâm để {locked ? 'mở' : 'đóng'} khóa cửa chính. Hành động này sẽ được ghi nhật ký.
          </p>
        </div>

        {/* Toggles & Status */}
        <div className="md:col-span-5 grid grid-cols-1 gap-6">
          <div className="bg-surface-container focus-within:ring p-8 rounded-[2rem] flex flex-col justify-between shadow-sm border border-outline-variant/10 transition-colors duration-300">
            <h4 className="text-sm font-bold text-outline mb-6 uppercase tracking-wider">Thiết lập nhanh</h4>
            <div className="space-y-6">
              {[
                { label: 'Tự động khóa', icon: 'lock_clock', active: true, color: 'text-primary' },
                { label: 'Cảnh báo Gas', icon: 'gas_meter', active: true, color: 'text-tertiary' },
                { label: 'Cảnh báo PIR', icon: 'motion_sensor_active', active: false, color: 'text-secondary' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center ${item.color}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="font-semibold text-on-surface">{item.label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={item.active} />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 transition-colors duration-300">
            <h4 className="text-sm font-bold text-outline mb-8 uppercase tracking-wider">Cấu hình ngưỡng</h4>
            <div className="space-y-8">
              {[
                { label: 'Ngưỡng Gas (PPM)', val: '350', max: 1000 },
                { label: 'Ngưỡng Ánh sáng (Lux)', val: '200', max: 1000 },
                { label: 'Trễ tự động khóa (Giây)', val: '30', max: 120 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-medium text-outline">{item.label}</span>
                    <span className="text-sm font-bold text-primary">{item.val}</span>
                  </div>
                  <input type="range" className="w-full accent-primary" min="0" max={item.max} defaultValue={item.val} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteControl;
