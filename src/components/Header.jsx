import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { useTimeWeather } from '../contexts/TimeWeatherContext';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';
import ProfileMenu from './ProfileMenu';
import { smartLockApi } from '../services/api';

const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t, formatAlertType, formatRelativeTime } = useLang();
  const { timeStr, dateStr } = useTimeWeather();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }

      if (!notificationsRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAlerts = async () => {
      try {
        const alerts = await smartLockApi.getAlerts();
        if (!mounted) return;

        const unresolvedAlerts = Array.isArray(alerts)
          ? alerts
              .filter((alert) => !alert.resolved)
              .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          : [];
        const nextCount = unresolvedAlerts.length;
        setActiveAlertCount(nextCount);
        setRecentAlerts(unresolvedAlerts.slice(0, 4));
      } catch {
        if (mounted) {
          setActiveAlertCount(0);
          setRecentAlerts([]);
        }
      }
    };

    loadAlerts();
    const intervalId = setInterval(loadAlerts, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const pageMeta = {
    '/': {
      title: t('page_overview_title'),
      subtitle: t('page_overview_subtitle'),
    },
    '/remote': {
      title: t('page_remote_title'),
      subtitle: t('page_remote_subtitle'),
    },
    '/fingerprints': {
      title: t('page_fingerprints_title'),
      subtitle: t('page_fingerprints_subtitle'),
    },
    '/logs': {
      title: t('page_logs_title'),
      subtitle: t('page_logs_subtitle'),
    },
    '/analytics': {
      title: t('page_analytics_title'),
      subtitle: t('page_analytics_subtitle'),
    },
    '/settings': {
      title: t('page_settings_title'),
      subtitle: t('page_settings_subtitle'),
    },
  };
  const meta = pageMeta[location.pathname] || pageMeta['/'];
  const darkNavSurface = theme === 'dark' ? 'bg-[#0e2231] border-cyan-950/60' : 'bg-surface border-outline-variant/16';
  const darkPanelSurface = theme === 'dark' ? 'bg-[#0b1d2a] border-cyan-950/60' : 'bg-surface-container border-outline-variant/18';
  const darkHeaderSurface = theme === 'dark' ? 'bg-[#071521] border-cyan-950/60' : 'bg-background border-outline-variant/16';

  return (
    <header className={`sticky top-0 z-40 border-b ${darkHeaderSurface}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sentinel</p>
          <h1 className="mt-2 text-xl font-black tracking-tight text-on-surface sm:text-2xl lg:text-3xl">{meta.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-outline">{meta.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:justify-end">
          <div className={`hidden rounded-2xl border px-4 py-3 lg:block ${darkPanelSurface}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-outline">{t('system_time')}</p>
            <p className="mt-1 text-base font-bold text-on-surface">{timeStr}</p>
            <p className="text-xs text-outline">{dateStr}</p>
          </div>

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((current) => !current)}
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl border text-on-surface transition-colors hover:border-primary/30 hover:text-primary ${darkNavSurface}`}
              title={t('notifications')}
              aria-label={t('open_notifications')}
              aria-haspopup="dialog"
              aria-expanded={notificationsOpen}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {activeAlertCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 min-w-[1.25rem] rounded-full bg-error px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                  {activeAlertCount > 9 ? '9+' : activeAlertCount}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className={`absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[22rem] overflow-hidden rounded-[1.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.18)] ${darkPanelSurface}`}>
                <div className="flex items-start justify-between gap-4 border-b border-outline-variant/12 px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t('recent_notifications')}</p>
                    <p className="mt-1 text-xs text-outline">
                      {activeAlertCount > 0 ? `${activeAlertCount} ${t('unresolved_alerts')}` : t('no_new_notifications')}
                    </p>
                  </div>
                  <Link
                    to="/logs"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {t('view_all')}
                  </Link>
                </div>

                <div className="max-h-[22rem] space-y-2 overflow-y-auto p-3">
                  {recentAlerts.length === 0 ? (
                    <div className="rounded-2xl border border-green-500/18 bg-green-500/8 px-4 py-4">
                      <p className="text-sm font-semibold text-green-700">{t('system_safe')}</p>
                      <p className="mt-1 text-xs leading-5 text-outline">{t('system_safe_desc')}</p>
                    </div>
                  ) : (
                    recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-cyan-950/60 bg-[#07141f]' : 'border-outline-variant/12 bg-background'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">{formatAlertType(alert.alertType)}</p>
                            <p className="mt-1 text-xs leading-5 text-outline">
                              {alert.message || t('hero_needs_review')}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-error/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-error">
                            {alert.severity || 'alert'}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] text-outline">{formatRelativeTime(alert.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <button
            onClick={toggleLang}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary ${darkNavSurface}`}
            title={t('switch_language')}
          >
            {lang === 'vn' ? 'VI' : 'EN'}
          </button>

          <button
            onClick={toggleTheme}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-on-surface transition-colors hover:border-primary/30 hover:text-primary ${darkNavSurface}`}
            title={t('switch_theme')}
          >
            <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-2 transition-all hover:bg-white/5 active:scale-95 ${darkNavSurface}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-on-surface">{user?.fullName || t('sentinel_user')}</p>
                <p className="text-xs text-outline font-bold uppercase tracking-widest">{user?.role || 'MEMBER'}</p>
              </div>

              <div className="relative">
                <UserAvatar
                  src={user?.avatarUrl}
                  name={user?.fullName}
                  size="w-10 h-10"
                  className="shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500" />
              </div>
            </button>

            {menuOpen && <ProfileMenu user={user} onClose={() => setMenuOpen(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
