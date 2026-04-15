import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: t('dashboard'),      icon: 'dashboard',        path: '/' },
    { name: t('remote_control'), icon: 'settings_remote',  path: '/remote' },
    { name: t('fingerprints'),   icon: 'fingerprint',      path: '/fingerprints' },
    { name: t('logs'),           icon: 'history',          path: '/logs' },
    { name: t('analytics'),      icon: 'analytics',        path: '/analytics' },
    { name: t('settings'),       icon: 'settings',         path: '/settings' },
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container flex-col py-8 px-4 shadow-lg z-30 transition-colors duration-300 border-r border-outline-variant/20 overflow-hidden">

      {/* cyber grid bg */}
      <div className="absolute inset-0 cyber-grid opacity-[0.35] pointer-events-none" />

      {/* top scanline sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden scanline-sweep" />

      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className="relative mb-10 px-2">
        {/* HUD corner decorators */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/60" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary/60" />

        <div className="flex items-center gap-2 mb-1">
          {/* status dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[9px] text-green-400 font-bold tracking-[0.25em] uppercase">ONLINE</span>
        </div>

        <h1
          className="text-xl font-bold tracking-tight text-primary font-headline neon-text flicker"
          data-text="SENTINEL"
        >
          SENTINEL
        </h1>
        <p className="text-[9px] text-outline/60 font-medium tracking-[0.3em] uppercase version-tag">
          v2.4.1 · PRECISION SECURE
        </p>

        {/* neon separator */}
        <div className="neon-sep mt-3 opacity-60" />
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav className="relative flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                hud-corners relative flex items-center gap-3 px-4 py-3
                font-['Manrope'] text-sm font-medium transition-all duration-200
                rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                ${isActive
                  ? 'bg-primary/10 text-primary nav-active-glow'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
                }
              `}
              aria-label={item.name}
            >
              {/* active left accent bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
              )}

              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>

              {/* active → neon dot on right */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary data-pulse shadow-[0_0_6px_var(--color-primary)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className="relative mt-auto pt-6 space-y-1">
        <div className="neon-sep mb-4 opacity-40" />

        <Link
          aria-label={t('support')}
          to="/support"
          className="flex items-center gap-3 px-4 py-3 text-outline hover:text-on-surface hover:bg-surface-container-high transition-all duration-200 font-['Manrope'] text-sm font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span>{t('support')}</span>
        </Link>

        <button
          aria-label={t('logout')}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-outline hover:text-error hover:bg-error/10 transition-all duration-200 font-['Manrope'] text-sm font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>{t('logout')}</span>
        </button>

        {/* bottom HUD corners */}
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary/30" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/30" />
      </div>
    </aside>
  );
};

export default Sidebar;
