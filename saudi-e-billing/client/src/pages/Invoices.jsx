import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ReceiptText,
  Plus,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
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
import { InvoicePrintModal } from '../components/print/InvoicePrintModal';
import { formatSAR, formatDate, calculateTotals } from '../utils/formatters';

export const Invoices = () => {
  const { t, isArabic } = useLanguage();
  const {
    invoices,
    products,
    customers,
    companySettings,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markInvoicePaid,
  } = useApp();

  const [searchParams] = useSearchParams();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(
    searchParams.get('action') === 'new'
  );
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethodSelect, setPaymentMethodSelect] = useState('Bank Transfer');

  const getInitialForm = () => ({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    supplyDate: new Date().toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    customerCompanyNameEn: '',
    customerCompanyNameAr: '',
    customerVatNumber: '',
    customerAddress: '',
    paymentMethod: 'Bank Transfer',
    status: 'Issued',
    notes: 'Official tax invoice issued under Saudi commercial regulations. Payment within 30 days.',
    items: [
      {
        productId: products[0]?.id || '',
        nameEn: products[0]?.nameEn || '',
        nameAr: products[0]?.nameAr || '',
        sku: products[0]?.sku || '',
        quantity: 1,
        unitPrice: products[0]?.sellingPrice || 100,
        discount: 0,
        vatRate: 15,
      },
    ],
  });

  const [formData, setFormData] = useState(getInitialForm);
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const totalInvoicedAmount = invoices.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);
  const totalPaidAmount = invoices
    .filter((i) => i.status === 'Paid' || i.amountPaid > 0)
    .reduce((sum, i) => sum + (Number(i.amountPaid) || (i.status === 'Paid' ? Number(i.grandTotal) : 0)), 0);
  const totalUnpaidAmount = Math.max(0, totalInvoicedAmount - totalPaidAmount);
  const totalVatCollected = invoices.reduce((sum, i) => sum + (Number(i.vatTotal) || 0), 0);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        (i.customerVatNumber && i.customerVatNumber.includes(q));

      const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Form totals live
  const formTotals = useMemo(() => {
    return calculateTotals(formData.items);
  }, [formData.items]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingInvoice(null);
    const defaultCust = customers[0] || {};
    const defaultProd = products[0] || {};

    setFormData({
      ...initialForm,
      invoiceNumber: `${companySettings.invoicePrefix}${Date.now().toString().slice(-5)}`,
      customerId: defaultCust.id || '',
      customerName: defaultCust.companyNameEn || defaultCust.name || '',
      customerCompanyNameEn: defaultCust.companyNameEn || defaultCust.name || '',
      customerCompanyNameAr: defaultCust.companyNameAr || '',
      customerVatNumber: defaultCust.vatNumber || '',
      customerAddress: defaultCust.address || '',
      items: [
        {
          productId: defaultProd.id || '',
          nameEn: defaultProd.nameEn || '',
          nameAr: defaultProd.nameAr || '',
          sku: defaultProd.sku || '',
          quantity: 1,
          unitPrice: defaultProd.sellingPrice || 100,
          discount: 0,
          vatRate: defaultProd.vatRate || 15,
        },
      ],
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingInvoice(inv);
    setFormData({
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      supplyDate: inv.supplyDate || inv.invoiceDate,
      customerId: inv.customerId || '',
      customerName: inv.customerName || '',
      customerCompanyNameEn: inv.customerCompanyNameEn || inv.customerName || '',
      customerCompanyNameAr: inv.customerCompanyNameAr || '',
      customerVatNumber: inv.customerVatNumber || '',
      customerAddress: inv.customerAddress || '',
      paymentMethod: inv.paymentMethod || 'Bank Transfer',
      status: inv.status,
      notes: inv.notes || '',
      items: inv.items ? inv.items.map((i) => ({ ...i })) : [],
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
        customerCompanyNameEn: cust.companyNameEn || cust.name,
        customerCompanyNameAr: cust.companyNameAr || '',
        customerVatNumber: cust.vatNumber,
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

  const handleSaveInvoice = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, formData);
    } else {
      addInvoice(formData);
    }
    setIsAddEditOpen(false);
    setEditingInvoice(null);
  };

  // Columns definition
  const columns = [
    {
      header: t('invNumber'),
      key: 'invoiceNumber',
      render: (i) => (
        <span
          className="font-mono font-bold text-sm text-forest cursor-pointer hover:underline"
          onClick={() => setViewingInvoice(i)}
        >
          {i.invoiceNumber}
        </span>
      ),
    },
    {
      header: t('customer'),
      key: 'customerName',
      render: (i) => (
        <div>
          <div className="font-semibold text-sm">{i.customerCompanyNameEn || i.customerName}</div>
          {i.customerVatNumber && (
            <div className="font-mono text-muted text-xs">VAT: {i.customerVatNumber}</div>
          )}
        </div>
      ),
    },
    {
      header: t('invInvoiceDate'),
      key: 'invoiceDate',
      render: (i) => <span className="text-xs text-muted">{formatDate(i.invoiceDate, isArabic)}</span>,
    },
    {
      header: t('invDueDate'),
      key: 'dueDate',
      render: (i) => (
        <span
          className={`text-xs ${
            i.status === 'Overdue' ? 'text-red-600 font-bold' : 'text-muted'
          }`}
        >
          {formatDate(i.dueDate, isArabic)}
        </span>
      ),
    },
    {
      header: t('grandTotal'),
      key: 'grandTotal',
      align: 'right',
      render: (i) => (
        <div>
          <div className="font-mono font-bold text-sm">{formatSAR(i.grandTotal, isArabic)}</div>
          <div className="font-mono text-xs text-muted">
            VAT: {formatSAR(i.vatTotal, isArabic)}
          </div>
        </div>
      ),
    },
    {
      header: t('status'),
      key: 'status',
      align: 'center',
      render: (i) => <StatusBadge status={i.status} />,
    },
    {
      header: t('actions'),
      key: 'actions',
      align: 'center',
      render: (i) => (
        <div className="table-actions-row">
          <button
            type="button"
            className="action-icon-btn"
            title={t('viewDetails')}
            onClick={() => setViewingInvoice(i)}
          >
            <Eye size={15} />
          </button>

          {/* Quick Mark as Paid */}
          {i.status !== 'Paid' && (
            <button
              type="button"
              className="action-icon-btn text-emerald-700 hover:bg-emerald-50"
              title={t('invMarkAsPaid')}
              onClick={() => {
                setPayingInvoice(i);
                setPaymentMethodSelect(i.paymentMethod || 'Bank Transfer');
              }}
            >
              <CheckCircle2 size={15} />
            </button>
          )}

          <button
            type="button"
            className="action-icon-btn"
            title={t('edit')}
            onClick={() => handleOpenEdit(i)}
          >
            <Edit size={15} />
          </button>

          <button
            type="button"
            className="action-icon-btn text-danger hover:bg-red-50"
            title={t('delete')}
            onClick={() => setDeletingInvoiceId(i.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container invoices-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{t('navTaxInvoices')}</h1>
          <p className="page-subtitle">
            {isArabic
              ? 'إصدار وإدارة الفواتير الضريبية القياسية وفق اشتراطات ضريبة القيمة المضافة 15% في السعودية'
              : 'Issue and oversee commercial Tax Invoices calculated under the standard 15% KSA VAT rate.'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          {t('invNewInvoice')}
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title={t('invTotalInvoiced')}
          value={formatSAR(totalInvoicedAmount, isArabic)}
          icon={ReceiptText}
          colorScheme="forest"
        />
        <MetricCard
          title={t('invTotalPaid')}
          value={formatSAR(totalPaidAmount, isArabic)}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <MetricCard
          title={t('invTotalUnpaid')}
          value={formatSAR(totalUnpaidAmount, isArabic)}
          icon={Clock}
          colorScheme={totalUnpaidAmount > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title={t('dashVatCollected')}
          value={formatSAR(totalVatCollected, isArabic)}
          subvalue={isArabic ? 'ضريبة المخرجات 15%' : '15% Output VAT'}
          icon={DollarSign}
          colorScheme="blue"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="table-filter-bar">
        <div className="filter-search-wrap">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={isArabic ? 'ابحث برقم الفاتورة، اسم العميل، الرقم الضريبي...' : 'Search by invoice #, customer name, VAT #...'}
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
            <option value="Issued">{t('invStatusIssued')}</option>
            <option value="Paid">{t('invStatusPaid')}</option>
            <option value="Partially Paid">{t('invStatusPartiallyPaid')}</option>
            <option value="Overdue">{t('invStatusOverdue')}</option>
            <option value="Draft">{t('invStatusDraft')}</option>
            <option value="Cancelled">{t('invStatusCancelled')}</option>
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

      {/* Invoices Table */}
      <DataTable
        columns={columns}
        data={filteredInvoices}
        keyField="id"
        emptyMessage={isArabic ? 'لا توجد فواتير ضريبية' : 'No tax invoices found'}
        emptySubtext={isArabic ? 'ابدأ بإصدار فاتورة جديدة لعميلك' : 'Issue your first commercial tax invoice to get started.'}
        emptyAction={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            {t('invNewInvoice')}
          </Button>
        }
      />

      {/* Create / Edit Invoice Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingInvoice ? `${t('edit')} ${editingInvoice.invoiceNumber}` : t('invNewInvoice')}
        size="xl"
        footer={
          <div className="modal-actions-right">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveInvoice}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveInvoice} className="document-form">
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

            <div className="form-group w-36">
              <label className="form-label">{t('invInvoiceDate')}</label>
              <input
                type="date"
                className="input-field"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
            </div>

            <div className="form-group w-36">
              <label className="form-label">{t('invSupplyDate')}</label>
              <input
                type="date"
                className="input-field"
                value={formData.supplyDate}
                onChange={(e) => setFormData({ ...formData, supplyDate: e.target.value })}
              />
            </div>

            <div className="form-group w-36">
              <label className="form-label">{t('invDueDate')}</label>
              <input
                type="date"
                className="input-field"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                <option value="Issued">Issued</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-meta-row mt-3">
            <div className="form-group w-48">
              <label className="form-label">{t('invPaymentMethod')}</label>
              <select
                className="select-field"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Bank Transfer">{t('invBankTransfer')}</option>
                <option value="Mada / Debit Card">{t('invMada')}</option>
                <option value="Credit Card">{t('invCreditCard')}</option>
                <option value="Cash">{t('invCash')}</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">{t('custAddress')}</label>
              <input
                type="text"
                className="input-field"
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                placeholder="District, City, Country"
              />
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
                placeholder="IBAN transfer instructions, invoice conditions..."
              />
            </div>

            <div className="form-totals-col">
              <div className="totals-row">
                <span>{t('subtotal')}:</span>
                <span className="font-mono">{formatSAR(formTotals.subtotal, isArabic)}</span>
              </div>
              {formTotals.discountTotal > 0 && (
                <div className="totals-row text-muted">
                  <span>{t('discount')}:</span>
                  <span className="font-mono">
                    - {formatSAR(formTotals.discountTotal, isArabic)}
                  </span>
                </div>
              )}
              <div className="totals-row">
                <span>{t('vatAmount')}:</span>
                <span className="font-mono">{formatSAR(formTotals.vatTotal, isArabic)}</span>
              </div>
              <div className="totals-row grand-total-row">
                <span className="font-bold">{t('grandTotal')}:</span>
                <span className="font-mono font-bold text-gold-dark text-base">
                  {formatSAR(formTotals.grandTotal, isArabic)}
                </span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Invoice Full Printable Preview Modal */}
      {viewingInvoice && (
        <InvoicePrintModal
          isOpen={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          invoice={viewingInvoice}
          companySettings={companySettings}
        />
      )}

      {/* Record Payment Dialog */}
      {payingInvoice && (
        <Modal
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          title={`${t('invMarkAsPaid')}: ${payingInvoice.invoiceNumber}`}
          size="sm"
          footer={
            <div className="modal-actions-right">
              <Button variant="outline" onClick={() => setPayingInvoice(null)}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  markInvoicePaid(payingInvoice.id, paymentMethodSelect);
                  setPayingInvoice(null);
                }}
              >
                {t('confirm')}
              </Button>
            </div>
          }
        >
          <div className="payment-dialog-content">
            <p className="text-sm mb-3">
              {isArabic
                ? `تسجيل سداد الفاتورة بالكامل بقيمة ${formatSAR(payingInvoice.grandTotal, true)}`
                : `Confirm full payment receipt of ${formatSAR(payingInvoice.grandTotal, false)}`}
            </p>

            <div className="form-group">
              <label className="form-label">{t('invPaymentMethod')}</label>
              <select
                className="select-field"
                value={paymentMethodSelect}
                onChange={(e) => setPaymentMethodSelect(e.target.value)}
              >
                <option value="Bank Transfer">{t('invBankTransfer')}</option>
                <option value="Mada / Debit Card">{t('invMada')}</option>
                <option value="Credit Card">{t('invCreditCard')}</option>
                <option value="Cash">{t('invCash')}</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingInvoiceId}
        onClose={() => setDeletingInvoiceId(null)}
        onConfirm={() => {
          deleteInvoice(deletingInvoiceId);
          setDeletingInvoiceId(null);
        }}
        title={t('confirmTitle')}
        message={t('confirmDeleteInvoice')}
        type="danger"
      />
    </div>
  );
};
