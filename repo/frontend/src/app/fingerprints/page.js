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

      <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <span className="material-symbols-outlined pattern-icon" style={{ fontSize: '80px', color: 'var(--outline-variant)', marginBottom: '1.5rem', opacity: 0.5 }}>fingerprint</span>
        <h3 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Biometric Profiles</h3>
        <p className="font-label" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>No biometric profiles added yet.</p>
        <button className="btn btn--primary"><span className="material-symbols-outlined">add_circle</span>Add New User</button>
      </div>
    </DashboardLayout>
  );
}
