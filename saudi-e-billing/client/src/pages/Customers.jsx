import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Building2,
  DollarSign,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatSAR, formatDate } from '../utils/formatters';

export const Customers = () => {
  const { t, isArabic } = useLanguage();
  const {
    customers,
    invoices,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    companyNameEn: '',
    companyNameAr: '',
    email: '',
    phone: '',
    address: '',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    vatNumber: '300000000000003',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const totalCustomersCount = customers.length;
  const totalInvoicedAll = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.companyNameEn.toLowerCase().includes(q) ||
        (c.companyNameAr && c.companyNameAr.includes(q)) ||
        (c.vatNumber && c.vatNumber.includes(q)) ||
        c.city.toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name || '',
      companyNameEn: c.companyNameEn || '',
      companyNameAr: c.companyNameAr || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      city: c.city || 'Riyadh',
      country: c.country || 'Saudi Arabia',
      vatNumber: c.vatNumber || '',
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = isArabic ? 'اسم المسؤول مطلوب' : 'Contact person is required';
    if (!formData.companyNameEn.trim()) errs.companyNameEn = isArabic ? 'اسم المنشأة مطلوب' : 'Company name is required';
    if (!formData.vatNumber.trim() || formData.vatNumber.length !== 15) {
      errs.vatNumber = isArabic ? 'الرقم الضريبي السعودي يجب أن يتكون من 15 رقماً' : 'Saudi VAT number must be 15 digits';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setIsAddEditOpen(false);
    setEditingCustomer(null);
  };

  // Columns definition
  const columns = [
    {
      header: t('company'),
      key: 'company',
      render: (c) => (
        <div className="customer-cell">
          <div className="font-semibold text-sm text-forest cursor-pointer hover:underline" onClick={() => setViewingCustomer(c)}>
            {isArabic ? (c.companyNameAr || c.companyNameEn) : c.companyNameEn}
          </div>
          {c.companyNameAr && !isArabic && (
            <div className="text-muted text-xs">{c.companyNameAr}</div>
          )}
          <div className="text-xs text-muted mt-0.5 font-mono">
            {t('custVat')}: {c.vatNumber || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: t('custName'),
      key: 'name',
      render: (c) => (
        <div>
          <div className="text-sm font-medium">{c.name}</div>
          <div className="text-xs text-muted">{c.email}</div>
        </div>
      ),
    },
    {
      header: t('custCity'),
      key: 'city',
      render: (c) => (
        <span className="text-xs">
          {c.city}, {c.country}
        </span>
      ),
    },
    {
      header: t('custPhone'),
      key: 'phone',
      render: (c) => <span className="text-xs font-mono">{c.phone || '-'}</span>,
    },
    {
      header: t('actions'),
      key: 'actions',
      align: 'center',
      render: (c) => (
        <div className="table-actions-row">
          <button
            type="button"
            className="action-icon-btn"
            title={t('viewDetails')}
            onClick={() => setViewingCustomer(c)}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="action-icon-btn"
            title={t('edit')}
            onClick={() => handleOpenEdit(c)}
          >
            <Edit size={15} />
          </button>
          <button
            type="button"
            className="action-icon-btn text-danger hover:bg-red-50"
            title={t('delete')}
            onClick={() => setDeletingCustomerId(c.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  // Customer Transaction History calculation
  const customerInvoices = viewingCustomer
    ? invoices.filter(
        (i) =>
          i.customerId === viewingCustomer.id ||
          i.customerName === viewingCustomer.companyNameEn ||
          i.customerName === viewingCustomer.name
      )
    : [];

  const customerTotalSales = customerInvoices.reduce(
    (sum, i) => sum + (Number(i.grandTotal) || 0),
    0
  );

  return (
    <div className="page-container customers-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{t('navCustomers')}</h1>
          <p className="page-subtitle">
            {isArabic
              ? 'إدارة الحسابات التجارية، الأرقام الضريبية للعملاء، وسجلات التعامل المالي'
              : 'Client master directory, commercial VAT registries, and transactional histories.'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          {t('custNewCustomer')}
        </Button>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title={t('custTotal')}
          value={totalCustomersCount}
          icon={Users}
          colorScheme="forest"
        />
        <MetricCard
          title={t('custActive')}
          value={totalCustomersCount}
          subvalue={isArabic ? 'عملاء معتمدون بالسجل الضريبي' : 'Registered commercial accounts'}
          icon={Building2}
          colorScheme="emerald"
        />
        <MetricCard
          title={isArabic ? 'إجمالي فواتير العملاء' : 'Total Client Billing'}
          value={formatSAR(totalInvoicedAll, isArabic)}
          icon={DollarSign}
          colorScheme="gold"
        />
      </div>

      {/* Filter */}
      <div className="table-filter-bar">
        <div className="filter-search-wrap">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={isArabic ? 'ابحث باسم المنشأة، المسؤول، المدينة أو الرقم الضريبي...' : 'Search by company, contact person, city, or VAT #...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        keyField="id"
        emptyMessage={isArabic ? 'لم يتم العثور على أية عملاء' : 'No clients found'}
        emptySubtext={isArabic ? 'أضف عميلاً جديداً لربطه بالفواتير وعروض الأسعار' : 'Add a new client account to issue quotes and invoices.'}
        emptyAction={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            {t('custNewCustomer')}
          </Button>
        }
      />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingCustomer ? t('edit') : t('custNewCustomer')}
        size="md"
        footer={
          <div className="modal-actions-right">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveCustomer}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCustomer} className="customer-form-grid">
          <div className="form-group col-span-2">
            <label className="form-label">{t('custCompanyNameEn')} *</label>
            <input
              type="text"
              className={`input-field ${formErrors.companyNameEn ? 'border-danger' : ''}`}
              value={formData.companyNameEn}
              onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
              placeholder="e.g. Al-Fursan Contracting Co."
            />
            {formErrors.companyNameEn && (
              <span className="error-text">{formErrors.companyNameEn}</span>
            )}
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">{t('custCompanyNameAr')}</label>
            <input
              type="text"
              className="input-field font-arabic"
              value={formData.companyNameAr}
              onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
              placeholder="مثال: شركة الفرسان للمقاولات"
              dir="rtl"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('custName')} *</label>
            <input
              type="text"
              className={`input-field ${formErrors.name ? 'border-danger' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name of representative"
            />
            {formErrors.name && <span className="error-text">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('custVat')} *</label>
            <input
              type="text"
              maxLength="15"
              className={`input-field font-mono ${formErrors.vatNumber ? 'border-danger' : ''}`}
              value={formData.vatNumber}
              onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="300XXXXXXXX0003"
            />
            {formErrors.vatNumber && <span className="error-text">{formErrors.vatNumber}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('custEmail')}</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="billing@client.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('custPhone')}</label>
            <input
              type="text"
              className="input-field font-mono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+966 50 XXX XXXX"
            />
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">{t('custAddress')}</label>
            <input
              type="text"
              className="input-field"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Building No, Street Name, District"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('custCity')}</label>
            <input
              type="text"
              className="input-field"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Riyadh, Jeddah, Dammam..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('custCountry')}</label>
            <input
              type="text"
              className="input-field"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Customer Detail & Transaction History Modal */}
      {viewingCustomer && (
        <Modal
          isOpen={!!viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          title={viewingCustomer.companyNameEn || viewingCustomer.name}
          size="lg"
          footer={
            <div className="modal-actions-right">
              <Button variant="outline" onClick={() => setViewingCustomer(null)}>
                {t('close')}
              </Button>
            </div>
          }
        >
          <div className="customer-details-sheet">
            <div className="customer-meta-row">
              <div className="meta-block">
                <span className="text-xs text-muted block">{t('custName')}</span>
                <span className="font-semibold text-sm">{viewingCustomer.name}</span>
              </div>
              <div className="meta-block">
                <span className="text-xs text-muted block">{t('custVat')}</span>
                <span className="font-mono font-bold text-sm">{viewingCustomer.vatNumber}</span>
              </div>
              <div className="meta-block">
                <span className="text-xs text-muted block">{t('custCity')}</span>
                <span className="text-sm">{viewingCustomer.city}, {viewingCustomer.country}</span>
              </div>
              <div className="meta-block">
                <span className="text-xs text-muted block">{t('dashTotalSales')}</span>
                <span className="font-mono font-bold text-sm text-gold-dark">
                  {formatSAR(customerTotalSales, isArabic)}
                </span>
              </div>
            </div>

            <h4 className="font-semibold text-sm mt-5 mb-2">{t('custHistory')}</h4>
            {customerInvoices.length === 0 ? (
              <p className="text-xs text-muted p-4 bg-neutral-50 rounded-lg text-center">
                {isArabic ? 'لا توجد فواتير سابقة لهذا العميل' : 'No previous invoices recorded for this client.'}
              </p>
            ) : (
              <div className="table-responsive">
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>{t('invNumber')}</th>
                      <th>{t('date')}</th>
                      <th className="text-right">{t('total')}</th>
                      <th className="text-center">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="font-mono font-bold text-xs">{inv.invoiceNumber}</td>
                        <td className="text-xs text-muted">{formatDate(inv.invoiceDate, isArabic)}</td>
                        <td className="text-right font-mono font-semibold text-xs">
                          {formatSAR(inv.grandTotal, isArabic)}
                        </td>
                        <td className="text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCustomerId}
        onClose={() => setDeletingCustomerId(null)}
        onConfirm={() => {
          deleteCustomer(deletingCustomerId);
          setDeletingCustomerId(null);
        }}
        title={t('confirmTitle')}
        message={t('confirmDeleteCustomer')}
        type="danger"
      />
    </div>
  );
};
