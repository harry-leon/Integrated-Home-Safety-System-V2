'use client';

import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';

export default function DashboardLayout({ children, tabs = [], activeTab = '' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

      <div className="main-content">
        <TopBar
          tabs={tabs}
          activeTab={activeTab}
          onMenuToggle={handleMenuToggle}
        />

        <div className="main-content__body">
          {children}
        </div>
      </div>

      <Footer />
    </>
  );
}
