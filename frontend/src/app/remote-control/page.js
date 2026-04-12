'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function RemoteControlPage() {
  const { t } = useLanguage();
  const [autoLock, setAutoLock] = useState(true);
  const [gasAlert, setGasAlert] = useState(true);
  const [pirAlert, setPirAlert] = useState(false);
  
  const [gasThreshold, setGasThreshold] = useState(450);
  const [ldrThreshold, setLdrThreshold] = useState(20);
  const [autoLockDelay, setAutoLockDelay] = useState(30);

  const tabs = [
    { label: 'tabRemoteAccess', href: '#' },
    { label: 'tabActivity', href: '#' },
  ];

  return (
    <DashboardLayout tabs={tabs} activeTab="tabRemoteAccess">
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="font-headline" style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          letterSpacing: '-0.05em',
          color: 'var(--on-surface)',
          marginBottom: '0.5rem',
        }}>
          {t('remoteTitle')}
        </h2>
        <p className="font-label" style={{
          color: 'var(--on-surface-variant)',
          fontSize: '1.125rem',
        }}>
          {t('remoteSubtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
        
        {/* Central Lock Control */}
        <div style={{ gridColumn: 'span 12' }} className="lg-span-7">
          <div className="card" style={{
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100%',
          }}>
            <div style={{
              position: 'absolute', top: '-6rem', left: '-6rem', width: '16rem', height: '16rem',
              backgroundColor: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute', bottom: '-6rem', right: '-6rem', width: '16rem', height: '16rem',
              backgroundColor: 'var(--tertiary)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%'
            }} />

            <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
              <span className="badge badge--live" style={{ marginBottom: '1rem' }}>
                <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                {t('liveConnection')}
              </span>
              <h3 className="font-headline" style={{ fontSize: '2rem', fontWeight: 500, color: 'var(--on-surface)' }}>{t('mainEntry')}</h3>
              <p className="font-label" style={{ color: 'var(--on-surface-variant)' }}>{t('northDoor')}</p>
            </div>

            {/* The Master Button */}
            <button style={{
              position: 'relative',
              width: '16rem',
              height: '16rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              zIndex: 1,
            }}>
              <div className="animate-ping" style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--primary)', opacity: 0.1, borderRadius: '50%' }} />
              <div style={{ position: 'absolute', inset: '1rem', backgroundColor: 'var(--primary)', opacity: 0.1, borderRadius: '50%' }} />
              
              <div style={{
                position: 'absolute', inset: '2rem',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                borderRadius: '50%',
                boxShadow: '0 24px 48px var(--btn-primary-shadow)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: '64px' }}>lock</span>
                <span className="font-headline" style={{ marginTop: '0.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>{t('secured')}</span>
              </div>
            </button>

            <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div>
                <p className="font-label" style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>{t('state')}</p>
                <p className="font-headline text-primary" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('locked')}</p>
              </div>
              <div>
                <p className="font-label" style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>{t('lastAction')}</p>
                <p className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>2M {t('ago')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggles and Alerts */}
        <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="lg-span-5">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>timer</span>
              <div style={{ marginTop: '1rem' }}>
                <h4 className="font-headline" style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{t('autoLock')}</h4>
                <p className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{t('autoLockDesc')}</p>
                <div 
                  className={`toggle ${autoLock ? 'toggle--active' : ''}`} 
                  onClick={() => setAutoLock(!autoLock)}
                >
                  <div className="toggle__knob" />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--tertiary)' }}>
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '32px' }}>gas_meter</span>
              <div style={{ marginTop: '1rem' }}>
                <h4 className="font-headline text-tertiary" style={{ fontWeight: 700 }}>{t('gasAlert')}</h4>
                <p className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{t('gasAlertDesc')}</p>
                <div 
                  className={`toggle ${gasAlert ? 'toggle--active' : ''}`} 
                  onClick={() => setGasAlert(!gasAlert)}
                  style={gasAlert ? { backgroundColor: 'var(--tertiary)' } : {}}
                >
                  <div className="toggle__knob" />
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined text-primary">sensors</span>
              </div>
              <div>
                <h4 className="font-headline" style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{t('pirAlert')}</h4>
                <p className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{t('pirAlertDesc')}</p>
              </div>
            </div>
            <div 
              className={`toggle ${pirAlert ? 'toggle--active' : ''}`} 
              onClick={() => setPirAlert(!pirAlert)}
            >
              <div className="toggle__knob" />
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--on-surface)' }}>{t('securityPin')}</h3>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                flex: 1, height: '56px', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)', 
                borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 700, color: 'var(--primary)'
              }}>
                ****
              </div>
              <button style={{
                width: '56px', height: '56px', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)',
                borderRadius: '0.75rem', color: 'var(--on-surface-variant)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>

            <button className="btn btn--primary btn--full" style={{ fontSize: '0.875rem', letterSpacing: '-0.025em' }}>
              {t('manageAccessCodes')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ gridColumn: 'span 4' }} className="md-span-4">
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h4 className="font-headline" style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{t('gasThreshold')}</h4>
              <span className="font-label text-primary" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                {gasThreshold} <span style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)' }}>PPM</span>
              </span>
            </div>
            <input type="range" className="range-slider" min="0" max="1000" value={gasThreshold} onChange={(e) => setGasThreshold(Number(e.target.value))} />
            <div className="font-label" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.625rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              <span>{t('safe')}</span>
              <span>{t('critical')}</span>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 4' }} className="md-span-4">
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h4 className="font-headline" style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{t('ldrThreshold')}</h4>
              <span className="font-label text-primary" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                {ldrThreshold} <span style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)' }}>%</span>
              </span>
            </div>
            <input type="range" className="range-slider" min="0" max="100" value={ldrThreshold} onChange={(e) => setLdrThreshold(Number(e.target.value))} />
            <div className="font-label" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.625rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              <span>{t('dark')}</span>
              <span>{t('bright')}</span>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 4' }} className="md-span-4">
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h4 className="font-headline" style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{t('autoLockDelay')}</h4>
              <span className="font-label text-primary" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                {autoLockDelay} <span style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)' }}>SEC</span>
              </span>
            </div>
            <input type="range" className="range-slider" min="5" max="120" value={autoLockDelay} onChange={(e) => setAutoLockDelay(Number(e.target.value))} />
            <div className="font-label" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.625rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              <span>{t('minText')}</span>
              <span>{t('maxText')}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h4 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>{t('recentEvents')}</h4>
            <Link href="/logs" className="font-label text-primary" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t('viewFullLog')}</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--surface-container-high)', borderRadius: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>person</span>
                </div>
                <div>
                  <p className="font-headline" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)' }}>Security Admin</p>
                  <p className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Manual Lock via Dashboard</p>
                </div>
              </div>
              <span className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>14:22 PM</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--surface-container-high)', borderRadius: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(160, 61, 21, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '20px' }}>fingerprint</span>
                </div>
                <div>
                  <p className="font-headline" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)' }}>Authorized User: Sarah K.</p>
                  <p className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Biometric Entrance</p>
                </div>
              </div>
              <span className="font-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>12:05 PM</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .lg-span-7 { grid-column: span 7 !important; }
          .lg-span-5 { grid-column: span 5 !important; }
        }
        @media (min-width: 768px) {
          .md-span-4 { grid-column: span 4 !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
