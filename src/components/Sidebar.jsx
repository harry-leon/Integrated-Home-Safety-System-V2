import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: t('dashboard'), icon: 'dashboard', path: '/' },
    { name: t('remote_control'), icon: 'settings_remote', path: '/remote' },
    { name: t('fingerprints'), icon: 'fingerprint', path: '/fingerprints' },
    { name: t('logs'), icon: 'history', path: '/logs' },
    { name: t('analytics'), icon: 'analytics', path: '/analytics' },
    { name: t('settings'), icon: 'settings', path: '/settings' },
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container flex-col py-8 px-4 shadow-lg z-30 transition-colors duration-300 border-r border-outline-variant/20">
      <div className="mb-12 px-2">
        <h1 className="text-xl font-bold tracking-tight text-primary font-headline">SENTINEL</h1>
        <p className="text-xs text-outline font-medium tracking-widest uppercase">Precision Security</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 font-['Manrope'] text-sm font-medium transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
              }`}
            aria-label={item.name}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-8 border-t border-outline-variant/20">
        <Link aria-label={t('support')} to="/support" className="flex items-center gap-3 px-4 py-3 text-outline hover:text-on-surface hover:bg-surface-container-high transition-all duration-300 font-['Manrope'] text-sm font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="material-symbols-outlined" aria-hidden="true">help</span>
          <span>{t('support')}</span>
        </Link>
        <button aria-label={t('logout')} onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-outline hover:text-error hover:bg-error/10 transition-all duration-300 font-['Manrope'] text-sm font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error">
          <span className="material-symbols-outlined" aria-hidden="true">logout</span>
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
