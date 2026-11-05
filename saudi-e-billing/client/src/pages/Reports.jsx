import React from 'react';
import {
  Download,
  Printer,
  DollarSign,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MetricCard, Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { formatSAR } from '../utils/formatters';

export const Reports = () => {
  const { t, isArabic } = useLanguage();
  const { invoices, companySettings } = useApp();

  // Compute total sales, taxable amount, VAT 15%
  const grossSales = invoices.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
  const totalVat = invoices.reduce((sum, i) => sum + (Number(i.vatTotal) || 0), 0);
  const totalGrand = invoices.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);
  const totalPaid = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);

  // Top products calculation from invoices
  const productSalesMap = {};
  invoices.forEach((inv) => {
    inv.items?.forEach((item) => {
      const name = item.nameEn;
      const qty = Number(item.quantity) || 0;
      const rev = Number(item.total) || 0;
      if (!productSalesMap[name]) {
        productSalesMap[name] = { name, nameAr: item.nameAr, sku: item.sku, qty: 0, revenue: 0 };
      }
      productSalesMap[name].qty += qty;
      productSalesMap[name].revenue += rev;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top customers by revenue
  const customerSalesMap = {};
  invoices.forEach((inv) => {
    const cust = inv.customerName;
    const rev = Number(inv.grandTotal) || 0;
    if (!customerSalesMap[cust]) {
      customerSalesMap[cust] = { name: cust, vatNumber: inv.customerVatNumber, count: 0, revenue: 0 };
    }
    customerSalesMap[cust].count += 1;
    customerSalesMap[cust].revenue += rev;
  });

  const topCustomers = Object.values(customerSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const handleExportCsv = () => {
    // Generate CSV content
    const headers = ['Invoice Number', 'Customer', 'Date', 'Subtotal (SAR)', 'VAT 15% (SAR)', 'Grand Total (SAR)', 'Status'];
    const rows = invoices.map((i) => [
      i.invoiceNumber,
      `"${i.customerName}"`,
      i.invoiceDate,
      i.subtotal,
      i.vatTotal,
      i.grandTotal,
      i.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `saudi_ebilling_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container reports-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{t('repFinancialSummary')}</h1>
          <p className="page-subtitle">
            {isArabic
              ? `إقرار ضريبة القيمة المضافة 15%، الإيرادات المفوترة، وتحليل أداء المبيعات لمنشأة ${companySettings.companyNameAr}`
              : `VAT Statement (15%), gross supplies reconciliation, and commercial performance analysis.`}
          </p>
        </div>
        <div className="header-action-group">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExportCsv}>
            {t('repExportCsv')}
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            {t('print')}
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title={t('repNetRevenue')}
          value={formatSAR(grossSales, isArabic)}
          subvalue={isArabic ? 'قبل إضافة ضريبة 15%' : 'Excluding 15% VAT'}
          icon={DollarSign}
          colorScheme="gold"
        />
        <MetricCard
          title={t('repVatPayable')}
          value={formatSAR(totalVat, isArabic)}
          subvalue={isArabic ? 'ضريبة القيمة المضافة المستحقة' : 'Standard 15% Output VAT'}
          icon={ShieldCheck}
          colorScheme="blue"
        />
        <MetricCard
          title={t('repGrossSales')}
          value={formatSAR(totalGrand, isArabic)}
          subvalue={isArabic ? 'المبيعات الإجمالية شاملة الضريبة' : 'Gross taxable supplies'}
          icon={TrendingUp}
          colorScheme="forest"
        />
        <MetricCard
          title={t('invTotalPaid')}
          value={formatSAR(totalPaid, isArabic)}
          subvalue={`${invoices.filter((i) => i.status === 'Paid').length} ${isArabic ? 'فواتير مسددة' : 'settled invoices'}`}
          icon={ReceiptText}
          colorScheme="emerald"
        />
      </div>

      {/* Tax Statement Breakdown Box */}
      <Card
        className="vat-statement-card mt-6"
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-gold" />
            <span>{t('repVatReport')}</span>
          </div>
        }
      >
        <div className="table-responsive">
          <table className="mini-table">
            <thead>
              <tr>
                <th>{isArabic ? 'بند الإقرار الضريبي' : 'Tax Declaration Category'}</th>
                <th className="text-right">{isArabic ? 'المبلغ الخاضع للضريبة (ر.س)' : 'Taxable Base (SAR)'}</th>
                <th className="text-center">{isArabic ? 'نسبة الضريبة' : 'VAT Rate'}</th>
                <th className="text-right">{isArabic ? 'مبلغ الضريبة المستحق (ر.س)' : 'Output VAT (SAR)'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">
                  1. {isArabic ? 'المبيعات الخاضعة للنسبة الأساسية (15%)' : 'Standard Rated Supplies (15%)'}
                </td>
                <td className="text-right font-mono font-semibold">{formatSAR(grossSales, isArabic)}</td>
                <td className="text-center font-mono">15%</td>
                <td className="text-right font-mono font-bold text-forest">
                  {formatSAR(totalVat, isArabic)}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  2. {isArabic ? 'المبيعات الخاضعة لنسبة الصفر (0%)' : 'Zero-Rated Supplies (0%)'}
                </td>
                <td className="text-right font-mono text-muted">0.00 SAR</td>
                <td className="text-center font-mono text-muted">0%</td>
                <td className="text-right font-mono text-muted">0.00 SAR</td>
              </tr>
              <tr>
                <td className="text-muted">
                  3. {isArabic ? 'التوريدات المعفاة من الضريبة' : 'Exempt Supplies'}
                </td>
                <td className="text-right font-mono text-muted">0.00 SAR</td>
                <td className="text-center font-mono text-muted">-</td>
                <td className="text-right font-mono text-muted">0.00 SAR</td>
              </tr>
              <tr className="bg-neutral-50 font-bold border-t-2">
                <td>{isArabic ? 'إجمالي المبيعات وضريبة المخرجات' : 'Total Supplies & Output VAT'}</td>
                <td className="text-right font-mono text-gold-dark">{formatSAR(grossSales, isArabic)}</td>
                <td className="text-center font-mono">-</td>
                <td className="text-right font-mono text-gold-dark">{formatSAR(totalVat, isArabic)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Two Column Layout: Top Products & Top Customers */}
      <div className="dashboard-tables-grid mt-6">
        {/* Top Products */}
        <Card
          className="top-products-card"
          title={
            <div className="flex items-center gap-2">
              <Package size={18} className="text-forest" />
              <span>{t('repTopProducts')}</span>
            </div>
          }
        >
          <div className="table-responsive">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>{t('product')}</th>
                  <th className="text-center">{t('quantity')}</th>
                  <th className="text-right">{t('total')}</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="font-semibold text-xs">
                        {isArabic ? (p.nameAr || p.name) : p.name}
                      </div>
                      <div className="font-mono text-muted text-xs">SKU: {p.sku}</div>
                    </td>
                    <td className="text-center font-mono text-xs">{p.qty}</td>
                    <td className="text-right font-mono font-bold text-xs text-forest">
                      {formatSAR(p.revenue, isArabic)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Customers */}
        <Card
          className="top-customers-card"
          title={
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gold" />
              <span>{t('repTopCustomers')}</span>
            </div>
          }
        >
          <div className="table-responsive">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>{t('customer')}</th>
                  <th className="text-center">{t('dashTotalInvoices')}</th>
                  <th className="text-right">{t('total')}</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="font-semibold text-xs">{c.name}</div>
                      {c.vatNumber && (
                        <div className="font-mono text-muted text-xs">VAT: {c.vatNumber}</div>
                      )}
                    </td>
                    <td className="text-center font-mono text-xs">{c.count}</td>
                    <td className="text-right font-mono font-bold text-xs text-forest">
                      {formatSAR(c.revenue, isArabic)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
