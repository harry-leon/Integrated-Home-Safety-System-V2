'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';

export default function AnalyticsPage() {
  const { t } = useLanguage();
  return (
    <DashboardLayout tabs={[]} activeTab="">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="font-headline" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          {t('anaTitle')}
        </h2>
        <p className="font-label" style={{ color: 'var(--on-surface-variant)', fontSize: '1.125rem' }}>{t('anaSub')}</p>
      </div>
      <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <span className="material-symbols-outlined pattern-icon" style={{ fontSize: '80px', color: 'var(--primary)', marginBottom: '1.5rem', opacity: 0.2 }}>bar_chart</span>
        <h3 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Data Visualization Hub</h3>
        <p className="font-label" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', textAlign: 'center', maxWidth: '400px' }}>
          Real-time charts and historical aggregation features are currently collecting sensor data. Check back after 24 hours of uptime.
        </p>
      </div>
    </DashboardLayout>
  );
}
