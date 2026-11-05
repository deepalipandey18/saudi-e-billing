import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  X,
  Eye,
  CheckCircle2,
  Trash2,
  ReceiptText,
  Package,
  ShieldCheck,
  Edit,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { DeliveryNotePrintModal } from '../components/print/DeliveryNotePrintModal';
import { formatDate } from '../utils/formatters';

export const DeliveryNotes = () => {
  const { t, isArabic } = useLanguage();
  const {
    deliveryNotes,
    products,
    customers,
    companySettings,
    addDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    markAsDelivered,
    convertDeliveryNoteToInvoice,
  } = useApp();

  const [searchParams] = useSearchParams();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(
    searchParams.get('action') === 'new'
  );
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [viewingDelivery, setViewingDelivery] = useState(null);
  const [deliveringId, setDeliveringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const getInitialForm = () => ({
    deliveryNumber: '',
    customerId: '',
    customerName: '',
    quotationId: '',
    quotationNumber: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: '',
    status: 'Ready for Delivery',
    notes: 'Goods inspected and packaged for dispatch in compliance with transport standards.',
    receivedBy: '',
    carrier: 'Direct Fleet - Vehicle #4812',
    items: [
      {
        productId: products[0]?.id || '',
        nameEn: products[0]?.nameEn || '',
        nameAr: products[0]?.nameAr || '',
        sku: products[0]?.sku || '',
        quantity: 1,
        unit: products[0]?.unit || 'Unit',
        unitAr: products[0]?.unitAr || 'حبة',
      },
    ],
  });

  const [formData, setFormData] = useState(getInitialForm);
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const totalNotesCount = deliveryNotes.length;
  const deliveredCount = deliveryNotes.filter((d) => d.status === 'Delivered').length;
  const readyCount = deliveryNotes.filter((d) => d.status === 'Ready for Delivery').length;

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return deliveryNotes.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.deliveryNumber.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        (d.quotationNumber && d.quotationNumber.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [deliveryNotes, searchQuery, statusFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingDelivery(null);
    const defaultCust = customers[0] || {};
    const defaultProd = products[0] || {};

    setFormData({
      ...initialForm,
      deliveryNumber: `${companySettings.deliveryPrefix}${Date.now().toString().slice(-5)}`,
      customerId: defaultCust.id || '',
      customerName: defaultCust.companyNameEn || defaultCust.name || '',
      deliveryAddress: defaultCust.address || 'Riyadh, Saudi Arabia',
      items: [
        {
          productId: defaultProd.id || '',
          nameEn: defaultProd.nameEn || '',
          nameAr: defaultProd.nameAr || '',
          sku: defaultProd.sku || '',
          quantity: 1,
          unit: defaultProd.unit || 'Unit',
          unitAr: defaultProd.unitAr || 'حبة',
        },
      ],
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (dn) => {
    setEditingDelivery(dn);
    setFormData({
      deliveryNumber: dn.deliveryNumber,
      customerId: dn.customerId || '',
      customerName: dn.customerName || '',
      quotationId: dn.quotationId || '',
      quotationNumber: dn.quotationNumber || '',
      deliveryDate: dn.deliveryDate,
      deliveryAddress: dn.deliveryAddress || '',
      status: dn.status,
      notes: dn.notes || '',
      receivedBy: dn.receivedBy || '',
      carrier: dn.carrier || '',
      items: dn.items ? dn.items.map((i) => ({ ...i })) : [],
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
        deliveryAddress: cust.address || '',
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
        unit: prod.unit,
        unitAr: prod.unitAr,
      };
      return { ...prev, items: newItems };
    });
  };

  const handleItemQtyChange = (index, qty) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        quantity: Math.max(1, Number(qty) || 1),
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
          unit: defaultProd.unit || 'Unit',
          unitAr: defaultProd.unitAr || 'حبة',
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
    if (!formData.deliveryAddress) errs.deliveryAddress = isArabic ? 'يرجى تحديد عنوان التسليم' : 'Delivery address is required';
    if (!formData.items || formData.items.length === 0) {
      errs.items = isArabic ? 'يجب إضافة صنف واحد على الأقل' : 'At least one item is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveDelivery = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingDelivery) {
      updateDeliveryNote(editingDelivery.id, formData);
    } else {
      addDeliveryNote(formData);
    }
    setIsAddEditOpen(false);
    setEditingDelivery(null);
  };

  // Columns definition
  const columns = [
    {
      header: t('dnNumber'),
      key: 'deliveryNumber',
      render: (d) => (
        <span
          className="font-mono font-bold text-sm text-forest cursor-pointer hover:underline"
          onClick={() => setViewingDelivery(d)}
        >
          {d.deliveryNumber}
        </span>
      ),
    },
    {
      header: t('customer'),
      key: 'customerName',
      render: (d) => (
        <div>
          <div className="font-semibold text-sm">{d.customerName}</div>
          <div className="text-muted text-xs truncate max-w-[200px]">{d.deliveryAddress}</div>
        </div>
      ),
    },
    {
      header: t('dnDeliveryDate'),
      key: 'deliveryDate',
      render: (d) => <span className="text-xs text-muted">{formatDate(d.deliveryDate, isArabic)}</span>,
    },
    {
      header: t('items'),
      key: 'items',
      render: (d) => (
        <span className="text-xs font-mono font-semibold">
          {d.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) || 0}{' '}
          {isArabic ? 'وحدات' : 'units'} ({d.items?.length || 0} {isArabic ? 'أصناف' : 'SKUs'})
        </span>
      ),
    },
    {
      header: t('status'),
      key: 'status',
      align: 'center',
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      header: t('actions'),
      key: 'actions',
      align: 'center',
      render: (d) => (
        <div className="table-actions-row">
          <button
            type="button"
            className="action-icon-btn"
            title={t('viewDetails')}
            onClick={() => setViewingDelivery(d)}
          >
            <Eye size={15} />
          </button>

          {/* Mark as delivered if not yet */}
          {d.status !== 'Delivered' && (
            <button
              type="button"
              className="action-icon-btn text-emerald-700 hover:bg-emerald-50"
              title={t('dnMarkDelivered')}
              onClick={() => setDeliveringId(d.id)}
            >
              <CheckCircle2 size={15} />
            </button>
          )}

          {/* Convert to Invoice */}
          <button
            type="button"
            className="action-icon-btn text-gold-dark hover:bg-amber-50"
            title={t('createInvoice')}
            onClick={() => convertDeliveryNoteToInvoice(d.id)}
          >
            <ReceiptText size={15} />
          </button>

          <button
            type="button"
            className="action-icon-btn"
            title={t('edit')}
            onClick={() => handleOpenEdit(d)}
          >
            <Edit size={15} />
          </button>

          <button
            type="button"
            className="action-icon-btn text-danger hover:bg-red-50"
            title={t('delete')}
            onClick={() => setDeletingId(d.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container delivery-notes-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{t('navDeliveryNotes')}</h1>
          <p className="page-subtitle">
            {isArabic
              ? 'تتبع إرساليات البضائع، سندات التسليم الموقعة، وخصم المخزون التلقائي عند التسليم'
              : 'Track goods consignments, signed delivery vouchers, and automatic stock deduction upon handover.'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          {t('dnNewDeliveryNote')}
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title={t('dnTotal')}
          value={totalNotesCount}
          icon={Truck}
          colorScheme="forest"
        />
        <MetricCard
          title={t('dnDelivered')}
          value={deliveredCount}
          subvalue={isArabic ? 'تم تأكيد الاستلام وخصم المخزون' : 'Verified & stock deducted'}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <MetricCard
          title={t('dnReady')}
          value={readyCount}
          subvalue={isArabic ? 'جاهزة للنقل والتحميل' : 'Scheduled for dispatch'}
          icon={Package}
          colorScheme="gold"
        />
        <MetricCard
          title={isArabic ? 'نسبة إتمام التسليم' : 'Fulfillment Rate'}
          value={totalNotesCount > 0 ? `${Math.round((deliveredCount / totalNotesCount) * 100)}%` : '100%'}
          icon={ShieldCheck}
          colorScheme="blue"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="table-filter-bar">
        <div className="filter-search-wrap">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={isArabic ? 'ابحث برقم السند، اسم العميل أو العنوان...' : 'Search by delivery # or customer name...'}
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
            <option value="Draft">{t('dnStatusDraft')}</option>
            <option value="Ready for Delivery">{t('dnStatusReady')}</option>
            <option value="Delivered">{t('dnStatusDelivered')}</option>
            <option value="Cancelled">{t('dnStatusCancelled')}</option>
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

      {/* Delivery Notes Table */}
      <DataTable
        columns={columns}
        data={filteredNotes}
        keyField="id"
        emptyMessage={isArabic ? 'لا توجد سندات تسليم' : 'No delivery notes found'}
        emptySubtext={isArabic ? 'قم بإنشاء سند تسليم جديد للمستودع' : 'Create a new delivery note to track dispatched inventory.'}
        emptyAction={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            {t('dnNewDeliveryNote')}
          </Button>
        }
      />

      {/* Add / Edit Delivery Note Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingDelivery ? `${t('edit')} ${editingDelivery.deliveryNumber}` : t('dnNewDeliveryNote')}
        size="lg"
        footer={
          <div className="modal-actions-right">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveDelivery}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveDelivery} className="document-form">
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
                    {c.companyNameEn || c.name}
                  </option>
                ))}
              </select>
              {formErrors.customerName && <span className="error-text">{formErrors.customerName}</span>}
            </div>

            <div className="form-group w-44">
              <label className="form-label">{t('dnDeliveryDate')}</label>
              <input
                type="date"
                className="input-field"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              />
            </div>

            <div className="form-group w-40">
              <label className="form-label">{t('status')}</label>
              <select
                className="select-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-meta-row mt-3">
            <div className="form-group flex-1">
              <label className="form-label">{t('dnDeliveryAddress')} *</label>
              <input
                type="text"
                className="input-field"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                placeholder="District, Street Name, Warehouse Bay..."
              />
            </div>

            <div className="form-group w-52">
              <label className="form-label">{t('dnCarrier')}</label>
              <input
                type="text"
                className="input-field"
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                placeholder="Driver Name / Vehicle No."
              />
            </div>
          </div>

          {/* Items selection */}
          <div className="line-items-block mt-4">
            <div className="line-items-header">
              <h4 className="font-semibold text-sm">{isArabic ? 'الأصناف المراد تسليمها' : 'Consigned Goods from Stock'}</h4>
              <Button variant="outline" size="sm" icon={Plus} onClick={handleAddItem}>
                {t('qtAddItem')}
              </Button>
            </div>

            <div className="items-table-wrapper mt-2">
              <table className="items-editor-table">
                <thead>
                  <tr>
                    <th>{t('product')}</th>
                    <th className="w-24 text-center">{t('quantity')}</th>
                    <th className="w-24 text-center">{t('invUnit')}</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
                    const availableStock = prod ? prod.stockQuantity : 0;

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
                                {p.nameEn} (Stock: {p.stockQuantity} {p.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max={availableStock > 0 ? availableStock : 999}
                            className="input-field text-center font-mono text-xs"
                            value={item.quantity}
                            onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                          />
                        </td>
                        <td className="text-center text-xs text-muted">
                          {isArabic ? (item.unitAr || 'حبة') : (item.unit || 'Unit')}
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

          <div className="form-group mt-3">
            <label className="form-label">{t('notes')}</label>
            <textarea
              rows="2"
              className="textarea-field text-xs"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Delivery Note Printable Preview */}
      {viewingDelivery && (
        <DeliveryNotePrintModal
          isOpen={!!viewingDelivery}
          onClose={() => setViewingDelivery(null)}
          deliveryNote={viewingDelivery}
          companySettings={companySettings}
          onMarkDelivered={(id) => markAsDelivered(id)}
        />
      )}

      {/* Confirm Delivery Dialog */}
      <ConfirmDialog
        isOpen={!!deliveringId}
        onClose={() => setDeliveringId(null)}
        onConfirm={() => {
          markAsDelivered(deliveringId);
          setDeliveringId(null);
        }}
        title={isArabic ? 'تأكيد تسليم البضاعة' : 'Confirm Consignment Handover'}
        message={
          isArabic
            ? 'هل أنت متأكد من تسليم الشحنة؟ سيتم خصم الكميات من المخزون فوراً لمنع البيع المزدوج.'
            : 'Are you sure you want to mark this delivery as completed? Stock quantities will be deducted immediately.'
        }
        confirmText={isArabic ? 'تأكيد التسليم والخصم' : 'Confirm Delivery & Deduct'}
        type="warning"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          deleteDeliveryNote(deletingId);
          setDeletingId(null);
        }}
        title={t('confirmTitle')}
        message={isArabic ? 'هل أنت متأكد من حذف هذا السند؟' : 'Are you sure you want to delete this delivery note?'}
        type="danger"
      />
    </div>
  );
};
