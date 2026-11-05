import React from 'react';
import { Printer, Truck, ReceiptText, Building2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { formatSAR, formatDate } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

export const QuotationPrintModal = ({
  isOpen,
  onClose,
  quotation,
  companySettings,
  onConvertToDelivery,
  onConvertToInvoice,
}) => {
  const { isArabic } = useLanguage();

  if (!quotation) return null;

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
          <span>{isArabic ? 'معاينة عرض السعر' : 'Commercial Quotation Proposal'}</span>
          <StatusBadge status={quotation.status} />
        </div>
      }
      footer={
        <div className="invoice-modal-footer no-print">
          <Button variant="outline" onClick={onClose}>
            {isArabic ? 'إغلاق' : 'Close'}
          </Button>

          {onConvertToDelivery && quotation.status !== 'Rejected' && quotation.status !== 'Expired' && (
            <Button
              variant="outline"
              icon={Truck}
              onClick={() => {
                onConvertToDelivery(quotation.id);
                onClose();
              }}
            >
              {isArabic ? 'تحويل إلى سند تسليم' : 'Create Delivery Note'}
            </Button>
          )}

          {onConvertToInvoice && quotation.status !== 'Rejected' && quotation.status !== 'Expired' && (
            <Button
              variant="secondary"
              icon={ReceiptText}
              onClick={() => {
                onConvertToInvoice(quotation.id);
                onClose();
              }}
            >
              {isArabic ? 'تحويل إلى فاتورة ضريبية' : 'Generate Tax Invoice'}
            </Button>
          )}

          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            {isArabic ? 'طباعة العرض' : 'Print Quotation'}
          </Button>
        </div>
      }
    >
      <div className="invoice-print-sheet printable-document" id="printable-quotation">
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
                  <strong>{isArabic ? 'الرقم الضريبي:' : 'VAT No:'}</strong>{' '}
                  <span className="font-mono">{companySettings.vatNumber}</span>
                </span>
                <span>
                  <strong>{isArabic ? 'السجل التجاري:' : 'C.R. No:'}</strong>{' '}
                  <span className="font-mono">{companySettings.crNumber}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="invoice-header-right">
            <div className="invoice-title-box">
              <h1 className="invoice-title-main">عرض أسعار</h1>
              <h2 className="invoice-title-sub">PRICE QUOTATION</h2>
            </div>
            <div className="invoice-quick-info">
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'رقم العرض:' : 'Quotation No:'}</span>
                <span className="info-value font-mono font-bold">{quotation.quotationNumber}</span>
              </div>
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'تاريخ العرض:' : 'Issue Date:'}</span>
                <span className="info-value">{formatDate(quotation.issueDate, isArabic)}</span>
              </div>
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'صالح حتى:' : 'Valid Until:'}</span>
                <span className="info-value text-gold-dark font-semibold">
                  {formatDate(quotation.expiryDate, isArabic)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Conditions */}
        <div className="invoice-parties-grid">
          <div className="party-card customer-card">
            <div className="party-card-title">
              <span>{isArabic ? 'مقدم إلى (العميل):' : 'Quotation Prepared For:'}</span>
            </div>
            <div className="party-card-body">
              <h4 className="party-name">{quotation.customerName}</h4>
              {quotation.customerEmail && (
                <p className="text-muted text-sm">{quotation.customerEmail}</p>
              )}
              {quotation.customerVatNumber && (
                <div className="party-vat-row">
                  <span className="vat-tag">{isArabic ? 'الرقم الضريبي:' : 'Client VAT:'}</span>
                  <span className="font-mono">{quotation.customerVatNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div className="party-card meta-card">
            <div className="party-card-title">
              <span>{isArabic ? 'شروط العرض والضمان' : 'Commercial Terms & Validity'}</span>
            </div>
            <div className="party-card-body">
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'صلاحية العرض:' : 'Validity:'}</span>
                <span>30 Calendar Days from date of issue</span>
              </div>
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'شروط الدفع:' : 'Payment:'}</span>
                <span>30 Days upon delivery and invoice acceptance</span>
              </div>
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'حالة المقترح:' : 'Proposal Status:'}</span>
                <span className="font-semibold">{quotation.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="invoice-items-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>{isArabic ? 'الصنف والبيان' : 'Item Description'}</th>
                <th className="text-center w-16">{isArabic ? 'الكمية' : 'Qty'}</th>
                <th className="text-right w-24">{isArabic ? 'سعر الوحدة' : 'Unit Price'}</th>
                <th className="text-right w-20">{isArabic ? 'الخصم' : 'Discount'}</th>
                <th className="text-right w-24">{isArabic ? 'المبلغ الخاضع' : 'Taxable Amt'}</th>
                <th className="text-right w-20">{isArabic ? 'الضريبة (15%)' : 'VAT (15%)'}</th>
                <th className="text-right w-28">{isArabic ? 'الإجمالي (ر.س)' : 'Total (SAR)'}</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items &&
                quotation.items.map((item, idx) => {
                  const qty = Number(item.quantity) || 1;
                  const price = Number(item.unitPrice) || 0;
                  const discount = Number(item.discount) || 0;
                  const lineNet = Math.max(0, qty * price - discount);
                  const vat = lineNet * (Number(item.vatRate ?? 15) / 100);
                  const total = lineNet + vat;

                  return (
                    <tr key={idx}>
                      <td className="text-muted text-center">{idx + 1}</td>
                      <td>
                        <div className="item-name font-semibold">
                          {isArabic ? (item.nameAr || item.nameEn) : item.nameEn}
                        </div>
                        {item.sku && (
                          <div className="item-sku font-mono text-muted text-xs">
                            SKU: {item.sku}
                          </div>
                        )}
                      </td>
                      <td className="text-center font-mono">{qty}</td>
                      <td className="text-right font-mono">{price.toFixed(2)}</td>
                      <td className="text-right font-mono text-muted">
                        {discount > 0 ? discount.toFixed(2) : '-'}
                      </td>
                      <td className="text-right font-mono">{lineNet.toFixed(2)}</td>
                      <td className="text-right font-mono">{vat.toFixed(2)}</td>
                      <td className="text-right font-mono font-semibold">{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Totals & Acceptance Block */}
        <div className="invoice-bottom-grid">
          <div className="quotation-terms-block">
            <h5 className="font-semibold mb-1">
              {isArabic ? 'الملاحظات والشروط العامة:' : 'General Terms:'}
            </h5>
            <p className="text-xs text-muted leading-relaxed">
              {quotation.notes ||
                'Prices are in Saudi Riyals (SAR) and include standard manufacturer warranties. Delivery within 3 business days of formal purchase order confirmation.'}
            </p>

            <div className="acceptance-signature-box mt-6">
              <div className="signature-line">
                <span className="signature-label">
                  {isArabic ? 'توقيع وختم العميل المعتمد:' : 'Authorized Customer Signature & Stamp:'}
                </span>
                <div className="signature-space"></div>
              </div>
            </div>
          </div>

          <div className="invoice-totals-box">
            <div className="totals-row">
              <span className="totals-label">{isArabic ? 'المجموع قبل الضريبة:' : 'Subtotal:'}</span>
              <span className="totals-val font-mono">{formatSAR(quotation.subtotal, isArabic)}</span>
            </div>
            {quotation.discountTotal > 0 && (
              <div className="totals-row text-muted">
                <span className="totals-label">{isArabic ? 'مجموع الخصومات:' : 'Discounts:'}</span>
                <span className="totals-val font-mono">
                  - {formatSAR(quotation.discountTotal, isArabic)}
                </span>
              </div>
            )}
            <div className="totals-row">
              <span className="totals-label">{isArabic ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
              <span className="totals-val font-mono">{formatSAR(quotation.vatTotal, isArabic)}</span>
            </div>
            <div className="totals-row grand-total-row">
              <span className="totals-label font-bold">
                {isArabic ? 'إجمالي العرض المقترح:' : 'Total Proposal Amount:'}
              </span>
              <span className="totals-val font-bold font-mono text-gold-dark">
                {formatSAR(quotation.grandTotal, isArabic)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
