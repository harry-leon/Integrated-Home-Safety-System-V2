'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: t('navDashboard') },
    { href: '/remote-control', icon: 'settings_remote', label: t('navRemoteControl') },
    { href: '/fingerprints', icon: 'fingerprint', label: t('navFingerprints') },
    { href: '/logs', icon: 'history', label: t('navLogs') },
    { href: '/analytics', icon: 'analytics', label: t('navAnalytics') },
    { href: '/settings', icon: 'settings', label: t('navSettings') },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar__overlay ${isOpen ? 'sidebar__overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <h1 className="sidebar__brand-name">{t('brand')}</h1>
          <p className="sidebar__brand-tagline">{t('tagline')}</p>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                onClick={onClose}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <Link href="/support" className="sidebar__link" onClick={onClose}>
            <span className="material-symbols-outlined">help</span>
            {t('navSupport')}
          </Link>
          <button className="sidebar__link sidebar__link--logout">
            <span className="material-symbols-outlined">logout</span>
            {t('navLogout')}
          </button>
        </div>
      </aside>
    </>
  );
}
