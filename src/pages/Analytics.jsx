import React from 'react';
import { useLang } from '../contexts/LangContext';

const Analytics = () => {
  const { t } = useLang();

  // Translations object could be built here locally since LangContext might not have these specific keys yet.
  // The 't(key)' gracefully falls back to the key name if missing, so we'll just pass English keys.

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <div className="mb-4">
        <h2 className="text-4xl font-headline font-bold tracking-tight mb-2 uppercase text-on-surface">System Analytics</h2>
        <p className="text-outline font-body">Real-time performance metrics and security transparency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weekly Security Summary */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-outline font-label text-xs uppercase tracking-[0.2em] mb-1">Weekly Summary</h3>
                <p className="text-2xl font-headline font-medium text-on-surface">Security Health: <span className="text-primary">Optimal</span></p>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full text-xs font-label text-on-surface border border-outline-variant/10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Live Monitoring
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-5xl font-headline font-light text-on-surface">1,284</p>
                <p className="text-xs text-outline font-label uppercase">Total Events</p>
                <div className="flex items-center gap-1 text-primary text-xs mt-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>12% from last week</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-5xl font-headline font-light text-on-surface">0</p>
                <p className="text-xs text-outline font-label uppercase">Breaches Detected</p>
                <div className="flex items-center gap-1 text-primary text-xs mt-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Maintaining 100%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-5xl font-headline font-light text-on-surface">99.8%</p>
                <p className="text-xs text-outline font-label uppercase">System Uptime</p>
                <div className="flex items-center gap-1 text-primary text-xs mt-2">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>Precision Stable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Chart Toggle */}
        <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-primary-container to-inverse-primary rounded-3xl p-8 flex flex-col justify-between shadow-[0px_20px_40px_rgba(15,98,254,0.15)] group relative overflow-hidden transition-all duration-300">
          <div className="relative z-10">
            <span className="material-symbols-outlined text-4xl mb-4 text-white">insights</span>
            <h3 className="text-xl font-headline font-bold leading-tight text-white/90">Generate Deep Insights Report</h3>
            <p className="text-sm text-white/70 mt-2 font-body">Leverage machine learning to identify unusual entry patterns.</p>
          </div>
          <button className="relative z-10 mt-8 bg-white/20 hover:bg-white/30 text-white transition-colors py-3 rounded-xl font-headline font-bold text-xs uppercase tracking-widest backdrop-blur-md">
            Run Diagnostics
          </button>
        </div>

        {/* Gas Levels & PIR Chart */}
        <div className="col-span-12 bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h3 className="text-outline font-label text-xs uppercase tracking-[0.2em] mb-1">Atmospheric &amp; Motion</h3>
              <p className="text-xl font-headline font-medium text-on-surface">Environmental Triggers</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-label shadow-sm">Weekly</button>
              <button className="bg-surface-container-high text-outline px-4 py-1.5 rounded-full text-xs font-label hover:bg-surface-container-highest transition-colors">Monthly</button>
            </div>
          </div>
          <div className="h-64 flex items-end gap-1.5 w-full relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="border-t border-on-surface w-full"></div>
              <div className="border-t border-on-surface w-full"></div>
              <div className="border-t border-on-surface w-full"></div>
              <div className="border-t border-on-surface w-full"></div>
            </div>
            {[20, 40, 60, 30, 80, 50, 45].map((h, i) => (
              <div key={i} className="flex-1 bg-surface-container-high rounded-t-lg relative group/bar transition-colors hover:bg-surface-container-highest cursor-default" style={{ height: `${h}%` }}>
                <div className="absolute inset-0 bg-primary/40 rounded-t-lg bottom-0" style={{ height: `${Math.random() * 80 + 20}%`}}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] text-outline font-label uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
          <div className="mt-8 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/40"></div>
              <span className="text-xs text-outline font-label">Gas Levels (ppm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-surface-container-high"></div>
              <span className="text-xs text-outline font-label">PIR Motion Triggers</span>
            </div>
          </div>
        </div>

        {/* Access Statistics */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/10 transition-colors duration-300 flex flex-col justify-between">
          <div>
            <h3 className="text-outline font-label text-xs uppercase tracking-[0.2em] mb-6">Access Statistics</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-headline text-on-surface font-semibold">Success Rate</span>
                  <span className="text-2xl font-headline text-primary font-bold">94.2%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-inverse-primary rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-headline text-on-surface font-semibold">Auth Failures</span>
                  <span className="text-2xl font-headline text-tertiary font-bold">5.8%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: '5.8%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 p-6 bg-surface-container-low rounded-xl border-l-4 border-tertiary flex items-start gap-4">
            <span className="material-symbols-outlined text-tertiary">warning</span>
            <div>
              <p className="text-sm font-bold text-on-surface mb-1">Anomalous Activity</p>
              <p className="text-xs text-outline leading-relaxed font-body">3 consecutive failed fingerprint attempts at Rear Entrance (Wed, 02:45 AM). Investigation recommended.</p>
            </div>
          </div>
        </div>

        {/* Security Incident Report */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-outline font-label text-xs uppercase tracking-[0.2em]">Incident Report</h3>
            <button className="text-primary text-xs font-label hover:underline font-bold">Download CSV</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl group cursor-pointer hover:bg-surface-container-highest transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-error/10 border border-error/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-lg">gpp_maybe</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Unauthorized Key Entry</p>
                  <p className="text-[10px] text-outline font-label uppercase">Front Gate • 14 Oct, 22:15</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">chevron_right</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl group cursor-pointer hover:bg-surface-container-highest transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Power Surge Resolved</p>
                  <p className="text-[10px] text-outline font-label uppercase">Main Panel • 12 Oct, 09:30</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">chevron_right</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl group cursor-pointer hover:bg-surface-container-highest transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-lg">wifi_off</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Gateway Connectivity Drop</p>
                  <p className="text-[10px] text-outline font-label uppercase">Router Node B • 10 Oct, 18:12</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">chevron_right</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Confidence Widget */}
      <div className="fixed bottom-10 right-10 z-40 hidden xl:block pointer-events-none">
        <div className="bg-surface/90 backdrop-blur-xl border border-outline-variant/20 p-4 rounded-2xl shadow-lg flex items-center gap-4 pointer-events-auto">
          <div className="relative">
            <svg className="w-12 h-12 -rotate-90">
              <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
              <circle className="text-primary" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset="25.12" strokeWidth="4" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-on-surface">80%</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold leading-none text-on-surface">AI Confidence</p>
            <p className="text-[10px] text-outline font-label mt-1">Normal Pattern Detection</p>
          </div>
          <button className="p-2 ml-2 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors outline-none text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
