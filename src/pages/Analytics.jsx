import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { smartLockApi } from '../services/api';

const Analytics = () => {
  const { t } = useLang();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const data = await smartLockApi.getAnalyticsSnapshot();
        setSnapshot(data);
      } catch (err) {
        console.error('Failed to fetch analytics snapshot:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshot();
  }, []);

  const handleDownloadCSV = async () => {
    try {
      const blob = await smartLockApi.exportAlerts();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'security_incidents_report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download report: ' + err.message);
    }
  };

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
                <h3 className="text-outline font-label text-xs uppercase tracking-[0.2em] mb-1">Status Summary</h3>
                <p className="text-2xl font-headline font-medium text-on-surface">Security Health: <span className="text-primary">{snapshot?.totalAlertsToday > 0 ? 'Action Required' : 'Optimal'}</span></p>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full text-xs font-label text-on-surface border border-outline-variant/10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Live Monitoring
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-5xl font-headline font-light text-on-surface">{snapshot?.accessLogsToday || 0}</p>
                <p className="text-xs text-outline font-label uppercase">Access Events Today</p>
                <div className="flex items-center gap-1 text-primary text-xs mt-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>System Active</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-5xl font-headline font-light text-on-surface">{snapshot?.totalAlertsToday || 0}</p>
                <p className="text-xs text-outline font-label uppercase">Alerts Detected</p>
                <div className="flex items-center gap-1 text-primary text-xs mt-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{snapshot?.totalAlertsToday === 0 ? 'No issues' : 'View recent'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-5xl font-headline font-light text-on-surface">{(snapshot?.deviceHealthScore || 0).toFixed(1)}%</p>
                <p className="text-xs text-outline font-label uppercase">System Uptime</p>
                <div className="flex items-center gap-1 text-primary text-xs mt-2">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>{snapshot?.onlineDevices}/{snapshot?.totalDevices} Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Chart Toggle */}
        <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-primary-container to-inverse-primary rounded-3xl p-8 flex flex-col justify-between shadow-[0px_20px_40px_rgba(15,98,254,0.15)] group relative overflow-hidden transition-all duration-300">
          <div className="relative z-10">
            <span className="material-symbols-outlined text-4xl mb-4 text-white">insights</span>
            <h3 className="text-xl font-headline font-bold leading-tight text-white/90">System Health Overview</h3>
            <p className="text-sm text-white/70 mt-2 font-body">Deep analysis of connected devices and entry points.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="relative z-10 mt-8 bg-white/20 hover:bg-white/30 text-white transition-colors py-3 rounded-xl font-headline font-bold text-xs uppercase tracking-widest backdrop-blur-md"
          >
            Refresh Metrics
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
        </div>

        {/* Access Statistics */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/10 transition-colors duration-300 flex flex-col justify-between">
          <div>
            <h3 className="text-outline font-label text-xs uppercase tracking-[0.2em] mb-6">Access Statistics</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-headline text-on-surface font-semibold">Success Rate</span>
                  <span className="text-2xl font-headline text-primary font-bold">100%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-inverse-primary rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-headline text-on-surface font-semibold">Offline Devices</span>
                  <span className="text-2xl font-headline text-tertiary font-bold">{snapshot?.totalDevices - snapshot?.onlineDevices || 0}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: `${(snapshot?.totalDevices - snapshot?.onlineDevices) / snapshot?.totalDevices * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 p-6 bg-surface-container-low rounded-xl border-l-4 border-primary flex items-start gap-4">
            <span className="material-symbols-outlined text-primary">info</span>
            <div>
              <p className="text-sm font-bold text-on-surface mb-1">System Health Score</p>
              <p className="text-xs text-outline leading-relaxed font-body">Current system performance is stable based on online device ratio ({snapshot?.onlineDevices}/{snapshot?.totalDevices}).</p>
            </div>
          </div>
        </div>

        {/* Security Incident Report */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-outline font-label text-xs uppercase tracking-[0.2em]">Summary Reports</h3>
            <button 
              onClick={handleDownloadCSV}
              className="text-primary text-xs font-label hover:underline font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download Full CSV
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed border-outline-variant/20 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">folder_open</span>
              <p className="text-on-surface font-medium">Weekly summary reports available</p>
              <p className="text-xs text-outline mt-1 italic">Historical reports will appear here as they are generated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
