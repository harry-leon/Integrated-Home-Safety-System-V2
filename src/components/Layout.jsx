import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TubesCursor from './TubesCursor';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body transition-colors duration-300">
      <TubesCursor />
      <Sidebar />
      <main className="flex-1 md:ml-64 bg-background h-screen overflow-y-auto relative z-10 transition-colors duration-300">
        <Header />
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Navigation (suppressed on desktop) */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/20 flex justify-around items-center py-4 px-6 z-50">
        <NavLink to="/" className={({isActive}) => `flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded pl-2 pr-2 ${isActive ? 'text-primary' : 'text-outline hover:text-primary transition-colors'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-bold mt-1">Tổng quan</span>
        </NavLink>
        <NavLink to="/remote" className={({isActive}) => `flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded pl-2 pr-2 ${isActive ? 'text-primary' : 'text-outline hover:text-primary transition-colors'}`}>
          <span className="material-symbols-outlined">lock</span>
          <span className="text-[10px] font-bold mt-1">Khóa</span>
        </NavLink>
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded pl-2 pr-2 ${isActive ? 'text-primary' : 'text-outline hover:text-primary transition-colors'}`}>
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px] font-bold mt-1">Cảnh báo</span>
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded pl-2 pr-2 ${isActive ? 'text-primary' : 'text-outline hover:text-primary transition-colors'}`}>
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold mt-1">Cài đặt</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
