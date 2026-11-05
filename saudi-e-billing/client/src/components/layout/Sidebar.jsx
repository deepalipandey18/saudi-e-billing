import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileSpreadsheet,
  Truck,
  ReceiptText,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { language, toggleLanguage, t, isArabic } = useLanguage();
  const { lowStockProducts, companySettings } = useApp();

  const navItems = [
    { to: '/', label: t('navDashboard'), icon: LayoutDashboard },
    {
      to: '/inventory',
      label: t('navInventory'),
      icon: Package,
      badge: lowStockProducts.length > 0 ? lowStockProducts.length : null,
      badgeColor: 'warning',
    },
    { to: '/quotations', label: t('navQuotations'), icon: FileSpreadsheet },
    { to: '/delivery-notes', label: t('navDeliveryNotes'), icon: Truck },
    { to: '/invoices', label: t('navTaxInvoices'), icon: ReceiptText },
    { to: '/customers', label: t('navCustomers'), icon: Users },
    { to: '/reports', label: t('navReports'), icon: BarChart3 },
    { to: '/settings', label: t('navSettings'), icon: Settings },
  ];

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${
          isMobileOpen ? 'sidebar-mobile-open' : ''
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="sidebar-brand">
          <div className="brand-logo-container">
            <div className="brand-emblem">
              <ShieldCheck size={22} className="text-gold" />
            </div>
            {!isCollapsed && (
              <div className="brand-text">
                <span className="brand-name">{t('appTitle')}</span>
                <span className="brand-tagline">{t('tagline')}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sidebar-collapse-btn desktop-only"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
            ) : (
              isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="nav-item">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                    onClick={handleLinkClick}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span className={`nav-badge badge-${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Company Footer Profile */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">
              <Building2 size={18} className="text-gold" />
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <p className="user-name">
                  {isArabic ? companySettings.companyNameAr : companySettings.companyNameEn}
                </p>
                <div className="user-meta-role">
                  <span className="online-indicator" />
                  <span>{t('role')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Language Toggle inside Sidebar */}
          <button
            type="button"
            className="sidebar-lang-toggle"
            onClick={toggleLanguage}
            title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe size={15} className="text-gold" />
            {!isCollapsed && (
              <span>
                {language === 'ar' ? 'English (EN)' : 'العربية (AR)'}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

