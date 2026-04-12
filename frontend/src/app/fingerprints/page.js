'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';

export default function FingerprintsPage() {
  const { t } = useLanguage();
  return (
    <DashboardLayout tabs={[]} activeTab="">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="font-headline" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          {t('bioTitle')}
        </h2>
        <p className="font-label" style={{ color: 'var(--on-surface-variant)', fontSize: '1.125rem' }}>{t('bioSub')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>fingerprint</span>
            </div>
            <div>
              <h4 className="font-headline" style={{ fontWeight: 600 }}>Alexander Leon</h4>
              <p className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Master Admin • Added Oct 12</p>
            </div>
          </div>
          <span className="badge badge--active">ACTIVE</span>
          <button className="btn btn--secondary btn--sm"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>more_vert</span></button>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>fingerprint</span>
            </div>
            <div>
              <h4 className="font-headline" style={{ fontWeight: 600 }}>Guest Profile 01</h4>
              <p className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Temporary Access • Expires 24h</p>
            </div>
          </div>
          <span className="badge badge--warning">LIMITED</span>
          <button className="btn btn--secondary btn--sm"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>more_vert</span></button>
        </div>
        
        <button className="btn btn--primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
          <span className="material-symbols-outlined">add_circle</span>
          Add New Profile
        </button>
      </div>
    </DashboardLayout>
  );
}
