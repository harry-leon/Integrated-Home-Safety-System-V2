import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingMicWidget from './FloatingMicWidget';

const mobileNavItems = [
  { label: 'Tong quan', icon: 'dashboard', path: '/' },
  { label: 'Dieu khien', icon: 'lock', path: '/remote' },
  { label: 'Nhat ky', icon: 'history', path: '/logs' },
  { label: 'Tai khoan', icon: 'person', path: '/settings' },
];

const Layout = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar_collapsed');
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body transition-colors duration-300">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
      />
      <main
        className={`relative z-10 h-screen flex-1 overflow-y-auto bg-background transition-[margin] duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header />
        <div className="mx-auto max-w-7xl space-y-8 px-5 pb-28 pt-6 sm:px-8 md:pb-8">
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-outline-variant/20 bg-surface/95 px-4 py-3 backdrop-blur-xl md:hidden"
      >
        {mobileNavItems.map((item) => {
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-w-[68px] flex-col items-center rounded-xl px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive ? 'bg-primary/10 text-primary' : 'text-outline transition-colors hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="mt-1 text-[11px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <FloatingMicWidget />
    </div>
  );
};

export default Layout;
