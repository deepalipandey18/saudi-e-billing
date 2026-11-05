import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Globe,
  Plus,
  AlertTriangle,
  ReceiptText,
  Package,
  Users,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { formatSAR } from '../../utils/formatters';

export const Topbar = ({ onToggleMobileSidebar, onOpenNewInvoice }) => {
  const { language, setLanguage, t, isArabic } = useLanguage();
  const { products, invoices, quotations, customers, lowStockProducts } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Notifications dropdown state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return [{ label: t('navDashboard'), to: '/' }];
    if (path.startsWith('/inventory')) return [{ label: t('navDashboard'), to: '/' }, { label: t('navInventory'), to: '/inventory' }];
    if (path.startsWith('/quotations')) return [{ label: t('navDashboard'), to: '/' }, { label: t('navQuotations'), to: '/quotations' }];
    if (path.startsWith('/delivery-notes')) return [{ label: t('navDashboard'), to: '/' }, { label: t('navDeliveryNotes'), to: '/delivery-notes' }];
    if (path.startsWith('/invoices')) return [{ label: t('navDashboard'), to: '/' }, { label: t('navTaxInvoices'), to: '/invoices' }];
    if (path.startsWith('/customers')) return [{ label: t('navDashboard'), to: '/' }, { label: t('navCustomers'), to: '/customers' }];
    if (path.startsWith('/reports')) return [{ label: t('navDashboard'), to: '/' }, { label: t('navReports'), to: '/reports' }];
    if (path.startsWith('/settings')) return [{ label: t('navDashboard'), to: '/' }, { label: t('navSettings'), to: '/settings' }];
    return [{ label: t('navDashboard'), to: '/' }];
  };

  // Filter search results across entities
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;
    const q = searchQuery.toLowerCase();

    const matchedProducts = products
      .filter((p) => p.nameEn.toLowerCase().includes(q) || (p.nameAr && p.nameAr.includes(q)) || p.sku.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedInvoices = invoices
      .filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedQuotations = quotations
      .filter((qt) => qt.quotationNumber.toLowerCase().includes(q) || qt.customerName.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedCustomers = customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.companyNameEn.toLowerCase().includes(q))
      .slice(0, 3);

    const totalCount =
      matchedProducts.length +
      matchedInvoices.length +
      matchedQuotations.length +
      matchedCustomers.length;

    return {
      products: matchedProducts,
      invoices: matchedInvoices,
      quotations: matchedQuotations,
      customers: matchedCustomers,
      totalCount,
    };
  }, [searchQuery, products, invoices, quotations, customers]);

  // Notifications calculation
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const notificationCount = lowStockProducts.length + overdueInvoices.length;

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="topbar-icon-btn mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb path */}
        <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
          {getBreadcrumbs().map((b, idx, arr) => (
            <React.Fragment key={b.to}>
              {idx > 0 && <span className="breadcrumb-separator">/</span>}
              <Link
                to={b.to}
                className={`breadcrumb-item ${idx === arr.length - 1 ? 'breadcrumb-current' : ''}`}
              >
                {b.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Global Search Bar */}
      <div className="topbar-center" ref={searchRef}>
        <div className="topbar-search-box">
          <Search size={16} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchOpen && searchResults && (
          <div className="topbar-search-dropdown">
            {searchResults.totalCount === 0 ? (
              <div className="search-no-results">
                {isArabic ? 'لم يتم العثور على أية نتائج مطابقة' : 'No matching records found'}
              </div>
            ) : (
              <div className="search-results-list">
                {searchResults.invoices.length > 0 && (
                  <div className="search-group">
                    <span className="search-group-title">
                      <ReceiptText size={14} /> {t('navTaxInvoices')}
                    </span>
                    {searchResults.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="search-item"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate('/invoices');
                        }}
                      >
                        <span className="font-mono font-bold">{inv.invoiceNumber}</span>
                        <span className="text-muted text-xs">{inv.customerName}</span>
                        <span className="search-item-meta">{formatSAR(inv.grandTotal, isArabic)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.products.length > 0 && (
                  <div className="search-group">
                    <span className="search-group-title">
                      <Package size={14} /> {t('navInventory')}
                    </span>
                    {searchResults.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="search-item"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate('/inventory');
                        }}
                      >
                        <span className="font-semibold">
                          {isArabic ? (prod.nameAr || prod.nameEn) : prod.nameEn}
                        </span>
                        <span className="text-muted text-xs font-mono">{prod.sku}</span>
                        <span className="search-item-meta">{formatSAR(prod.sellingPrice, isArabic)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.quotations.length > 0 && (
                  <div className="search-group">
                    <span className="search-group-title">
                      <FileSpreadsheet size={14} /> {t('navQuotations')}
                    </span>
                    {searchResults.quotations.map((qt) => (
                      <div
                        key={qt.id}
                        className="search-item"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate('/quotations');
                        }}
                      >
                        <span className="font-mono">{qt.quotationNumber}</span>
                        <span className="text-muted text-xs">{qt.customerName}</span>
                        <span className="search-item-meta">{formatSAR(qt.grandTotal, isArabic)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.customers.length > 0 && (
                  <div className="search-group">
                    <span className="search-group-title">
                      <Users size={14} /> {t('navCustomers')}
                    </span>
                    {searchResults.customers.map((c) => (
                      <div
                        key={c.id}
                        className="search-item"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate('/customers');
                        }}
                      >
                        <span className="font-semibold">{c.companyNameEn || c.name}</span>
                        <span className="text-muted text-xs">{c.city}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-right">
        {/* Prominent Direct Segmented Language Switcher */}
        <div className="topbar-lang-segment-group" role="group" aria-label="Language selection">
          <Globe size={15} className="lang-globe-icon text-gold" />
          <button
            type="button"
            className={`lang-segment-btn ${language === 'en' ? 'lang-segment-active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
          >
            English
          </button>
          <span className="lang-segment-divider">|</span>
          <button
            type="button"
            className={`lang-segment-btn font-arabic ${language === 'ar' ? 'lang-segment-active' : ''}`}
            onClick={() => setLanguage('ar')}
            aria-pressed={language === 'ar'}
          >
            العربية
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="topbar-dropdown-wrap" ref={notifRef}>
          <button
            type="button"
            className="topbar-icon-btn relative"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="notification-badge-dot">{notificationCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="topbar-dropdown-menu notif-menu">
              <div className="notif-header">
                <h4>{t('notifications')}</h4>
                <span className="text-xs text-muted">
                  {notificationCount} {isArabic ? 'تنبيهات نشطة' : 'active'}
                </span>
              </div>
              <div className="notif-body">
                {lowStockProducts.length > 0 && (
                  <div
                    className="notif-item cursor-pointer"
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('/inventory');
                    }}
                  >
                    <div className="notif-icon-circle bg-warning-light text-warning">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="notif-text">
                      <p className="notif-title">
                        {isArabic
                          ? `${lowStockProducts.length} أصناف وصلت لحد التنبيه`
                          : `${lowStockProducts.length} Products Low on Stock`}
                      </p>
                      <p className="notif-sub text-muted">
                        {lowStockProducts.map((p) => p.nameEn).slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {overdueInvoices.length > 0 && (
                  <div
                    className="notif-item cursor-pointer"
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('/invoices');
                    }}
                  >
                    <div className="notif-icon-circle bg-danger-light text-danger">
                      <ReceiptText size={16} />
                    </div>
                    <div className="notif-text">
                      <p className="notif-title">
                        {isArabic
                          ? `${overdueInvoices.length} فواتير متأخرة السداد`
                          : `${overdueInvoices.length} Overdue Invoices`}
                      </p>
                      <p className="notif-sub text-muted">
                        {overdueInvoices.map((i) => i.invoiceNumber).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {notificationCount === 0 && (
                  <div className="notif-empty">
                    <p className="text-sm text-muted">
                      {isArabic ? 'لا توجد تنبيهات عاجلة' : 'No urgent alerts.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            if (onOpenNewInvoice) {
              onOpenNewInvoice();
            } else {
              navigate('/invoices');
            }
          }}
          className="topbar-cta-btn"
        >
          {t('createInvoice')}
        </Button>
      </div>
    </header>
  );
};
