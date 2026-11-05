import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'start',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'btn-base';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className} ${disabled ? 'btn-disabled' : ''}`}
      {...props}
    >
      {loading ? (
        <span className="spinner" />
      ) : (
        Icon && iconPosition === 'start' && <Icon className="btn-icon" size={size === 'sm' ? 14 : 18} />
      )}
      <span className="btn-text">{children}</span>
      {!loading && Icon && iconPosition === 'end' && (
        <Icon className="btn-icon" size={size === 'sm' ? 14 : 18} />
      )}
    </button>
  );
};

