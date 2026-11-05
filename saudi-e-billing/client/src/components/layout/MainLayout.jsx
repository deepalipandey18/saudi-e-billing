import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/ToastContainer';
import { useLanguage } from '../../context/LanguageContext';

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isArabic } = useLanguage();
  const navigate = useNavigate();

  const handleOpenNewInvoice = () => {
    navigate('/invoices?action=new');
  };

  return (
    <div className={`app-shell ${isArabic ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className={`app-main-wrapper ${isCollapsed ? 'main-collapsed' : ''}`}>
        <Topbar
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          onOpenNewInvoice={handleOpenNewInvoice}
        />

        <main className="app-content-body">
          <Outlet />
        </main>
      </div>

      {/* Floating Toasts */}
      <ToastContainer />
    </div>
  );
};

