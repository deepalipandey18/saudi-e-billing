/**
 * Formatting utilities for Saudi E-Billing SaaS
 */

// Format SAR Currency with proper commas and 2 decimals
export const formatSAR = (amount, isArabic = false) => {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${isArabic ? 'ر.س' : 'SAR'}`;
};

// Format Date YYYY-MM-DD
export const formatDate = (dateString, isArabic = false) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(isArabic ? 'ar-SA' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Calculate line items totals safely
export const calculateTotals = (items = []) => {
  let subtotal = 0;
  let discountTotal = 0;
  let vatTotal = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const vatRate = Number(item.vatRate ?? 15) / 100;

    const lineGross = qty * price;
    const lineNet = Math.max(0, lineGross - discount);
    const lineVat = lineNet * vatRate;

    subtotal += lineNet;
    discountTotal += discount;
    vatTotal += lineVat;
  });

  const grandTotal = subtotal + vatTotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    vatTotal: Math.round(vatTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
};

// Translate product category
export const translateCategory = (cat, isArabic = false) => {
  if (!cat) return '';
  if (!isArabic) return cat;
  const map = {
    Electronics: 'إلكترونيات',
    Hardware: 'أجهزة ومعدات',
    Storage: 'تخزين ومستودعات',
    Furniture: 'أثاث مكتبي',
    Networking: 'شبكات واتصالات',
    Supplies: 'مستلزمات ومستهلكات',
  };
  return map[cat] || cat;
};

// Translate payment method
export const translatePaymentMethod = (method, isArabic = false) => {
  if (!method) return isArabic ? 'تحويل بنكي' : 'Bank Transfer';
  if (!isArabic) return method;
  const map = {
    'Bank Transfer': 'تحويل بنكي / IBAN',
    'Mada / Debit Card': 'بطاقة مدى / بنكية',
    'Credit Card': 'بطاقة ائتمانية',
    Cash: 'نقداً',
  };
  return map[method] || method;
};

// Generate unique sequential document ID
export const generateId = (prefix = 'item') => {
  const timestamp = Date.now().toString(36).slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Generate realistic TLV base64 string for Saudi Tax Invoice QR Code simulation
export const generateSaudiQrData = ({
  sellerName,
  vatNumber,
  invoiceTimestamp,
  invoiceTotal,
  vatTotal,
}) => {
  // Helper to pack TLV (Tag-Length-Value)
  const toUtf8Bytes = (str) => {
    return unescape(encodeURIComponent(str));
  };

  const packTlv = (tag, valueStr) => {
    const utf8Val = toUtf8Bytes(valueStr || '');
    const len = utf8Val.length;
    return String.fromCharCode(tag) + String.fromCharCode(len) + utf8Val;
  };

  try {
    const tlv1 = packTlv(1, sellerName || 'Al-Buraq Solutions LLC');
    const tlv2 = packTlv(2, vatNumber || '310294817500003');
    const tlv3 = packTlv(3, invoiceTimestamp || new Date().toISOString());
    const tlv4 = packTlv(4, (Number(invoiceTotal) || 0).toFixed(2));
    const tlv5 = packTlv(5, (Number(vatTotal) || 0).toFixed(2));

    const fullTlv = tlv1 + tlv2 + tlv3 + tlv4 + tlv5;
    return btoa(fullTlv);
  } catch {
    return 'AQ9BbC1CdXJhcSBTb2x1dGlvbnMCEzMxMDI5NDgxNzUwMDAwMw==';
  }
};

