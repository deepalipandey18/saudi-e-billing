import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found',
  emptySubtext = 'Try adjusting your filters or search terms',
  emptyAction = null,
  pageSize = 10,
  loading = false,
  className = '',
}) => {
  const { isArabic } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className={`table-container ${className}`}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`th-cell ${col.align ? `text-${col.align}` : ''} ${col.className || ''}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="table-loading-cell">
                  <div className="table-loading-spinner">
                    <span className="spinner" />
                    <p>{isArabic ? 'جاري تحميل البيانات...' : 'Loading records...'}</p>
                  </div>
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  <div className="empty-state">
                    <div className="empty-icon-wrap">
                      <Inbox size={36} className="text-muted" />
                    </div>
                    <h4 className="empty-title">{emptyMessage}</h4>
                    <p className="empty-subtext">{emptySubtext}</p>
                    {emptyAction && <div className="empty-action">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIdx) => (
                <tr key={row[keyField] || rowIdx} className="table-row">
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`td-cell ${col.align ? `text-${col.align}` : ''} ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.length > pageSize && (
        <div className="table-pagination">
          <span className="pagination-info">
            {isArabic
              ? `عرض ${startIndex + 1} - ${Math.min(startIndex + pageSize, data.length)} من أصل ${data.length}`
              : `Showing ${startIndex + 1} - ${Math.min(startIndex + pageSize, data.length)} of ${data.length}`}
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <span className="pagination-current-page">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

