'use client';

import React, { useState } from 'react';
import {
  UserPlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function BiometricsPage() {
  const [faces, setFaces] = useState([
    { id: '1', name: 'Hung T. Le', slot: 1, type: 'Face ID', registered: '2026-04-12' },
  ]);
  const [fingerprints, setFingerprints] = useState([
    { id: '1', name: 'Main User', slot: 1, type: 'Fingerprint', registered: '2026-04-11' },
    { id: '2', name: 'Guest Access', slot: 2, type: 'Fingerprint', registered: '2026-04-14' },
  ]);

  const deleteItem = (id, list, setList) => {
    setList(list.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-10">
      <header className="flex items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-white/60" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
        </div>
        <div className="status-badge status-success">System Secure</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Face Recognition Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <VideoCameraIcon className="w-6 h-6 text-blue-400" />
              Face Recognition
            </h2>
            <button className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all">
              <UserPlusIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {faces.map(face => (
              <div key={face.id} className="glass-card p-5 flex items-center justify-between border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">{face.name}</h3>
                    <p className="text-xs text-white/40">Slot #{face.slot} • Registered {face.registered}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(face.id, faces, setFaces)}
                  className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-all"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            {faces.length === 0 && <p className="text-white/20 text-center py-10 border-2 border-dashed border-white/5 rounded-2xl italic">No faces registered</p>}
          </div>
        </section>

        {/* Fingerprint Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FingerPrintIcon className="w-6 h-6 text-purple-400" />
              Fingerprints
            </h2>
            <button className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-all">
              <UserPlusIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {fingerprints.map(fp => (
              <div key={fp.id} className="glass-card p-5 flex items-center justify-between border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">{fp.name}</h3>
                    <p className="text-xs text-white/40">Slot #{fp.slot} • Registered {fp.registered}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(fp.id, fingerprints, setFingerprints)}
                  className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-all"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="pt-20 text-center text-white/10 text-[10px] tracking-widest font-bold uppercase">
        Encrypted Biometric Data Storage • Secure-By-Default
      </footer>
    </div>
  );
}
