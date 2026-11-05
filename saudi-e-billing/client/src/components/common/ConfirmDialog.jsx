import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger', // danger, warning, info
  loading = false,
}) => {
  const { t } = useLanguage();

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={24} className="text-danger" />;
      case 'warning':
        return <AlertCircle size={24} className="text-warning" />;
      default:
        return <Info size={24} className="text-info" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="confirm-content">
        <div className={`confirm-icon-wrap icon-${type}`}>{getIcon()}</div>
        <h3 className="confirm-title">{title || t('confirmTitle')}</h3>
        <p className="confirm-message">{message}</p>
      </div>
      <div className="confirm-actions">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText || t('cancel')}
        </Button>
        <Button
          variant={type === 'danger' ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
          }}
          loading={loading}
        >
          {confirmText || t('confirm')}
        </Button>
      </div>
    </Modal>
  );
};
