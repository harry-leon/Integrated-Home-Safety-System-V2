'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';

export default function SupportPage() {
  const { t } = useLanguage();
  return (
    <DashboardLayout tabs={[]} activeTab="">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="font-headline" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          {t('navSupport')}
        </h2>
        <p className="font-label" style={{ color: 'var(--on-surface-variant)', fontSize: '1.125rem' }}>Get help and find answers to common questions.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* FAQ */}
        <div style={{ gridColumn: 'span 12' }} className="md-span-6">
          <div className="card" style={{ padding: '2rem', minHeight: '100%' }}>
            <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '1.5rem' }}>Frequently Asked Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { q: 'How do I add a new fingerprint?', a: 'Navigate to the Fingerprints page and tap "Enroll New". Follow the on-screen guide to register a finger.' },
                { q: 'What happens if the device goes offline?', a: 'The lock continues to operate using locally stored fingerprints and PINs. Logs will sync once connectivity is restored.' },
                { q: 'How do I reset the lock to factory settings?', a: 'Go to Settings → Device Firmware → Reset. This will erase all stored data. A backup is recommended first.' },
              ].map((item, i) => (
                <details key={i} style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '1rem' }}>
                  <summary className="font-headline" style={{ fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0' }}>{item.q}</summary>
                  <p className="font-label" style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
        {/* Contact & Resources */}
        <div style={{ gridColumn: 'span 12' }} className="md-span-6">
          <div className="card" style={{ padding: '2rem', minHeight: '100%' }}>
            <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '1.5rem' }}>Contact & Resources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--outline-variant)', borderRadius: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>mail</span>
                <div>
                  <span className="font-headline" style={{ fontWeight: 600, display: 'block' }}>Email Support</span>
                  <span className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>support@sentinel-lock.io</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--outline-variant)', borderRadius: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>menu_book</span>
                <div>
                  <span className="font-headline" style={{ fontWeight: 600, display: 'block' }}>Documentation</span>
                  <span className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Browse the full product manual and API reference.</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-container-high)', borderRadius: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>info</span>
                <p className="font-label" style={{ fontSize: '0.875rem' }}>Device serial and diagnostic data can be found under Settings → Device Firmware.</p>
              </div>
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
