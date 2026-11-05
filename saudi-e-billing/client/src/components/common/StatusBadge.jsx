import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const StatusBadge = ({ status, className = '' }) => {
  const { isArabic } = useLanguage();

  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  let badgeType = 'default';
  let label = status;

  switch (normalized) {
    case 'paid':
      badgeType = 'success';
      label = isArabic ? 'مسددة' : 'Paid';
      break;
    case 'accepted':
      badgeType = 'success';
      label = isArabic ? 'مقبول' : 'Accepted';
      break;
    case 'delivered':
      badgeType = 'success';
      label = isArabic ? 'تم التسليم' : 'Delivered';
      break;
    case 'in stock':
      badgeType = 'success';
      label = isArabic ? 'متوفر' : 'In Stock';
      break;

    case 'issued':
      badgeType = 'primary';
      label = isArabic ? 'صادرة' : 'Issued';
      break;
    case 'sent':
      badgeType = 'primary';
      label = isArabic ? 'مرسل' : 'Sent';
      break;
    case 'ready for delivery':
    case 'ready':
      badgeType = 'info';
      label = isArabic ? 'جاهز للتسليم' : 'Ready for Delivery';
      break;

    case 'partially paid':
      badgeType = 'warning';
      label = isArabic ? 'مسددة جزئياً' : 'Partially Paid';
      break;
    case 'low stock':
      badgeType = 'warning';
      label = isArabic ? 'مخزون منخفض' : 'Low Stock';
      break;

    case 'draft':
      badgeType = 'neutral';
      label = isArabic ? 'مسودة' : 'Draft';
      break;

    case 'overdue':
      badgeType = 'danger';
      label = isArabic ? 'متأخرة السداد' : 'Overdue';
      break;
    case 'rejected':
      badgeType = 'danger';
      label = isArabic ? 'مرفوض' : 'Rejected';
      break;
    case 'cancelled':
      badgeType = 'danger';
      label = isArabic ? 'ملغي' : 'Cancelled';
      break;
    case 'out of stock':
      badgeType = 'danger';
      label = isArabic ? 'نفذ من المخزون' : 'Out of Stock';
      break;
    case 'expired':
      badgeType = 'neutral-dark';
      label = isArabic ? 'منتهي الصلاحية' : 'Expired';
      break;

    default:
      badgeType = 'default';
      label = status;
  }

  return (
    <span className={`status-badge badge-${badgeType} ${className}`}>
      <span className="badge-dot" />
      <span className="badge-text">{label}</span>
    </span>
  );
};
