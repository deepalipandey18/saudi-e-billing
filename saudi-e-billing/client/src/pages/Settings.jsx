import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const Settings = () => {
  const { t, isArabic } = useLanguage();
  const { companySettings, updateCompanySettings, resetAllData } = useApp();

  const [formData, setFormData] = useState({ ...companySettings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateCompanySettings(formData);
  };

  return (
    <div className="page-container settings-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{t('navSettings')}</h1>
          <p className="page-subtitle">
            {isArabic
              ? 'تكوين بيانات المنشأة المورّدة، الرقم الضريبي، الحساب البنكي، وتفضيلات الفوترة'
              : 'Configure legal entity profile, commercial tax identification, banking coordinates, and invoicing prefix rules.'}
          </p>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSave}>
          {t('save')}
        </Button>
      </div>

      <form onSubmit={handleSave} className="settings-form-layout">
        {/* Company Profile Card */}
        <Card
          className="settings-card"
          title={
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-forest" />
              <span>{t('settCompanyProfile')}</span>
            </div>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t('settNameEn')} *</label>
              <input
                type="text"
                className="input-field"
                value={formData.companyNameEn}
                onChange={(e) => handleChange('companyNameEn', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('settNameAr')}</label>
              <input
                type="text"
                className="input-field font-arabic"
                dir="rtl"
                value={formData.companyNameAr}
                onChange={(e) => handleChange('companyNameAr', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('settCr')} *</label>
              <input
                type="text"
                className="input-field font-mono"
                value={formData.crNumber}
                onChange={(e) => handleChange('crNumber', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('settVat')} *</label>
              <input
                type="text"
                maxLength="15"
                className="input-field font-mono font-bold"
                value={formData.vatNumber}
                onChange={(e) =>
                  handleChange('vatNumber', e.target.value.replace(/\D/g, ''))
                }
              />
              <span className="text-xs text-muted mt-1 block">
                {isArabic
                  ? 'رقم معرف الضريبة المعتمد (15 رقماً يبدأ وينتهي بـ 3)'
                  : 'Official 15-digit KSA VAT ID beginning and ending with 3'}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">{t('settEmail')}</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('settPhone')}</label>
              <input
                type="text"
                className="input-field font-mono"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">{t('settAddressEn')}</label>
              <input
                type="text"
                className="input-field"
                value={formData.addressEn}
                onChange={(e) => handleChange('addressEn', e.target.value)}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">{t('settAddressAr')}</label>
              <input
                type="text"
                className="input-field font-arabic"
                dir="rtl"
                value={formData.addressAr}
                onChange={(e) => handleChange('addressAr', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('settCityEn')}</label>
              <input
                type="text"
                className="input-field"
                value={formData.cityEn}
                onChange={(e) => handleChange('cityEn', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('settPostal')}</label>
              <input
                type="text"
                className="input-field font-mono"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Banking Coordinates Card */}
        <Card
          className="settings-card mt-6"
          title={
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-gold" />
              <span>{t('settBanking')}</span>
            </div>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t('settBankName')}</label>
              <input
                type="text"
                className="input-field"
                value={formData.bankNameEn}
                onChange={(e) => handleChange('bankNameEn', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('settIban')} *</label>
              <input
                type="text"
                className="input-field font-mono font-bold text-sm"
                value={formData.iban}
                onChange={(e) => handleChange('iban', e.target.value)}
                placeholder="SA..."
              />
            </div>
          </div>
        </Card>

        {/* Tax & Invoicing Rules Card */}
        <Card
          className="settings-card mt-6"
          title={
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-forest" />
              <span>{t('settTaxConfig')}</span>
            </div>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t('settDefaultVat')}</label>
              <input
                type="number"
                disabled
                className="input-field font-mono bg-neutral-100"
                value={formData.defaultVatRate}
              />
              <span className="text-xs text-muted mt-1 block">
                {isArabic
                  ? 'النسبة الأساسية لضريبة القيمة المضافة في المملكة العربية السعودية 15%'
                  : 'Standard VAT statutory rate of 15% in Saudi Arabia'}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">{t('settCurrency')}</label>
              <input
                type="text"
                disabled
                className="input-field font-mono bg-neutral-100"
                value="SAR (Saudi Riyal / ريال سعودي)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isArabic ? 'بادئة ترقيم الفواتير' : 'Invoice Prefix'}</label>
              <input
                type="text"
                className="input-field font-mono"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isArabic ? 'بادئة ترقيم عروض الأسعار' : 'Quotation Prefix'}</label>
              <input
                type="text"
                className="input-field font-mono"
                value={formData.quotationPrefix}
                onChange={(e) => handleChange('quotationPrefix', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isArabic ? 'بادئة سندات التسليم' : 'Delivery Note Prefix'}</label>
              <input
                type="text"
                className="input-field font-mono"
                value={formData.deliveryPrefix}
                onChange={(e) => handleChange('deliveryPrefix', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Restore Sample Data Danger Zone */}
        <Card
          className="settings-card reset-card mt-6 border-danger-subtle"
          title={
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={18} />
              <span>{isArabic ? 'إدارة البيانات التجريبية' : 'Demo Data Management'}</span>
            </div>
          }
        >
          <div className="reset-action-row">
            <div>
              <h4 className="font-semibold text-sm">{t('settResetBtn')}</h4>
              <p className="text-xs text-muted mt-1">{t('settResetWarning')}</p>
            </div>
            <Button
              variant="danger"
              icon={RotateCcw}
              onClick={() => setIsResetConfirmOpen(true)}
            >
              {t('reset')}
            </Button>
          </div>
        </Card>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetAllData();
          setIsResetConfirmOpen(false);
          setFormData(companySettings);
        }}
        title={t('confirmTitle')}
        message={t('confirmReset')}
        type="danger"
        confirmText={isArabic ? 'استعادة البيانات التجريبية' : 'Reset Everything'}
      />
    </div>
  );
};
