import React from 'react';
import { Printer, Download, Building2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { QrCodeDisplay } from '../common/QrCodeDisplay';
import { StatusBadge } from '../common/StatusBadge';
import { formatSAR, formatDate, translatePaymentMethod } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

export const InvoicePrintModal = ({ isOpen, onClose, invoice, companySettings }) => {
  const { isArabic } = useLanguage();

  if (!invoice) return null;

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
          <span>{isArabic ? 'معاينة الفاتورة الضريبية' : 'Tax Invoice Document Preview'}</span>
          <StatusBadge status={invoice.status} />
        </div>
      }
      footer={
        <div className="invoice-modal-footer no-print">
          <Button variant="outline" onClick={onClose}>
            {isArabic ? 'إغلاق' : 'Close'}
          </Button>
          <Button variant="secondary" icon={Download} onClick={handlePrint}>
            {isArabic ? 'حفظ بصيغة PDF' : 'Save as PDF'}
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            {isArabic ? 'طباعة الفاتورة' : 'Print Invoice'}
          </Button>
        </div>
      }
    >
      <div className="invoice-print-sheet printable-document" id="printable-tax-invoice">
        {/* Document Header */}
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
              <p className="company-meta-text">
                {companySettings.addressEn}, {companySettings.cityEn}, {companySettings.countryEn}
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
              <h1 className="invoice-title-main">فاتورة ضريبية</h1>
              <h2 className="invoice-title-sub">TAX INVOICE</h2>
            </div>
            <div className="invoice-quick-info">
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'رقم الفاتورة:' : 'Invoice No:'}</span>
                <span className="info-value font-mono font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>
                <span className="info-value">{formatDate(invoice.invoiceDate, isArabic)}</span>
              </div>
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'تاريخ التوريد:' : 'Supply Date:'}</span>
                <span className="info-value">
                  {formatDate(invoice.supplyDate || invoice.invoiceDate, isArabic)}
                </span>
              </div>
              <div className="info-pair">
                <span className="info-label">{isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span>
                <span className="info-value">{formatDate(invoice.dueDate, isArabic)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Billing Info Grid */}
        <div className="invoice-parties-grid">
          <div className="party-card customer-card">
            <div className="party-card-title">
              <span>{isArabic ? 'بيانات العميل (المشتري)' : 'Bill To / Customer Information'}</span>
            </div>
            <div className="party-card-body">
              <h4 className="party-name">
                {invoice.customerCompanyNameAr || invoice.customerCompanyNameEn || invoice.customerName}
              </h4>
              {invoice.customerCompanyNameEn && invoice.customerCompanyNameAr && (
                <p className="party-subname text-muted">{invoice.customerCompanyNameEn}</p>
              )}
              <p className="party-address">{invoice.customerAddress || 'Riyadh, Saudi Arabia'}</p>
              <div className="party-vat-row">
                <span className="vat-tag">
                  {isArabic ? 'الرقم الضريبي للمشتري:' : 'Buyer VAT No:'}
                </span>
                <span className="font-mono font-bold">
                  {invoice.customerVatNumber || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="party-card meta-card">
            <div className="party-card-title">
              <span>{isArabic ? 'بيانات السداد والشروط' : 'Payment Details & Terms'}</span>
            </div>
            <div className="party-card-body">
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                <span className="font-semibold">{translatePaymentMethod(invoice.paymentMethod, isArabic)}</span>
              </div>
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'اسم البنك:' : 'Bank:'}</span>
                <span>{companySettings.bankNameEn} / {companySettings.bankNameAr}</span>
              </div>
              <div className="meta-info-row">
                <span className="text-muted">IBAN:</span>
                <span className="font-mono font-bold text-xs">{companySettings.iban}</span>
              </div>
              <div className="meta-info-row">
                <span className="text-muted">{isArabic ? 'حالة السداد:' : 'Payment Status:'}</span>
                <span className="font-semibold">
                  {invoice.status === 'Paid'
                    ? (isArabic ? 'تم السداد بالكامل ✓' : 'Fully Paid ✓')
                    : invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Line Table */}
        <div className="invoice-items-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>
                  <div>{isArabic ? 'الوصف والصنف' : 'Item & Description'}</div>
                  <div className="th-sub">{isArabic ? 'Item Details' : 'تفاصيل الصنف'}</div>
                </th>
                <th className="text-center w-16">
                  <div>{isArabic ? 'الكمية' : 'Qty'}</div>
                  <div className="th-sub">الكمية</div>
                </th>
                <th className="text-right w-24">
                  <div>{isArabic ? 'سعر الوحدة' : 'Unit Price'}</div>
                  <div className="th-sub">SAR</div>
                </th>
                <th className="text-right w-20">
                  <div>{isArabic ? 'الخصم' : 'Discount'}</div>
                  <div className="th-sub">SAR</div>
                </th>
                <th className="text-right w-24">
                  <div>{isArabic ? 'المبلغ الخاضع' : 'Taxable Amt'}</div>
                  <div className="th-sub">SAR</div>
                </th>
                <th className="text-right w-20">
                  <div>{isArabic ? 'الضريبة' : 'VAT'}</div>
                  <div className="th-sub">15%</div>
                </th>
                <th className="text-right w-28">
                  <div>{isArabic ? 'المجموع شامل الضريبة' : 'Total (Inc. VAT)'}</div>
                  <div className="th-sub">SAR</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items &&
                invoice.items.map((item, idx) => {
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

        {/* Calculation & QR Bottom Block */}
        <div className="invoice-bottom-grid">
          {/* QR Code and Disclaimer */}
          <div className="invoice-qr-section">
            <div className="qr-wrapper-card">
              <QrCodeDisplay
                sellerName={companySettings.companyNameEn}
                vatNumber={companySettings.vatNumber}
                invoiceTimestamp={invoice.invoiceDate}
                invoiceTotal={invoice.grandTotal}
                vatTotal={invoice.vatTotal}
                size={115}
              />
              <div className="qr-text-meta">
                <p className="qr-disclaimer-title">
                  {isArabic ? 'رمز الاستجابة السريع للفوترة' : 'E-Billing Verification QR'}
                </p>
                <p className="qr-disclaimer-note">
                  {isArabic
                    ? 'يتضمن هذا الرمز اسم المنشأة، الرقم الضريبي، طابع التوقيت، وإجمالي الفاتورة وقيمة الضريبة.'
                    : 'Encodes Seller Name, VAT Number, Invoice Timestamp, Total, and Output VAT.'}
                </p>
              </div>
            </div>
          </div>

          {/* Totals Summary Table */}
          <div className="invoice-totals-box">
            <div className="totals-row">
              <span className="totals-label">
                {isArabic ? 'المجموع غير شامل الضريبة:' : 'Subtotal (Excl. VAT):'}
              </span>
              <span className="totals-val font-mono">{formatSAR(invoice.subtotal, isArabic)}</span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="totals-row text-muted">
                <span className="totals-label">{isArabic ? 'إجمالي الخصم:' : 'Total Discount:'}</span>
                <span className="totals-val font-mono">
                  - {formatSAR(invoice.discountTotal, isArabic)}
                </span>
              </div>
            )}
            <div className="totals-row">
              <span className="totals-label">
                {isArabic ? 'إجمالي ضريبة القيمة المضافة (15%):' : 'Total VAT (15%):'}
              </span>
              <span className="totals-val font-mono">{formatSAR(invoice.vatTotal, isArabic)}</span>
            </div>
            <div className="totals-row grand-total-row">
              <span className="totals-label font-bold">
                {isArabic ? 'المجموع الكلي المستحق:' : 'Total Payable Amount:'}
              </span>
              <span className="totals-val font-bold font-mono text-gold-dark">
                {formatSAR(invoice.grandTotal, isArabic)}
              </span>
            </div>

            {invoice.amountPaid > 0 && (
              <div className="totals-row paid-row">
                <span className="totals-label">{isArabic ? 'المبلغ المسدد:' : 'Amount Paid:'}</span>
                <span className="totals-val font-mono font-semibold text-emerald-700">
                  {formatSAR(invoice.amountPaid, isArabic)}
                </span>
              </div>
            )}

            {invoice.grandTotal - (invoice.amountPaid || 0) > 0 && (
              <div className="totals-row balance-row">
                <span className="totals-label">{isArabic ? 'المبلغ المتبقي:' : 'Balance Due:'}</span>
                <span className="totals-val font-mono font-bold text-red-600">
                  {formatSAR(invoice.grandTotal - (invoice.amountPaid || 0), isArabic)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Notes & Regulatory Note */}
        {invoice.notes && (
          <div className="invoice-notes-block">
            <strong>{isArabic ? 'ملاحظات وشروط:' : 'Terms & Remarks:'}</strong>
            <p>{invoice.notes}</p>
          </div>
        )}

        <div className="invoice-footer-disclaimer">
          <p>
            {isArabic
              ? 'فاتورة ضريبية رسمية صادرة للأغراض التجارية وفق اشتراطات الفوترة القياسية في المملكة العربية السعودية. (المنظومة نموذج عمل أولي MVP ولا تدعي اعتماد المرحلة الثانية منصة فاتورة).'
              : 'Standard Tax Invoice issued for commercial operations under Saudi invoicing regulations. (Frontend MVP demonstration; does not claim Phase 2 ZATCA certification).'}
          </p>
        </div>
      </div>
    </Modal>
  );
};
