'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsPage() {
  const { t } = useLanguage();
  return (
    <DashboardLayout tabs={[]} activeTab="">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="font-headline" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          {t('settersTitle')}
        </h2>
        <p className="font-label" style={{ color: 'var(--on-surface-variant)', fontSize: '1.125rem' }}>{t('settersSub')}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        <div style={{ gridColumn: 'span 12' }} className="md-span-6">
           <div className="card" style={{ padding: '2rem', minHeight: '100%' }}>
             <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '1.5rem' }}>Network Connectivity</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div>
                 <label className="font-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Current Wi-Fi</label>
                 <div style={{ padding: '1rem', border: '1px solid var(--outline-variant)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>wifi</span>
                   <div style={{ flex: 1 }}>
                     <span className="font-headline" style={{ fontWeight: 600, display: 'block' }}>Sentinel_Secure_5G</span>
                     <span className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Connected (IP: 192.168.1.15)</span>
                   </div>
                   <span className="badge badge--active">ONLINE</span>
                 </div>
               </div>
               <button className="btn btn--secondary btn--full">Manage Networks</button>
             </div>
           </div>
        </div>
        <div style={{ gridColumn: 'span 12' }} className="md-span-6">
           <div className="card" style={{ padding: '2rem', minHeight: '100%' }}>
             <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '1.5rem' }}>Device Firmware</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--outline-variant)' }}>
                 <span className="font-label" style={{ color: 'var(--on-surface-variant)' }}>Current Version</span>
                 <span className="font-headline" style={{ fontWeight: 700 }}>v2.4.1</span>
               </div>
               <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-container-high)', borderRadius: '0.5rem' }}>
                 <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>update</span>
                 <p className="font-label" style={{ fontSize: '0.875rem' }}>Your system firmware is up to date. Last checked today at 08:00 AM.</p>
               </div>
               <button className="btn btn--primary btn--full">Check for Updates</button>
             </div>
           </div>
        </div>
      </div>
      <style jsx>{`
        @media (min-width: 768px) {
          .md-span-6 { grid-column: span 6 !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
