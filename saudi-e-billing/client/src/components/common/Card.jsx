import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Card = ({ children, className = '', title, action, ...props }) => {
  return (
    <div className={`sa-card ${className}`} {...props}>
      {(title || action) && (
        <div className="sa-card-header">
          {title && <h3 className="sa-card-title">{title}</h3>}
          {action && <div className="sa-card-action">{action}</div>}
        </div>
      )}
      <div className="sa-card-body">{children}</div>
    </div>
  );
};

export const MetricCard = ({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  colorScheme = 'gold', // gold, emerald, blue, rose
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`sa-metric-card sa-metric-${colorScheme} ${onClick ? 'cursor-pointer hover-card' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="sa-metric-top">
        <span className="sa-metric-title">{title}</span>
        {Icon && (
          <div className="sa-metric-icon-wrap">
            <Icon size={20} className="sa-metric-icon" />
          </div>
        )}
      </div>
      <div className="sa-metric-value-row">
        <div className="sa-metric-value">{value}</div>
        {subvalue && <div className="sa-metric-sub">{subvalue}</div>}
      </div>
      {(trendValue || trendLabel) && (
        <div className="sa-metric-footer">
          {trendValue && (
            <span className={`sa-metric-trend ${trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral'}`}>
              {trend === 'up' && <ArrowUpRight size={14} />}
              {trend === 'down' && <ArrowDownRight size={14} />}
              {trendValue}
            </span>
          )}
          {trendLabel && <span className="sa-metric-trend-label">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};

