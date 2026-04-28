import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const sectionMeta = {
  '/': 'nav_scope_overview',
  '/remote': 'nav_scope_remote',
  '/fingerprints': 'nav_scope_fingerprints',
  '/logs': 'nav_scope_logs',
  '/analytics': 'nav_scope_analytics',
  '/settings': 'nav_scope_settings',
};

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const sidebarSurface = theme === 'dark' ? 'bg-[#071521] border-cyan-950/60' : 'bg-surface border-outline-variant/16';
  const panelSurface = theme === 'dark' ? 'bg-[#0b1d2a]' : 'bg-surface-container';
  const buttonSurface = theme === 'dark' ? 'bg-[#0e2231] border-cyan-950/60' : 'bg-surface-container border-outline-variant/16';

  const handleLogout = async (event) => {
    event.preventDefault();
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: t('dashboard'), icon: 'dashboard', path: '/', roles: ['ADMIN', 'MEMBER', 'VIEWER'] },
    { name: t('remote_control'), icon: 'settings_remote', path: '/remote', roles: ['ADMIN', 'MEMBER', 'VIEWER'] },
    { name: t('fingerprints'), icon: 'fingerprint', path: '/fingerprints', roles: ['ADMIN', 'MEMBER'] },
    { name: t('logs'), icon: 'history', path: '/logs', roles: ['ADMIN'] },
    { name: t('analytics'), icon: 'analytics', path: '/analytics', roles: ['ADMIN'] },
    { name: t('settings'), icon: 'settings', path: '/settings', roles: ['ADMIN', 'MEMBER', 'VIEWER'] },
  ];

  const { user } = useAuth();
  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role));

  const activeItem = navItems.find((item) => item.path === location.pathname) || navItems[0];

  return (
    <aside
      className={`fixed left-0 top-0 hidden h-screen flex-col border-r transition-[width] duration-300 md:flex ${sidebarSurface} ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`pb-6 pt-5 ${isCollapsed ? 'px-3' : 'px-5'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Sentinel</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-on-surface">{t('app_brand_full')}</h2>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? t('open_sidebar') : t('collapse_sidebar')}
            title={isCollapsed ? t('open_sidebar_short') : t('collapse_sidebar_short')}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-on-surface transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${buttonSurface}`}
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>

        {!isCollapsed && (
          <p className="mt-4 text-sm leading-6 text-outline">{t(sectionMeta[activeItem.path])}</p>
        )}
      </div>

      <nav className={`flex-1 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`} aria-label="Navigation">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center rounded-2xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                isActive
                  ? 'bg-primary text-white shadow-[0_12px_30px_color-mix(in_srgb,var(--color-primary)_28%,transparent)]'
                  : 'text-on-surface hover:bg-surface-container hover:text-primary'
              } ${isCollapsed ? 'justify-center px-3 py-3.5' : 'gap-3 px-4 py-3'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`space-y-3 py-6 ${isCollapsed ? 'px-2' : 'px-5'}`}>
        {!isCollapsed && (
          <div className={`rounded-2xl p-4 ${panelSurface}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-outline">{t('viewing')}</p>
            <p className="mt-2 text-sm font-bold text-on-surface">{activeItem.name}</p>
            <p className="mt-1 text-sm text-outline">{t(sectionMeta[activeItem.path])}</p>
          </div>
        )}

        <button
          aria-label={t('logout')}
          title={isCollapsed ? t('logout') : undefined}
          onClick={handleLogout}
          className={`flex w-full items-center rounded-2xl border border-outline-variant/16 text-sm font-semibold text-on-surface transition-colors hover:border-error/30 hover:bg-error/8 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30 ${
            isCollapsed ? 'justify-center px-3 py-3.5' : 'gap-3 px-4 py-3'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!isCollapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
