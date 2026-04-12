'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';

export default function LogsPage() {
  const { t } = useLanguage();
  return (
    <DashboardLayout tabs={[]} activeTab="">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="font-headline" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          {t('logTitle')}
        </h2>
        <p className="font-label" style={{ color: 'var(--on-surface-variant)', fontSize: '1.125rem' }}>{t('logSub')}</p>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)' }}>System Audit Trail</h3>
          <button className="btn btn--secondary btn--sm"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>Export CSV</button>
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
           {[1, 2, 3, 4, 5].map((item) => (
             <div key={item} className="alert-item" style={{ borderRadius: '0.5rem' }}>
               <span className="material-symbols-outlined alert-item__icon" style={{ color: 'var(--primary)' }}>settings_suggest</span>
               <div>
                 <p className="alert-item__title">System Parameter Updated</p>
                 <p className="alert-item__desc">Auto-lock delay configured to 30s by Admin User</p>
               </div>
               <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>10:45 AM</span>
             </div>
           ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
