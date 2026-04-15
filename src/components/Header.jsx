import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { useTimeWeather } from '../contexts/TimeWeatherContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { toggleLang, t } = useLang();
  const { timeStr, dateStr } = useTimeWeather();
  const { user } = useAuth();

  return (
    <header className="w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center px-8 py-4 font-['Manrope'] antialiased tracking-tight transition-colors duration-300">
      <div className="flex items-center gap-4 sm:gap-8">
        <span className="md:hidden text-2xl font-black tracking-tighter text-primary" aria-label="Sentinel Logo">SENTINEL</span>
        <div className="hidden md:flex items-center gap-4">
          <div className="relative group">
            <select aria-label="Lựa chọn Thiết bị" className="appearance-none bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2 pl-10 pr-8 text-sm font-bold text-on-surface hover:border-primary transition-all duration-300 outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm">
              <option value="main-gate">🚪 Cửa Chính (Main Gate)</option>
              <option value="garage">🚗 Cửa Gara (Garage)</option>
              <option value="backdoor">🌿 Cửa Sau (Backyard)</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-hover:text-primary transition-colors pointer-events-none text-[18px]">vpn_key</span>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
          </div>

          <div className="flex items-center bg-surface-container-high rounded-xl px-4 py-2 w-64 border border-outline-variant/20 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
            <span className="material-symbols-outlined text-outline mr-2 text-[18px]" aria-hidden="true">search</span>
            <input aria-label="Tìm kiếm trong hệ thống" className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full outline-none placeholder:text-outline" placeholder={t('search')} type="text" />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Real-time Clock Element */}
        <div className="hidden lg:flex flex-col items-end mr-4">
          <span className="text-xl font-bold font-headline text-on-surface" style={{ fontVariantNumeric: 'tabular-nums' }}>{timeStr}</span>
          <span className="text-xs text-outline">{dateStr}</span>
        </div>

        <div className="flex items-center gap-4 text-outline">
          <button onClick={toggleLang} className="material-symbols-outlined hover:bg-surface-container-high hover:text-on-surface p-2 rounded-full transition-all duration-300 outline-none" title="Chuyển ngôn ngữ / Switch Language">
            language
          </button>
          <button onClick={toggleTheme} className="material-symbols-outlined hover:bg-surface-container-high hover:text-on-surface p-2 rounded-full transition-all duration-300 outline-none" title="Chuyển nền Sáng-Tối / Switch Theme">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </button>
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/20">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface">{user?.fullName || t('admin')}</p>
            <p className="text-xs text-outline w-32 truncate" title={user?.email}>{user?.email || t('admin_sub')}</p>
          </div>
          <img className="w-10 h-10 rounded-full object-cover border border-outline-variant/20" alt="Admin Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0W6fRALKTF9hZUnU0dGoofTFJYoyA6XRsdFNaqJZoYKeGWAY0vjkNfr0CHNshgwRniAOjZvkMDFkUnwOisPywNOFrJtiTUrLkdAwJblflKbUIg1Xt7g-96Ed7jUkskDSzCzz64OrTBrucYs7caqAx0LLKcRZ6jdGTFXBt0VFAwb5WQ23C6Q6_CU0QmVJ0ophnY74jT1d75FHy0ELqW2kTtcNw5xGQI_5oX3jd8WsBfwz-985EMDO3nhr7RwXZhquC6HMfPSp6tGZP" />
        </div>
      </div>
    </header>
  );
};

export default Header;
