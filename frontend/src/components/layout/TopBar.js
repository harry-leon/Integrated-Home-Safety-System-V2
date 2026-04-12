'use client';

import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function TopBar({ tabs = [], activeTab = '', onMenuToggle }) {
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useLanguage();

  return (
    <header className="topbar">
      <div className="topbar__left">
        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Brand */}
        <span className="topbar__brand">{t('brand')}</span>

        {/* Context Tabs */}
        {tabs.length > 0 && (
          <div className="topbar__tabs">
            {tabs.map((tab) => (
              <a
                key={tab.label}
                href={tab.href || '#'}
                className={`topbar__tab ${
                  tab.label === activeTab ? 'topbar__tab--active' : ''
                }`}
              >
                {t(tab.label)}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="topbar__right">
        {/* Utility buttons */}
        <div className="topbar__utils">
          <button 
            className="topbar__util-btn" 
            onClick={toggleLang}
            aria-label="Toggle Language"
            title={lang === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
          >
            <span className="material-symbols-outlined" style={{ color: lang === 'vi' ? 'var(--primary)' : 'inherit' }}>language</span>
          </button>
          <button
            className="topbar__util-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>

        {/* User profile */}
        <div className="topbar__user">
          <div className="topbar__user-info">
            <p className="topbar__user-name">Admin User</p>
            <p className="topbar__user-role">{t('userRole')}</p>
          </div>
          <div
            className="topbar__user-avatar"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0f62fe 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
