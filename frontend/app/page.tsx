'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  LockOpenIcon, 
  SignalIcon, 
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const MOCK_DEVICES = [
  { id: '1', name: 'Main Entrance', code: 'L-MAIN-01', status: 'online', type: 'Smart Lock', lastSync: '2 mins ago' },
  { id: '2', name: 'Garage Side Door', code: 'L-GARA-02', status: 'offline', type: 'Smart Lock', lastSync: '4 hours ago' },
];

const MOCK_COMMANDS = [
  { id: '101', type: 'LOCK', status: 'SUCCESS', time: '12:15 PM', device: 'Main Entrance' },
  { id: '102', type: 'UNLOCK', status: 'RETRYING', time: '12:28 PM', device: 'Garage Side Door', attempt: 2 },
  { id: '103', type: 'LOCK', status: 'PENDING_OFFLINE', time: '12:30 PM', device: 'Garage Side Door' },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Aegis Sentinel
            </h1>
          </div>
          <p className="text-zinc-400 text-lg">Integrated Home Safety System v2.1</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass-card px-5 py-3 flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-xs text-white/40 uppercase font-bold">System Status</span>
              <span className="text-sm font-semibold text-green-400">Optimal Operation</span>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Device Management */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <SignalIcon className="w-5 h-5 text-blue-400" />
                Active Devices
              </h2>
              <button className="text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors">
                + Register Device
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_DEVICES.map(device => (
                <div key={device.id} className="glass-card p-6 group cursor-pointer overflow-hidden relative">
                  {/* Subtle Background Icon */}
                  <LockClosedIcon className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 opacity-20 transition-transform group-hover:scale-110" />
                  
                  <div className="flex items-start justify-between relative z-10 mb-4">
                    <div className={`status-badge ${device.status === 'online' ? 'status-online' : 'status-offline'}`}>
                      {device.status}
                    </div>
                    <span className="text-xs text-white/40">{device.code}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-1">{device.name}</h3>
                    <p className="text-sm text-white/60 mb-6">{device.type}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <ClockIcon className="w-4 h-4" />
                        Synced {device.lastSync}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                          <LockOpenIcon className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-3 bg-blue-500/90 hover:bg-blue-600 rounded-xl transition-all shadow-lg active:scale-95">
                          <LockClosedIcon className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activity Logs */}
          <section className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 text-accent" />
                Command Execution History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4 font-bold">Device</th>
                    <th className="px-6 py-4 font-bold">Action</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {MOCK_COMMANDS.map(cmd => (
                    <tr key={cmd.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium">{cmd.device}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${cmd.type === 'LOCK' ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                          {cmd.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {cmd.status === 'SUCCESS' && <span className="status-badge status-success">Delivered</span>}
                          {cmd.status === 'RETRYING' && (
                            <span className="status-badge status-pending flex items-center gap-1">
                              <ArrowPathIcon className="w-3 h-3 animate-spin" />
                              Retry #{cmd.attempt}
                            </span>
                          )}
                          {cmd.status === 'PENDING_OFFLINE' && (
                            <span className="status-badge status-offline flex items-center gap-1">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              Queued (Offline)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white/40">{cmd.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Biometrics Preview */}
          <section className="glass-card p-6 animate-glow border-primary/20 bg-primary/5">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-blue-400" />
              Secured Biometrics
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold">H</div>
                  <div>
                    <p className="font-semibold">Hung T. Le</p>
                    <p className="text-xs text-white/40">Face ID Registered</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-800 flex items-center justify-center font-bold">G</div>
                  <div>
                    <p className="font-semibold">Guest Access</p>
                    <p className="text-xs text-white/40">Fingerprint Ready</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
              </div>
              <Link href="/biometrics" className="block w-full">
                <button className="w-full py-4 mt-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-[0.98]">
                  Manage Access Control
                </button>
              </Link>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-white/80">System Health</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Battery Life (L-MAIN-01)</span>
                  <span className="text-green-400 font-bold">92%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">WiFi Strength</span>
                  <span className="text-blue-400 font-bold">-48 dBm</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
      
      {/* Footer */}
      <footer className="pt-12 text-center text-white/20 text-xs tracking-widest font-bold uppercase">
        © 2026 AEGIS HOME SECURITY SYSTEMS • SECURED BY ANTIGRAVITY AI
      </footer>
    </div>
  );
}
