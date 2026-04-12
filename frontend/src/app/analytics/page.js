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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        <div className="card md-span-8" style={{ padding: '2rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '1.5rem' }}>Weekly Environmental Trends</h3>
          <div style={{ flex: 1, backgroundColor: 'var(--surface-container-high)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
             <div style={{ position: 'absolute', bottom: 0, left: '10%', width: '10%', height: '40%', backgroundColor: 'var(--primary)', opacity: 0.8, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
             <div style={{ position: 'absolute', bottom: 0, left: '30%', width: '10%', height: '60%', backgroundColor: 'var(--primary)', opacity: 0.8, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
             <div style={{ position: 'absolute', bottom: 0, left: '50%', width: '10%', height: '50%', backgroundColor: 'var(--primary)', opacity: 0.8, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
             <div style={{ position: 'absolute', bottom: 0, left: '70%', width: '10%', height: '80%', backgroundColor: 'var(--primary)', opacity: 0.9, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
             <div style={{ position: 'absolute', bottom: 0, left: '90%', width: '10%', height: '70%', backgroundColor: 'var(--primary)', opacity: 0.8, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
          </div>
        </div>

        <div className="card md-span-4" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Total Access Events</h3>
            <p className="font-headline" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>1,248</p>
            <p className="font-label" style={{ color: 'var(--success)' }}>+12% from last week</p>
          </div>
          <div style={{ height: '1px', backgroundColor: 'var(--outline-variant)' }}></div>
          <div>
            <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Battery Degradation</h3>
            <p className="font-headline" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)' }}>-2.4%</p>
            <p className="font-label" style={{ color: 'var(--on-surface-variant)' }}>Estimated 142 days remaining</p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .md-span-8 { grid-column: span 12; }
        .md-span-4 { grid-column: span 12; }
        @media (min-width: 768px) {
          .md-span-8 { grid-column: span 8; }
          .md-span-4 { grid-column: span 4; }
        }
      `}</style>
    </DashboardLayout>
  );
}
