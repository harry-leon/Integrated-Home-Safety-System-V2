import React from 'react';
import { useLang } from '../contexts/LangContext';

const Settings = () => {
  const { t } = useLang();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-headline font-extrabold tracking-tighter text-on-surface mb-2">{t('System Settings')}</h1>
        <p className="text-outline font-body opacity-80">{t('Precision configuration for Sentinel IoT Core')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Security Profile Card */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container rounded-3xl p-8 flex flex-col justify-between shadow-sm border border-outline-variant/10">
          <div>
            <h3 className="text-xl font-headline font-semibold mb-6 text-on-surface">{t('Access Profile')}</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-label text-outline mb-2 uppercase tracking-widest">{t('Master Password')}</label>
                <div className="relative">
                  <input className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 font-label text-sm focus:ring-2 focus:ring-primary transition-all text-on-surface outline-none" type="password" defaultValue="••••••••••••"/>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline hover:text-primary transition-colors">visibility</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-label text-outline mb-2 uppercase tracking-widest">{t('Pin Timeout (Sec)')}</label>
                <input className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 font-label text-sm focus:ring-2 focus:ring-primary transition-all text-on-surface outline-none" type="number" defaultValue="30"/>
              </div>
            </div>
          </div>
          <button className="mt-8 bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-bold py-4 rounded-xl text-sm transition-transform active:scale-95 shadow-sm hover:opacity-90">
            {t('Update Access Credentials')}
          </button>
        </section>

        {/* Environmental Thresholds Card */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/10">
          <h3 className="text-xl font-headline font-semibold mb-8 text-on-surface">{t('Threshold Configuration')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="relative pl-6 border-l-4 border-tertiary">
                <label className="block text-xs font-label text-outline mb-4 uppercase tracking-widest">{t('Gas Detection Sensitivity (ppm)')}</label>
                <div className="flex items-center gap-4">
                  <input className="flex-1 accent-primary" max="1000" min="0" type="range" defaultValue="450"/>
                  <span className="font-label text-sm font-bold bg-surface-container-highest text-on-surface px-3 py-1 rounded-full border border-outline-variant/10">450</span>
                </div>
                <p className="text-[10px] text-outline mt-2 italic">{t('Triggers evacuation protocol if exceeded.')}</p>
              </div>
              <div className="relative pl-6 border-l-4 border-primary">
                <label className="block text-xs font-label text-outline mb-4 uppercase tracking-widest">{t('LDR Lux Threshold')}</label>
                <div className="flex items-center gap-4">
                  <input className="flex-1 accent-primary" max="100" min="0" type="range" defaultValue="15"/>
                  <span className="font-label text-sm font-bold bg-surface-container-highest text-on-surface px-3 py-1 rounded-full border border-outline-variant/10">15%</span>
                </div>
                <p className="text-[10px] text-outline mt-2 italic">{t('Sensitivity for external perimeter lighting.')}</p>
              </div>
            </div>
            
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg border border-tertiary/20">warning</span>
                <span className="font-headline text-sm font-medium text-on-surface">{t('Critical Event Logic')}</span>
              </div>
              <p className="text-xs text-outline leading-relaxed">
                {t('Thresholds are evaluated every 250ms. High-priority gas triggers will bypass keypad lockout and initiate immediate door release.')}
              </p>
              <div className="mt-6 flex items-center gap-3 bg-surface-container p-3 rounded-xl border border-outline-variant/10">
                <input defaultChecked className="rounded border-outline bg-surface-container-highest text-primary focus:ring-primary w-5 h-5 cursor-pointer" type="checkbox" id="auto-release"/>
                <label htmlFor="auto-release" className="text-xs font-bold text-on-surface cursor-pointer select-none">{t('Auto-release on Gas Alarm')}</label>
              </div>
            </div>
          </div>
        </section>

        {/* Timer & Latency Card */}
        <section className="col-span-12 lg:col-span-7 bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-headline font-semibold text-on-surface">{t('Temporal Constraints')}</h3>
              <p className="text-xs text-outline mt-1">{t('Manage lock delays and lockout durations.')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex justify-center items-center">
              <span className="material-symbols-outlined text-outline">timer</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-label text-outline mb-3 uppercase tracking-widest">{t('Auto-Lock Delay')}</label>
              <div className="flex gap-2">
                <button className="flex-1 py-3 px-4 rounded-xl border border-outline-variant/20 text-on-surface bg-surface-container-high text-xs font-medium hover:border-primary transition-all">5s</button>
                <button className="flex-1 py-3 px-4 rounded-xl bg-primary-container border border-primary/20 text-on-primary-container text-xs font-bold shadow-sm">15s</button>
                <button className="flex-1 py-3 px-4 rounded-xl border border-outline-variant/20 text-on-surface bg-surface-container-high text-xs font-medium hover:border-primary transition-all">30s</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-label text-outline mb-3 uppercase tracking-widest">{t('Keypad Lockout Duration')}</label>
              <select className="w-full bg-surface-container-highest outline-none border border-outline-variant/10 rounded-xl py-3 px-4 font-label text-sm focus:ring-2 focus:ring-primary text-on-surface appearance-none cursor-pointer">
                <option>{t('1 Minute')}</option>
                <option defaultValue>{t('5 Minutes')}</option>
                <option>{t('15 Minutes')}</option>
                <option>{t('Indefinite (Admin Reset)')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications Card */}
        <section className="col-span-12 lg:col-span-5 bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/10">
          <h3 className="text-xl font-headline font-semibold mb-6 text-on-surface">{t('Notification Stream')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">browser_updated</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-on-surface">{t('Web Push')}</div>
                  <div className="text-[10px] text-outline">{t('Real-time browser alerts')}</div>
                </div>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/10">
                  <span className="material-symbols-outlined text-outline">mail</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-on-surface">{t('Email Digest')}</div>
                  <div className="text-[10px] text-outline">{t('Daily activity summary')}</div>
                </div>
              </div>
              <div className="w-12 h-6 bg-surface-container-highest rounded-full relative flex items-center px-1 border border-outline-variant/20 cursor-pointer">
                <div className="w-4 h-4 bg-outline rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
