import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ReceiptText,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Eye,
  FileSpreadsheet,
  Package,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MetricCard, Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatSAR, formatDate } from '../utils/formatters';
import { InvoicePrintModal } from '../components/print/InvoicePrintModal';

export const Dashboard = () => {
  const { t, isArabic } = useLanguage();
  const {
    invoices,
    quotations,
    companySettings,
    lowStockProducts,
  } = useApp();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState('monthly'); // 'weekly' | 'monthly'
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Compute metrics
  const totalSales = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalInvoicesCount = invoices.length;
  const outstandingPayments = invoices
    .filter((inv) => inv.status !== 'Paid' && inv.status !== 'Cancelled')
    .reduce((sum, inv) => sum + (Number(inv.grandTotal) - (Number(inv.amountPaid) || 0)), 0);
  const vatCollected = invoices.reduce((sum, inv) => sum + (Number(inv.vatTotal) || 0), 0);

  // Sales Trend Chart Data (Mock realistic Saudi business curve)
  const chartDataMonthly = [
    { label: isArabic ? 'مايو' : 'May', revenue: 24500, invoices: 8 },
    { label: isArabic ? 'يونيو' : 'Jun', revenue: 31200, invoices: 11 },
    { label: isArabic ? 'يوليو' : 'Jul', revenue: 28900, invoices: 9 },
    { label: isArabic ? 'أغسطس' : 'Aug', revenue: 38400, invoices: 14 },
    { label: isArabic ? 'سبتمبر' : 'Sep', revenue: 42100, invoices: 16 },
    { label: isArabic ? 'أكتوبر' : 'Oct', revenue: 49850, invoices: 19 },
    { label: isArabic ? 'نوفمبر' : 'Nov', revenue: 56200, invoices: 22 },
  ];

  const chartDataWeekly = [
    { label: isArabic ? 'الأسبوع 1' : 'Week 1', revenue: 11800, invoices: 4 },
    { label: isArabic ? 'الأسبوع 2' : 'Week 2', revenue: 14200, invoices: 6 },
    { label: isArabic ? 'الأسبوع 3' : 'Week 3', revenue: 16500, invoices: 7 },
    { label: isArabic ? 'الأسبوع 4' : 'Week 4', revenue: 13700, invoices: 5 },
  ];

  const currentChartData = timeRange === 'monthly' ? chartDataMonthly : chartDataWeekly;
  const maxRevenue = Math.max(...currentChartData.map((d) => d.revenue));

  // Recent Invoices (limit 5)
  const recentInvoices = [...invoices].slice(0, 5);

  // Recent Quotations (limit 4)
  const recentQuotations = [...quotations].slice(0, 4);

  return (
    <div className="page-container dashboard-page">
      {/* Top Banner / Welcome Row */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{t('navDashboard')}</h1>
          <p className="page-subtitle">
            {isArabic
              ? `مرحباً بك مجدداً. إليك ملخص الأداء المالي والفوترة لمنشأة ${companySettings.companyNameAr}`
              : `Welcome back. Commercial invoicing overview for ${companySettings.companyNameEn}`}
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="header-action-group">
          <Button
            variant="outline"
            size="sm"
            icon={Package}
            onClick={() => navigate('/inventory?action=new')}
          >
            {t('addProduct')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => navigate('/quotations?action=new')}
          >
            {t('createQuotation')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Truck}
            onClick={() => navigate('/delivery-notes?action=new')}
          >
            {t('createDeliveryNote')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ReceiptText}
            onClick={() => navigate('/invoices?action=new')}
          >
            {t('createInvoice')}
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="metrics-grid">
        <MetricCard
          title={t('dashTotalSales')}
          value={formatSAR(totalSales, isArabic)}
          icon={DollarSign}
          trend="up"
          trendValue="+18.4%"
          trendLabel={isArabic ? 'مقارنة بالشهر السابق' : 'vs last month'}
          colorScheme="gold"
          onClick={() => navigate('/reports')}
        />
        <MetricCard
          title={t('dashTotalInvoices')}
          value={totalInvoicesCount}
          icon={ReceiptText}
          trend="up"
          trendValue="+12.5%"
          trendLabel={isArabic ? 'زيادة في وتيرة الفواتير' : 'growth in volume'}
          colorScheme="forest"
          onClick={() => navigate('/invoices')}
        />
        <MetricCard
          title={t('dashOutstanding')}
          value={formatSAR(outstandingPayments, isArabic)}
          icon={Clock}
          trend={outstandingPayments > 0 ? 'down' : 'neutral'}
          trendValue={outstandingPayments > 0 ? `${invoices.filter((i) => i.status !== 'Paid').length} Unsettled` : '0'}
          trendLabel={isArabic ? 'مستحقات واجبة التحصيل' : 'due from clients'}
          colorScheme="amber"
          onClick={() => navigate('/invoices')}
        />
        <MetricCard
          title={t('dashVatCollected')}
          value={formatSAR(vatCollected, isArabic)}
          icon={ShieldCheck}
          trend="up"
          trendValue="15% KSA Standard"
          trendLabel={isArabic ? 'ضريبة القيمة المضافة المحصلة' : 'tax collected'}
          colorScheme="blue"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Main Grid: Revenue Chart & Stock Alerts */}
      <div className="dashboard-charts-grid">
        {/* Sales Chart Card */}
        <Card
          className="chart-card"
          title={
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-gold" />
              <span>{t('dashSalesOverview')}</span>
            </div>
          }
          action={
            <div className="toggle-button-group">
              <button
                type="button"
                className={`toggle-btn ${timeRange === 'weekly' ? 'active' : ''}`}
                onClick={() => setTimeRange('weekly')}
              >
                {t('dashWeekly')}
              </button>
              <button
                type="button"
                className={`toggle-btn ${timeRange === 'monthly' ? 'active' : ''}`}
                onClick={() => setTimeRange('monthly')}
              >
                {t('dashMonthly')}
              </button>
            </div>
          }
        >
          {/* Interactive Bar Chart Visualization */}
          <div className="chart-wrapper">
            <div className="chart-bars-container">
              {currentChartData.map((item, idx) => {
                const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                return (
                  <div key={idx} className="chart-bar-col">
                    <div className="bar-hover-tooltip">
                      <span className="tooltip-val">{formatSAR(item.revenue, isArabic)}</span>
                      <span className="tooltip-sub">
                        {item.invoices} {isArabic ? 'فواتير' : 'Invoices'}
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="bar-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="chart-footer-note">
              <span>
                {isArabic
                  ? 'نمو مستمر في حجم التوريدات والمبيعات الخاضعة لضريبة 15% في السوق السعودي'
                  : 'Consistent quarterly expansion across Saudi commercial logistics and B2B services.'}
              </span>
            </div>
          </div>
        </Card>

        {/* Stock Alerts Card */}
        <Card
          className="stock-alerts-card"
          title={
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" />
              <span>{t('dashStockAlerts')}</span>
              {lowStockProducts.length > 0 && (
                <span className="badge-warning-pill">{lowStockProducts.length}</span>
              )}
            </div>
          }
          action={
            <button
              type="button"
              className="text-btn text-xs font-semibold"
              onClick={() => navigate('/inventory')}
            >
              {t('dashViewAll')} →
            </button>
          }
        >
          <div className="alerts-list">
            {lowStockProducts.length === 0 ? (
              <div className="alerts-empty-state">
                <CheckCircle2 size={32} className="text-success mb-2" />
                <p>{t('dashNoAlerts')}</p>
              </div>
            ) : (
              lowStockProducts.map((prod) => (
                <div key={prod.id} className="alert-item">
                  <div className="alert-item-info">
                    <span className="alert-item-name font-semibold">
                      {isArabic ? (prod.nameAr || prod.nameEn) : prod.nameEn}
                    </span>
                    <span className="alert-item-sku text-muted font-mono text-xs">
                      SKU: {prod.sku} • {prod.category}
                    </span>
                  </div>
                  <div className="alert-item-status">
                    <span
                      className={`stock-count-tag ${
                        prod.stockQuantity === 0 ? 'tag-out' : 'tag-low'
                      }`}
                    >
                      {prod.stockQuantity === 0
                        ? (isArabic ? '0 وحدات' : '0 in stock')
                        : `${prod.stockQuantity} ${isArabic ? 'متبقي' : 'left'}`}
                    </span>
                    <button
                      type="button"
                      className="stock-replenish-btn"
                      onClick={() => navigate('/inventory')}
                    >
                      {isArabic ? 'تعديل' : 'Adjust'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Two Column Bottom Tables: Recent Invoices & Recent Quotations */}
      <div className="dashboard-tables-grid">
        {/* Recent Invoices */}
        <Card
          className="recent-invoices-card"
          title={
            <div className="flex items-center gap-2">
              <ReceiptText size={18} className="text-forest" />
              <span>{t('dashRecentInvoices')}</span>
            </div>
          }
          action={
            <button
              type="button"
              className="text-btn text-xs font-semibold"
              onClick={() => navigate('/invoices')}
            >
              {t('dashViewAll')} →
            </button>
          }
        >
          <div className="table-responsive">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>{t('invNumber')}</th>
                  <th>{t('customer')}</th>
                  <th>{t('date')}</th>
                  <th className="text-right">{t('total')}</th>
                  <th className="text-center">{t('status')}</th>
                  <th className="text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-mono font-bold text-xs">{inv.invoiceNumber}</td>
                    <td className="text-xs truncate max-w-[140px]">{inv.customerName}</td>
                    <td className="text-xs text-muted">{formatDate(inv.invoiceDate, isArabic)}</td>
                    <td className="text-right font-mono font-semibold text-xs">
                      {formatSAR(inv.grandTotal, isArabic)}
                    </td>
                    <td className="text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => setSelectedInvoice(inv)}
                        title={t('viewDetails')}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Quotations */}
        <Card
          className="recent-quotations-card"
          title={
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-gold" />
              <span>{t('dashRecentQuotations')}</span>
            </div>
          }
          action={
            <button
              type="button"
              className="text-btn text-xs font-semibold"
              onClick={() => navigate('/quotations')}
            >
              {t('dashViewAll')} →
            </button>
          }
        >
          <div className="table-responsive">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>{t('qtNumber')}</th>
                  <th>{t('customer')}</th>
                  <th>{t('qtExpiryDate')}</th>
                  <th className="text-right">{t('total')}</th>
                  <th className="text-center">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map((qt) => (
                  <tr key={qt.id}>
                    <td className="font-mono font-bold text-xs">{qt.quotationNumber}</td>
                    <td className="text-xs truncate max-w-[140px]">{qt.customerName}</td>
                    <td className="text-xs text-muted">{formatDate(qt.expiryDate, isArabic)}</td>
                    <td className="text-right font-mono font-semibold text-xs">
                      {formatSAR(qt.grandTotal, isArabic)}
                    </td>
                    <td className="text-center">
                      <StatusBadge status={qt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Invoice Quick View & Print Modal */}
      {selectedInvoice && (
        <InvoicePrintModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
          companySettings={companySettings}
        />
      )}
    </div>
  );
};
