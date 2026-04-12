'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const { t } = useLanguage();

  const tabs = [
    { label: 'tabOverview', href: '#' },
    { label: 'tabActivity', href: '#' },
    { label: 'tabDevices', href: '#' },
  ];

  return (
    <DashboardLayout tabs={tabs} activeTab="tabOverview">
      {/* Hero Status Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem' }}>
          <div>
            <p className="font-label" style={{
              color: 'var(--primary)',
              letterSpacing: '0.2em',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}>
              {t('heroStatusDesc')}
            </p>
            <h2 className="font-headline" style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              color: 'var(--on-surface)',
            }}>
              {t('heroStatusArmed')}
            </h2>
          </div>

          <div className="card" style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '28px' }}>wifi</span>
              <span className="font-label" style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 700, textTransform: 'uppercase' }}>{t('signal')} 98%</span>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--outline-variant)', opacity: 0.3 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: '28px' }}>battery_full</span>
              <span className="font-label" style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 700, textTransform: 'uppercase' }}>{t('battery')} 82%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

        {/* Primary Lock Control Card */}
        <div className="card" style={{
          gridColumn: 'span 7',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '400px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background lock icon */}
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '2rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '128px', color: 'var(--outline-variant)', opacity: 0.15 }}>lock</span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className="animate-pulse" style={{
                width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block',
              }} />
              <span className="font-label" style={{
                color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>{t('mainEntry')}</span>
            </div>
            <h3 className="font-headline" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--on-surface)' }}>
              {t('frontDoorLock')}
              <br />
              <span style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>{t('securelyEngaged')}</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem', position: 'relative', zIndex: 1 }}>
            <button className="btn btn--primary">
              <span className="material-symbols-outlined">lock_open</span>
              {t('unlockDoor')}
            </button>
            <button className="btn btn--secondary">
              {t('emergencyLock')}
            </button>
          </div>
        </div>

        {/* Sensor Matrix */}
        <div style={{ gridColumn: 'span 5', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card sensor-card">
            <span className="material-symbols-outlined sensor-card__icon" style={{ color: 'var(--primary)' }}>device_thermostat</span>
            <div>
              <p className="sensor-card__value">22.4°C</p>
              <p className="sensor-card__label">{t('temp')}</p>
            </div>
          </div>

          <div className="card sensor-card">
            <span className="material-symbols-outlined sensor-card__icon" style={{ color: 'var(--tertiary)' }}>detector_smoke</span>
            <div>
              <p className="sensor-card__value">0.02</p>
              <p className="sensor-card__label">{t('gas')}</p>
            </div>
          </div>

          <div className="card sensor-card">
            <span className="material-symbols-outlined sensor-card__icon" style={{ color: '#ca8a04' }}>light_mode</span>
            <div>
              <p className="sensor-card__value">450 lx</p>
              <p className="sensor-card__label">{t('ldrIndex')}</p>
            </div>
          </div>

          <div className="card sensor-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-1rem', top: '-1rem', opacity: 0.05 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>cloud</span>
            </div>
            <span className="material-symbols-outlined sensor-card__icon" style={{ color: 'var(--on-surface-variant)' }}>cloud</span>
            <div>
              <p className="sensor-card__value">{t('weatherDesc')}</p>
              <p className="sensor-card__label">{t('outsideWeather')}</p>
            </div>
          </div>
        </div>

        {/* Security Log */}
        <div className="card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--outline-variant)', opacity: 1 }}>
            <h4 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>{t('securityLog')}</h4>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="alert-item alert-item--critical">
              <span className="material-symbols-outlined alert-item__icon alert-item__icon--critical">warning</span>
              <div>
                <p className="alert-item__title">Unauthorized access attempt</p>
                <p className="alert-item__desc">Unknown biometric signature at 02:14 AM</p>
              </div>
            </div>
            <div className="alert-item">
              <span className="material-symbols-outlined alert-item__icon alert-item__icon--warning">battery_2_bar</span>
              <div>
                <p className="alert-item__title">Low battery notification</p>
                <p className="alert-item__desc">Back door sensor at 15%</p>
              </div>
            </div>
            <div className="alert-item">
              <span className="material-symbols-outlined alert-item__icon alert-item__icon--info">check_circle</span>
              <div>
                <p className="alert-item__title">Scheduled maintenance</p>
                <p className="alert-item__desc">Firmware v2.4.1 successfully applied</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Lock Monitor */}
        <div className="card" style={{
          gridColumn: 'span 8',
          padding: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
        }}>
          <div style={{
            width: '33%',
            minWidth: '180px',
          }}>
            <div style={{
              width: '100%',
              height: '192px',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, var(--surface-container-high), var(--surface-container-highest))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--outline-variant)', opacity: 0.5 }}>home</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--on-surface)' }}>{t('backPatioDoor')}</h4>
                <span className="badge badge--active">{t('active')}</span>
              </div>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '28rem', lineHeight: 1.5 }}>
                {t('patioDesc')}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <div className="font-label" style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.625rem', color: 'var(--on-surface-variant)',
                  marginBottom: '0.5rem', textTransform: 'uppercase',
                  letterSpacing: '-0.025em', fontWeight: 700,
                }}>
                  <span>{t('signalStrength')}</span>
                  <span>76%</span>
                </div>
                <div className="progress">
                  <div className="progress__fill" style={{ width: '76%' }} />
                </div>
              </div>
              <button style={{
                padding: '1rem',
                backgroundColor: 'var(--surface-container-high)',
                borderRadius: '0.75rem',
                color: 'var(--on-surface-variant)',
                transition: 'color 0.3s ease',
                border: '1px solid var(--card-border)',
              }}>
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="fab">
        <span className="material-symbols-outlined filled">add_moderator</span>
      </button>
    </DashboardLayout>
  );
}
