import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useTheme } from '../contexts/ThemeContext';
import UserAvatar from './UserAvatar';

const actionBase =
  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm transition-all duration-200 border border-transparent hover:border-primary/20 hover:bg-surface-container-high';

const ProfileMenu = ({ user, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLang();
  const { theme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuSurface = theme === 'dark' ? 'bg-[#0b1d2a] border-cyan-950/60' : 'bg-surface-container border-outline-variant/20';
  const itemHover = theme === 'dark' ? 'hover:bg-[#102434] hover:border-cyan-900/60' : 'hover:border-primary/20 hover:bg-surface-container-high';
  const actionClass = `${actionBase} ${itemHover}`;

  const goTo = (section, mode) => {
    const params = new URLSearchParams();
    if (section) params.set('section', section);
    if (mode) params.set('mode', mode);
    navigate(`/settings${params.toString() ? `?${params.toString()}` : ''}`);
    onClose?.();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
      onClose?.();
    }
  };

  return (
    <div className={`absolute right-0 top-[calc(100%+1rem)] z-50 w-[22rem] overflow-hidden rounded-[1.75rem] border shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${menuSurface}`}>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="p-5 border-b border-outline-variant/15">
        <div className="flex items-start gap-4">
          <UserAvatar src={user?.avatarUrl} name={user?.fullName} size="w-16 h-16" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-black text-on-surface truncate">{user?.fullName || t('sentinel_user')}</p>
            <p className="text-xs text-outline truncate mt-1">{user?.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-primary data-pulse" />
                {user?.role || 'MEMBER'}
              </span>
            </div>
            {user?.bio && (
              <p className="mt-3 text-xs text-outline leading-relaxed max-h-10 overflow-hidden">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <button type="button" onClick={() => goTo('profile')} className={actionClass}>
          <span className="material-symbols-outlined text-[20px] text-primary">person</span>
          <div>
            <div className="font-semibold text-on-surface">{t('profile_view')}</div>
            <div className="text-[11px] text-outline">{t('profile_view_desc')}</div>
          </div>
        </button>

        <button type="button" onClick={() => goTo('profile', 'edit')} className={actionClass}>
          <span className="material-symbols-outlined text-[20px] text-primary">edit_square</span>
          <div>
            <div className="font-semibold text-on-surface">{t('profile_edit')}</div>
            <div className="text-[11px] text-outline">{t('profile_edit_desc')}</div>
          </div>
        </button>

        <button type="button" onClick={() => goTo('preferences')} className={actionClass}>
          <span className="material-symbols-outlined text-[20px] text-primary">settings</span>
          <div>
            <div className="font-semibold text-on-surface">{t('preferences')}</div>
            <div className="text-[11px] text-outline">{t('preferences_desc')}</div>
          </div>
        </button>

        <button type="button" onClick={() => goTo('logins')} className={actionClass}>
          <span className="material-symbols-outlined text-[20px] text-primary">devices</span>
          <div>
            <div className="font-semibold text-on-surface">{t('login_activity')}</div>
            <div className="text-[11px] text-outline">{t('login_activity_desc')}</div>
          </div>
        </button>
      </div>

      <div className="p-3 pt-0">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold bg-error/10 text-error border border-error/15 hover:bg-error/15 transition-all disabled:opacity-60"
        >
          {isLoggingOut ? (
            <>
              <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
              {t('signing_out')}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t('logout')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;
