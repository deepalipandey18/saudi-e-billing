import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
  Truck,
  ReceiptText,
  DollarSign,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { QuotationPrintModal } from '../components/print/QuotationPrintModal';
import { formatSAR, formatDate, calculateTotals } from '../utils/formatters';

export const Quotations = () => {
  const { t, isArabic } = useLanguage();
  const {
    quotations,
    products,
    customers,
    companySettings,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    updateQuotationStatus,
    convertQuotationToDeliveryNote,
    convertQuotationToInvoice,
  } = useApp();

  const [searchParams] = useSearchParams();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(
    searchParams.get('action') === 'new'
  );
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [deletingQuotationId, setDeletingQuotationId] = useState(null);

  // Form State
  const getInitialForm = () => {
    const defaultCust = customers[0] || {};
    const defaultProd = products[0] || {};
    return {
      quotationNumber: `${companySettings?.quotationPrefix || 'QT-'}${Date.now().toString().slice(-5)}`,
      customerId: defaultCust.id || '',
      customerName: defaultCust.companyNameEn || defaultCust.name || '',
      customerVatNumber: defaultCust.vatNumber || '',
      customerEmail: defaultCust.email || '',
      customerAddress: defaultCust.address || '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Draft',
      notes: 'Quotation valid for 30 calendar days. Includes standard delivery and 1-year commercial warranty.',
      items: [
        {
          productId: defaultProd.id || '',
          nameEn: defaultProd.nameEn || 'Default Product',
          nameAr: defaultProd.nameAr || '',
          sku: defaultProd.sku || '',
          quantity: 1,
          unitPrice: defaultProd.sellingPrice || 100,
          discount: 0,
          vatRate: defaultProd.vatRate || 15,
        },
      ],
    };
  };

  const [formData, setFormData] = useState(getInitialForm);
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const totalQuotationsCount = quotations.length;
  const acceptedValue = quotations
    .filter((q) => q.status === 'Accepted')
    .reduce((sum, q) => sum + (Number(q.grandTotal) || 0), 0);
  const pendingCount = quotations.filter((q) => q.status === 'Sent' || q.status === 'Draft').length;
  const conversionRate = totalQuotationsCount > 0
    ? Math.round((quotations.filter((q) => q.status === 'Accepted').length / totalQuotationsCount) * 100)
    : 0;

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        q.quotationNumber?.toLowerCase().includes(query) ||
        q.customerName?.toLowerCase().includes(query);

      const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  // Form Item Calculations
  const calculatedFormTotals = useMemo(() => {
    return calculateTotals(formData.items);
  }, [formData.items]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingQuotation(null);
    setFormData(getInitialForm());
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (qt) => {
    setEditingQuotation(qt);
    setFormData({
      quotationNumber: qt.quotationNumber,
      customerId: qt.customerId || '',
      customerName: qt.customerName || '',
      customerVatNumber: qt.customerVatNumber || '',
      customerEmail: qt.customerEmail || '',
      customerAddress: qt.customerAddress || '',
      issueDate: qt.issueDate,
      expiryDate: qt.expiryDate,
      status: qt.status,
      notes: qt.notes || '',
      items: qt.items.map((i) => ({ ...i })),
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleCustomerSelect = (customerId) => {
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.companyNameEn || cust.name,
        customerVatNumber: cust.vatNumber,
        customerEmail: cust.email,
        customerAddress: cust.address,
      }));
    }
  };

  const handleProductSelect = (index, productId) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        productId: prod.id,
        nameEn: prod.nameEn,
        nameAr: prod.nameAr,
        sku: prod.sku,
        unitPrice: prod.sellingPrice,
        vatRate: prod.vatRate || 15,
      };
      return { ...prev, items: newItems };
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    const defaultProd = products[0] || {};
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: defaultProd.id || '',
          nameEn: defaultProd.nameEn || '',
          nameAr: defaultProd.nameAr || '',
          sku: defaultProd.sku || '',
          quantity: 1,
          unitPrice: defaultProd.sellingPrice || 100,
          discount: 0,
          vatRate: 15,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.customerName) errs.customerName = isArabic ? 'يرجى اختيار العميل' : 'Customer is required';
    if (!formData.items || formData.items.length === 0) {
      errs.items = isArabic ? 'يجب إضافة صنف واحد على الأقل' : 'At least one item is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveQuotation = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingQuotation) {
      updateQuotation(editingQuotation.id, formData);
    } else {
      addQuotation(formData);
    }
    setIsAddEditOpen(false);
    setEditingQuotation(null);
  };

  // Columns definition
  const columns = [
    {
      header: t('qtNumber'),
      key: 'quotationNumber',
      render: (q) => (
        <span className="font-mono font-bold text-sm text-forest cursor-pointer hover:underline" onClick={() => setViewingQuotation(q)}>
          {q.quotationNumber}
        </span>
      ),
    },
    {
      header: t('customer'),
      key: 'customerName',
      render: (q) => (
        <div>
          <div className="font-semibold text-sm">{q.customerName}</div>
          {q.customerVatNumber && (
            <div className="font-mono text-muted text-xs">VAT: {q.customerVatNumber}</div>
          )}
        </div>
      ),
    },
    {
      header: t('qtIssueDate'),
      key: 'issueDate',
      render: (q) => <span className="text-xs text-muted">{formatDate(q.issueDate, isArabic)}</span>,
    },
    {
      header: t('qtExpiryDate'),
      key: 'expiryDate',
      render: (q) => (
        <span className="text-xs text-gold-dark font-medium">
          {formatDate(q.expiryDate, isArabic)}
        </span>
      ),
    },
    {
      header: t('grandTotal'),
      key: 'grandTotal',
      align: 'right',
      render: (q) => (
        <div>
          <div className="font-mono font-bold text-sm">{formatSAR(q.grandTotal, isArabic)}</div>
          <div className="font-mono text-xs text-muted">
            VAT: {formatSAR(q.vatTotal, isArabic)}
          </div>
        </div>
      ),
    },
    {
      header: t('status'),
      key: 'status',
      align: 'center',
      render: (q) => <StatusBadge status={q.status} />,
    },
    {
      header: t('actions'),
      key: 'actions',
      align: 'center',
      render: (q) => (
        <div className="table-actions-row">
          <button
            type="button"
            className="action-icon-btn"
            title={t('viewDetails')}
            onClick={() => setViewingQuotation(q)}
          >
            <Eye size={15} />
          </button>

          {/* Quick status dropdown / workflow */}
          {q.status !== 'Accepted' && (
            <button
              type="button"
              className="action-icon-btn text-emerald-700 hover:bg-emerald-50"
              title={isArabic ? 'قبول العرض' : 'Accept Quotation'}
              onClick={() => updateQuotationStatus(q.id, 'Accepted')}
            >
              <CheckCircle2 size={15} />
            </button>
          )}

          {/* Convert to Delivery Note */}
          <button
            type="button"
            className="action-icon-btn text-blue-700 hover:bg-blue-50"
            title={t('qtConvertToDelivery')}
            onClick={() => convertQuotationToDeliveryNote(q.id)}
          >
            <Truck size={15} />
          </button>

          {/* Convert to Tax Invoice */}
          <button
            type="button"
            className="action-icon-btn text-gold-dark hover:bg-amber-50"
            title={t('qtConvertToInvoice')}
            onClick={() => convertQuotationToInvoice(q.id)}
          >
            <ReceiptText size={15} />
          </button>

          <button
            type="button"
            className="action-icon-btn"
            title={t('edit')}
            onClick={() => handleOpenEdit(q)}
          >
            <Edit size={15} />
          </button>

          <button
            type="button"
            className="action-icon-btn text-danger hover:bg-red-50"
            title={t('delete')}
            onClick={() => setDeletingQuotationId(q.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container quotations-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{t('navQuotations')}</h1>
          <p className="page-subtitle">
            {isArabic
              ? 'إنشاء عروض الأسعار، متابعة الموافقات، وتحويل العروض المقبولة لسندات تسليم وفواتير'
              : 'Create commercial price proposals, track pipeline approvals, and convert accepted quotes into deliveries & invoices.'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          {t('qtNewQuotation')}
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title={t('qtTotal')}
          value={totalQuotationsCount}
          icon={FileSpreadsheet}
          colorScheme="forest"
        />
        <MetricCard
          title={t('qtAcceptedValue')}
          value={formatSAR(acceptedValue, isArabic)}
          icon={DollarSign}
          colorScheme="gold"
        />
        <MetricCard
          title={t('qtPending')}
          value={pendingCount}
          subvalue={isArabic ? 'عروض مسودة أو مرسلة' : 'Draft / Sent proposals'}
          icon={Clock}
          colorScheme="amber"
        />
        <MetricCard
          title={isArabic ? 'نسبة التحويل للقبول' : 'Conversion Rate'}
          value={`${conversionRate}%`}
          trend={conversionRate > 50 ? 'up' : 'neutral'}
          trendValue={`${conversionRate}%`}
          trendLabel={isArabic ? 'من إجمالي العروض' : 'of submitted proposals'}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      {/* Filters */}
      <div className="table-filter-bar">
        <div className="filter-search-wrap">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={isArabic ? 'ابحث برقم العرض أو اسم العميل...' : 'Search by quotation # or customer name...'}
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

        <div className="filter-dropdowns">
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{t('all')} {t('status')}</option>
            <option value="Draft">{t('qtStatusDraft')}</option>
            <option value="Sent">{t('qtStatusSent')}</option>
            <option value="Accepted">{t('qtStatusAccepted')}</option>
            <option value="Rejected">{t('qtStatusRejected')}</option>
            <option value="Expired">{t('qtStatusExpired')}</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            >
              {t('clearFilters')}
            </Button>
          )}
        </div>
      </div>

      {/* Quotations Table */}
      <DataTable
        columns={columns}
        data={filteredQuotations}
        keyField="id"
        emptyMessage={isArabic ? 'لا توجد عروض أسعار مطابقة' : 'No quotations found'}
        emptySubtext={isArabic ? 'ابدأ بإنشاء عرض سعر جديد للعميل' : 'Start by generating a new quotation for a client.'}
        emptyAction={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            {t('qtNewQuotation')}
          </Button>
        }
      />

      {/* Create / Edit Quotation Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingQuotation ? `${t('edit')} ${editingQuotation.quotationNumber}` : t('qtNewQuotation')}
        size="xl"
        footer={
          <div className="modal-actions-right">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveQuotation}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveQuotation} className="document-form">
          <div className="form-meta-row">
            <div className="form-group flex-1">
              <label className="form-label">{t('customer')} *</label>
              <select
                className={`select-field ${formErrors.customerName ? 'border-danger' : ''}`}
                value={formData.customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
              >
                <option value="">{t('qtSelectCustomer')}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyNameEn || c.name} {c.vatNumber ? `(VAT: ${c.vatNumber})` : ''}
                  </option>
                ))}
              </select>
              {formErrors.customerName && <span className="error-text">{formErrors.customerName}</span>}
            </div>

            <div className="form-group w-40">
              <label className="form-label">{t('qtIssueDate')}</label>
              <input
                type="date"
                className="input-field"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              />
            </div>

            <div className="form-group w-40">
              <label className="form-label">{t('qtExpiryDate')}</label>
              <input
                type="date"
                className="input-field"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="form-group w-36">
              <label className="form-label">{t('status')}</label>
              <select
                className="select-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="line-items-block mt-4">
            <div className="line-items-header">
              <h4 className="font-semibold text-sm">{t('items')}</h4>
              <Button variant="outline" size="sm" icon={Plus} onClick={handleAddItem}>
                {t('qtAddItem')}
              </Button>
            </div>

            <div className="items-table-wrapper mt-2">
              <table className="items-editor-table">
                <thead>
                  <tr>
                    <th>{t('product')}</th>
                    <th className="w-20 text-center">{t('quantity')}</th>
                    <th className="w-28 text-right">{t('unitPrice')} (SAR)</th>
                    <th className="w-24 text-right">{t('discount')} (SAR)</th>
                    <th className="w-24 text-right">{t('subtotal')}</th>
                    <th className="w-20 text-right">{t('vatRate')}</th>
                    <th className="w-28 text-right">{t('total')}</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => {
                    const lineGross = Number(item.quantity) * Number(item.unitPrice);
                    const lineNet = Math.max(0, lineGross - (Number(item.discount) || 0));
                    const lineVat = lineNet * (Number(item.vatRate ?? 15) / 100);
                    const lineTotal = lineNet + lineVat;

                    return (
                      <tr key={idx}>
                        <td>
                          <select
                            className="select-field text-xs"
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nameEn} ({formatSAR(p.sellingPrice, false)})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className="input-field text-center font-mono text-xs"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input-field text-right font-mono text-xs"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input-field text-right font-mono text-xs"
                            value={item.discount}
                            onChange={(e) => handleItemChange(idx, 'discount', Number(e.target.value) || 0)}
                          />
                        </td>
                        <td className="text-right font-mono text-xs">{lineNet.toFixed(2)}</td>
                        <td className="text-right font-mono text-xs">{item.vatRate}%</td>
                        <td className="text-right font-mono font-semibold text-xs">
                          {lineTotal.toFixed(2)}
                        </td>
                        <td className="text-center">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              className="text-danger hover:opacity-80"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Bottom: Notes & Calculated Totals */}
          <div className="form-summary-bottom mt-4">
            <div className="form-notes-col">
              <label className="form-label">{t('notes')}</label>
              <textarea
                rows="3"
                className="textarea-field text-xs"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Validity terms, warranty conditions, delivery timeframe..."
              />
            </div>

            <div className="form-totals-col">
              <div className="totals-row">
                <span>{t('subtotal')}:</span>
                <span className="font-mono">{formatSAR(calculatedFormTotals.subtotal, isArabic)}</span>
              </div>
              {calculatedFormTotals.discountTotal > 0 && (
                <div className="totals-row text-muted">
                  <span>{t('discount')}:</span>
                  <span className="font-mono">
                    - {formatSAR(calculatedFormTotals.discountTotal, isArabic)}
                  </span>
                </div>
              )}
              <div className="totals-row">
                <span>{t('vatAmount')}:</span>
                <span className="font-mono">{formatSAR(calculatedFormTotals.vatTotal, isArabic)}</span>
              </div>
              <div className="totals-row grand-total-row">
                <span className="font-bold">{t('grandTotal')}:</span>
                <span className="font-mono font-bold text-gold-dark text-base">
                  {formatSAR(calculatedFormTotals.grandTotal, isArabic)}
                </span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Quotation Printable Preview */}
      {viewingQuotation && (
        <QuotationPrintModal
          isOpen={!!viewingQuotation}
          onClose={() => setViewingQuotation(null)}
          quotation={viewingQuotation}
          companySettings={companySettings}
          onConvertToDelivery={(id) => {
            convertQuotationToDeliveryNote(id);
          }}
          onConvertToInvoice={(id) => {
            convertQuotationToInvoice(id);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingQuotationId}
        onClose={() => setDeletingQuotationId(null)}
        onConfirm={() => {
          deleteQuotation(deletingQuotationId);
          setDeletingQuotationId(null);
        }}
        title={t('confirmTitle')}
        message={t('confirmDeleteQuotation')}
        type="danger"
      />
    </div>
  );
};
