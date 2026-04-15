import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';

const actionBase =
  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm transition-all duration-200 border border-transparent hover:border-primary/20 hover:bg-surface-container-high';

const ProfileMenu = ({ user, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <div className="absolute right-0 top-[calc(100%+1rem)] w-[22rem] rounded-[1.75rem] border border-outline-variant/20 bg-surface-container/95 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.28)] overflow-hidden z-50">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="p-5 border-b border-outline-variant/15">
        <div className="flex items-start gap-4">
          <UserAvatar src={user?.avatarUrl} name={user?.fullName} size="w-16 h-16" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-black text-on-surface truncate">{user?.fullName || 'Sentinel User'}</p>
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
        <button type="button" onClick={() => goTo('profile')} className={actionBase}>
          <span className="material-symbols-outlined text-[20px] text-primary">person</span>
          <div>
            <div className="font-semibold text-on-surface">View profile</div>
            <div className="text-[11px] text-outline">Review your account details</div>
          </div>
        </button>

        <button type="button" onClick={() => goTo('profile', 'edit')} className={actionBase}>
          <span className="material-symbols-outlined text-[20px] text-primary">edit_square</span>
          <div>
            <div className="font-semibold text-on-surface">Edit profile</div>
            <div className="text-[11px] text-outline">Update avatar and personal info</div>
          </div>
        </button>

        <button type="button" onClick={() => goTo('preferences')} className={actionBase}>
          <span className="material-symbols-outlined text-[20px] text-primary">settings</span>
          <div>
            <div className="font-semibold text-on-surface">Settings</div>
            <div className="text-[11px] text-outline">Appearance and account preferences</div>
          </div>
        </button>

        <button type="button" onClick={() => goTo('logins')} className={actionBase}>
          <span className="material-symbols-outlined text-[20px] text-primary">devices</span>
          <div>
            <div className="font-semibold text-on-surface">Login activity</div>
            <div className="text-[11px] text-outline">Recent sessions and devices</div>
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
              Signing out...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;
