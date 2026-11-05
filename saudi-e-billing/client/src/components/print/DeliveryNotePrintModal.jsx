import React from 'react';
import { Printer, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

export const DeliveryNotePrintModal = ({
  isOpen,
  onClose,
  deliveryNote,
  companySettings,
  onMarkDelivered,
}) => {
  const { isArabic } = useLanguage();

  if (!deliveryNote) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="invoice-modal-container"
      title={
        <div className="flex items-center gap-2">
          <span>{isArabic ? 'معاينة سند تسليم بضاعة' : 'Goods Delivery Voucher'}</span>
          <StatusBadge status={deliveryNote.status} />
        </div>
      }
      footer={
        <div className="invoice-modal-footer no-print">
          <Button variant="outline" onClick={onClose}>
            {isArabic ? 'إغلاق' : 'Close'}
          </Button>

          {deliveryNote.status !== 'Delivered' && onMarkDelivered && (
            <Button
              variant="secondary"
              icon={CheckCircle2}
              onClick={() => {
                onMarkDelivered(deliveryNote.id);
                onClose();
              }}
            >
              {isArabic ? 'تأكيد التسليم وخصم المخزون' : 'Mark as Delivered (Deduct Stock)'}
            </Button>
          )}

          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            {isArabic ? 'طباعة سند التسليم' : 'Print Delivery Note'}
          </Button>
        </div>
      }
    >
      <div className="invoice-print-sheet printable-document" id="printable-delivery-note">
        {/* Banner Warning that this is delivery note only */}
        <div className="delivery-note-banner">
          <ShieldCheck size={18} />
          <span>
            {isArabic
              ? 'مستند تسليم ومناولة بضائع فقط — لا يعتبر فاتورة ضريبية أو إيصال استلام مالي.'
              : 'Goods Dispatch & Delivery Voucher only — Does not constitute a Tax Invoice or Payment Receipt.'}
          </span>
        </div>

        {/* Header */}
        <div className="invoice-sheet-header">
          <div className="seller-branding">
            <div className="company-logo-badge">
              <Building2 size={28} className="text-forest" />
            </div>
            <div>
              <h2 className="company-title-ar">{companySettings.companyNameAr}</h2>
              <h3 className="company-title-en">{companySettings.companyNameEn}</h3>
              <p className="company-meta-text">
                {companySettings.addressAr} • {companySettings.cityAr}
              </p>
              <div className="company-tax-ids">
                <span>
                  <strong>{isArabic ? 'السجل التجاري:' : 'C.R. No:'}</strong>{' '}
                  <span className="font-mono">{companySettings.crNumber}</span>
                </span>
                <span>
                  <strong>{isArabic ? 'الرقم الضريبي:' : 'VAT No:'}</strong>{' '}
                  <span className="font-mono">{companySettings.vatNumber}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="invoice-header-right">
            <div className="invoice-title-box">
              <h1 className="invoice-title-main">سند تسليم بضاعة</h1>
              <h2 className="invoice-title-sub">DELIVERY NOTE</h2>
            </div>
            <div className="invoice-quick-info">
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'رقم السند:' : 'Delivery No:'}</span>
                <span className="info-value font-mono font-bold">
                  {deliveryNote.deliveryNumber}
                </span>
              </div>
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'تاريخ التسليم:' : 'Delivery Date:'}</span>
                <span className="info-value">{formatDate(deliveryNote.deliveryDate, isArabic)}</span>
              </div>
              {deliveryNote.quotationNumber && (
                <div className="info-pair">
                  <span className="info-label">{isArabic ? 'عرض السعر المرتبط:' : 'Related QT:'}</span>
                  <span className="info-value font-mono">{deliveryNote.quotationNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Destination & Logistics Details */}
        <div className="invoice-parties-grid">
          <div className="party-card customer-card">
            <div className="party-card-title">
              <span>{isArabic ? 'وجهة التسليم (العميل):' : 'Consignee / Destination:'}</span>
            </div>
            <div className="party-card-body">
              <h4 className="party-name">{deliveryNote.customerName}</h4>
              <p className="party-address">
                <strong>{isArabic ? 'عنوان التسليم:' : 'Site Address:'}</strong>{' '}
                {deliveryNote.deliveryAddress || 'Client designated premises / warehouse'}
              </p>
            </div>
          </div>

          <div className="party-card meta-card">
            <div className="party-card-title">
              <span>{isArabic ? 'بيانات الشحن والنقل' : 'Logistics & Carrier Details'}</span>
            </div>
            <div className="party-card-body">
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'الناقل / المركبة:' : 'Carrier:'}</span>
                <span>{deliveryNote.carrier || 'Internal Fleet'}</span>
              </div>
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'حالة الشحنة:' : 'Status:'}</span>
                <span className="font-semibold">{deliveryNote.status}</span>
              </div>
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'خصم المخزون:' : 'Stock Status:'}</span>
                <span>
                  {deliveryNote.stockDeducted
                    ? (isArabic ? 'تم خصم الكميات من المخزون ✓' : 'Stock Deducted ✓')
                    : (isArabic ? 'معلق حتى تأكيد التسليم' : 'Pending Delivery')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivered Items Table */}
        <div className="invoice-items-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>{isArabic ? 'الصنف والمواصفات' : 'Item Description'}</th>
                <th className="w-32">{isArabic ? 'رمز الصنف' : 'SKU'}</th>
                <th className="text-center w-24">{isArabic ? 'الوحدة' : 'Unit'}</th>
                <th className="text-center w-28 font-bold">{isArabic ? 'الكمية المسلمة' : 'Qty Delivered'}</th>
                <th className="text-center w-28">{isArabic ? 'حالة الفحص' : 'Condition'}</th>
              </tr>
            </thead>
            <tbody>
              {deliveryNote.items &&
                deliveryNote.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="text-muted text-center">{idx + 1}</td>
                    <td>
                      <div className="item-name font-semibold">
                        {isArabic ? (item.nameAr || item.nameEn) : item.nameEn}
                      </div>
                    </td>
                    <td className="font-mono text-xs">{item.sku || '-'}</td>
                    <td className="text-center text-muted">
                      {isArabic ? (item.unitAr || item.unit || 'حبة') : (item.unit || 'Unit')}
                    </td>
                    <td className="text-center font-mono font-bold text-base">
                      {item.quantity}
                    </td>
                    <td className="text-center text-xs text-emerald-700 font-semibold">
                      {isArabic ? 'سليم ومفحوص' : 'Good Condition'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Notes and Sign-off */}
        <div className="delivery-footer-grid">
          <div className="delivery-notes">
            <strong>{isArabic ? 'ملاحظات المستودع والسائق:' : 'Driver & Warehouse Remarks:'}</strong>
            <p className="text-xs text-muted mt-1">
              {deliveryNote.notes ||
                'Goods inspected prior to loading. Received in full without visible exterior damage.'}
            </p>
          </div>

          <div className="delivery-signatures-container">
            <div className="signature-column">
              <span className="sign-title">
                {isArabic ? 'المسلّم (السائق / المستودع):' : 'Dispatched By:'}
              </span>
              <div className="sign-line"></div>
              <span className="sign-sub">Al-Buraq Warehouse Logistics</span>
            </div>

            <div className="signature-column">
              <span className="sign-title">
                {isArabic ? 'المستلم (العميل):' : 'Received By (Consignee):'}
              </span>
              <div className="sign-line"></div>
              <span className="sign-sub">
                {deliveryNote.receivedBy || (isArabic ? 'اسم المستلم وتوقيعه وختمه' : 'Name, Signature & Date')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
