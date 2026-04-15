import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { useTimeWeather } from '../contexts/TimeWeatherContext';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';
import ProfileMenu from './ProfileMenu';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { toggleLang, t } = useLang();
  const { timeStr, dateStr } = useTimeWeather();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  return (
    <header
      className="
      relative w-full sticky top-0 z-40
      bg-surface/80 backdrop-blur-xl
      border-b border-outline-variant/20
      flex justify-between items-center
      px-8 py-4 font-['Manrope'] antialiased tracking-tight
      transition-colors duration-300
      overflow-visible
    "
    >
      <div className="absolute inset-0 pointer-events-none scanline-sweep" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative flex items-center gap-4 sm:gap-8">
        <span className="md:hidden text-2xl font-black tracking-tighter text-primary neon-text" aria-label="Sentinel Logo">
          SENTINEL
        </span>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative group hud-corners">
            <select
              aria-label="Lựa chọn Thiết bị"
              className="
                appearance-none bg-surface-container border border-outline-variant/20
                rounded-xl px-4 py-2 pl-10 pr-8 text-sm font-bold text-on-surface
                hover:border-primary/50 focus:border-primary/60
                transition-all duration-200 outline-none
                focus:ring-1 focus:ring-primary/40
                cursor-pointer
              "
            >
              <option value="main-gate">Cửa Chính (Main Gate)</option>
              <option value="garage">Cửa Gara (Garage)</option>
              <option value="backdoor">Cửa Sau (Backyard)</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 group-hover:text-primary transition-colors pointer-events-none text-[18px]">
              vpn_key
            </span>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          <div
            className="
            flex items-center bg-surface-container-high rounded-xl px-4 py-2 w-64
            border border-outline-variant/20 transition-all duration-200
            focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/40
          "
          >
            <span className="material-symbols-outlined text-outline/60 mr-2 text-[18px]" aria-hidden="true">search</span>
            <input
              aria-label="Tìm kiếm trong hệ thống"
              className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full outline-none placeholder:text-outline/50"
              placeholder={t('search')}
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-5">
        <div className="hidden lg:flex flex-col items-end mr-2 relative">
          <span className="absolute -left-3 top-0 bottom-0 w-px bg-primary/20" />
          <span
            className="
            text-xl font-bold font-headline text-primary neon-text
            tracking-wider tabular-nums
          "
            style={{ fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', monospace" }}
          >
            {timeStr}
          </span>
          <span className="text-[9px] text-outline/60 tracking-[0.2em] uppercase">{dateStr}</span>
        </div>

        <div className="flex items-center gap-2 text-outline">
          <button
            onClick={toggleLang}
            className="
              material-symbols-outlined
              hover:bg-surface-container-high hover:text-primary
              p-2 rounded-lg transition-all duration-200 outline-none
              border border-transparent hover:border-primary/20
            "
            title="Chuyển ngôn ngữ"
          >
            language
          </button>
          <button
            onClick={toggleTheme}
            className="
              material-symbols-outlined
              hover:bg-surface-container-high hover:text-primary
              p-2 rounded-lg transition-all duration-200 outline-none
              border border-transparent hover:border-primary/20
            "
            title="Chuyển nền Sáng-Tối"
          >
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </button>

          <button
            className="
              relative p-2 rounded-lg transition-all duration-200 outline-none
              hover:bg-surface-container-high hover:text-primary
              border border-transparent hover:border-primary/20
              material-symbols-outlined text-outline
            "
            title="Cảnh báo"
          >
            notifications
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error">
              <span className="absolute inset-0 rounded-full bg-error animate-ping opacity-75" />
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface">{user?.fullName || t('admin')}</p>
            <p className="text-[10px] text-outline/60 w-36 truncate tracking-wider uppercase" title={user?.email}>
              {user?.role || 'MEMBER'}
            </p>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <UserAvatar
                src={user?.avatarUrl}
                name={user?.fullName}
                size="w-10 h-10"
                className="shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-surface online-ping" />
            </button>

            {menuOpen && <ProfileMenu user={user} onClose={() => setMenuOpen(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
