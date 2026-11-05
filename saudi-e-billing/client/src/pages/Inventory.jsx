import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Layers,
  AlertTriangle,
  DollarSign,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatSAR, translateCategory } from '../utils/formatters';

export const Inventory = () => {
  const { t, isArabic } = useLanguage();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustProductStock,
  } = useApp();

  const [searchParams] = useSearchParams();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(
    searchParams.get('action') === 'new'
  );
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'subtract'
  const [adjustReason, setAdjustReason] = useState('Restock / Purchase');
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Form state
  const initialForm = {
    nameEn: '',
    nameAr: '',
    sku: '',
    barcode: '',
    category: 'Electronics',
    description: '',
    unit: 'Unit',
    unitAr: 'حبة',
    purchasePrice: '',
    sellingPrice: '',
    vatRate: 15,
    stockQuantity: '',
    minStockLevel: 5,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [products]);

  // Inventory Metrics
  const totalProductsCount = products.length;
  const totalStockQuantity = products.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.purchasePrice) || 0) * (Number(p.stockQuantity) || 0),
    0
  );

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.nameEn.toLowerCase().includes(q) ||
        (p.nameAr && p.nameAr.includes(q)) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q));

      // Category
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;

      // Status
      let matchStatus = true;
      if (selectedStatus === 'IN_STOCK') {
        matchStatus = p.stockQuantity > p.minStockLevel;
      } else if (selectedStatus === 'LOW_STOCK') {
        matchStatus = p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel;
      } else if (selectedStatus === 'OUT_OF_STOCK') {
        matchStatus = p.stockQuantity === 0;
      }

      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: `628${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      nameEn: prod.nameEn || '',
      nameAr: prod.nameAr || '',
      sku: prod.sku || '',
      barcode: prod.barcode || '',
      category: prod.category || 'Electronics',
      description: prod.description || '',
      unit: prod.unit || 'Unit',
      unitAr: prod.unitAr || 'حبة',
      purchasePrice: prod.purchasePrice ?? '',
      sellingPrice: prod.sellingPrice ?? '',
      vatRate: prod.vatRate ?? 15,
      stockQuantity: prod.stockQuantity ?? 0,
      minStockLevel: prod.minStockLevel ?? 5,
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.nameEn.trim()) errs.nameEn = isArabic ? 'اسم المنتج بالإنجليزية مطلوب' : 'Product name in English is required';
    if (!formData.sku.trim()) errs.sku = isArabic ? 'رمز SKU مطلوب' : 'SKU is required';
    if (formData.sellingPrice === '' || Number(formData.sellingPrice) < 0) {
      errs.sellingPrice = isArabic ? 'سعر البيع يجب أن يكون أكبر أو يساوي 0' : 'Selling price must be 0 or higher';
    }
    if (formData.purchasePrice === '' || Number(formData.purchasePrice) < 0) {
      errs.purchasePrice = isArabic ? 'سعر الشراء يجب أن يكون 0 أو أكثر' : 'Purchase price must be 0 or higher';
    }
    if (formData.stockQuantity === '' || Number(formData.stockQuantity) < 0) {
      errs.stockQuantity = isArabic ? 'كمية المخزون يجب ألا تكون سالبة' : 'Stock quantity cannot be negative';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsAddEditOpen(false);
    setEditingProduct(null);
  };

  const handleApplyAdjustment = () => {
    if (!adjustingProduct) return;
    const delta = adjustType === 'add' ? Math.abs(adjustQuantity) : -Math.abs(adjustQuantity);
    adjustProductStock(adjustingProduct.id, delta, adjustReason);
    setAdjustingProduct(null);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  // Columns definition
  const columns = [
    {
      header: t('product'),
      key: 'name',
      render: (p) => (
        <div className="product-cell">
          <div className="product-cell-name font-semibold">
            {isArabic ? (p.nameAr || p.nameEn) : p.nameEn}
          </div>
          {p.nameAr && !isArabic && (
            <div className="product-cell-sub text-muted text-xs">{p.nameAr}</div>
          )}
          <div className="product-cell-meta text-xs text-muted flex items-center gap-2 mt-0.5">
            <span className="font-mono">SKU: {p.sku}</span>
            {p.barcode && <span>• GTIN: {p.barcode}</span>}
          </div>
        </div>
      ),
    },
    {
      header: t('invCategory'),
      key: 'category',
      render: (p) => <span className="category-pill">{translateCategory(p.category, isArabic)}</span>,
    },
    {
      header: t('invPurchasePrice'),
      key: 'purchasePrice',
      align: 'right',
      render: (p) => (
        <span className="font-mono text-muted text-xs">
          {formatSAR(p.purchasePrice, isArabic)}
        </span>
      ),
    },
    {
      header: t('invSellingPrice'),
      key: 'sellingPrice',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-semibold text-sm">
          {formatSAR(p.sellingPrice, isArabic)}
        </span>
      ),
    },
    {
      header: t('vatRate'),
      key: 'vatRate',
      align: 'center',
      render: (p) => <span className="font-mono text-xs">{p.vatRate}%</span>,
    },
    {
      header: t('invInitialStock'),
      key: 'stockQuantity',
      align: 'center',
      render: (p) => (
        <div className="stock-qty-cell">
          <span className="font-mono font-bold text-sm">{p.stockQuantity}</span>
          <span className="text-xs text-muted">
            {isArabic ? (p.unitAr || 'حبة') : (p.unit || 'Unit')}
          </span>
        </div>
      ),
    },
    {
      header: t('status'),
      key: 'status',
      align: 'center',
      render: (p) => {
        let status = 'In Stock';
        if (p.stockQuantity === 0) status = 'Out of Stock';
        else if (p.stockQuantity <= p.minStockLevel) status = 'Low Stock';
        return <StatusBadge status={status} />;
      },
    },
    {
      header: t('actions'),
      key: 'actions',
      align: 'center',
      render: (p) => (
        <div className="table-actions-row">
          <button
            type="button"
            className="action-icon-btn"
            title={t('viewDetails')}
            onClick={() => setViewingProduct(p)}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="action-icon-btn"
            title={t('invAdjustStock')}
            onClick={() => {
              setAdjustingProduct(p);
              setAdjustQuantity(1);
              setAdjustType('add');
            }}
          >
            <SlidersHorizontal size={15} />
          </button>
          <button
            type="button"
            className="action-icon-btn"
            title={t('edit')}
            onClick={() => handleOpenEdit(p)}
          >
            <Edit size={15} />
          </button>
          <button
            type="button"
            className="action-icon-btn text-danger hover:bg-red-50"
            title={t('delete')}
            onClick={() => setDeletingProductId(p.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container inventory-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{t('navInventory')}</h1>
          <p className="page-subtitle">
            {isArabic
              ? 'إدارة المنتجات، ضبط كميات المخزون، وتتبع مستويات التنبيه للأصناف'
              : 'Product catalog, active stock management, and low threshold inventory controls.'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          {t('invNewProduct')}
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="metrics-grid">
        <MetricCard
          title={t('invTotalProducts')}
          value={totalProductsCount}
          icon={Package}
          colorScheme="forest"
        />
        <MetricCard
          title={t('invTotalQuantity')}
          value={totalStockQuantity}
          subvalue={isArabic ? 'وحدات مادية بالمخزن' : 'units across warehouse'}
          icon={Layers}
          colorScheme="gold"
        />
        <MetricCard
          title={t('invLowStockCount')}
          value={lowStockCount}
          subvalue={lowStockCount > 0 ? (isArabic ? 'تحتاج توريد عاجل' : 'requires replenishment') : (isArabic ? 'الوضع ممتاز' : 'Optimal')}
          icon={AlertTriangle}
          colorScheme={lowStockCount > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title={t('invTotalValue')}
          value={formatSAR(totalInventoryValue, isArabic)}
          subvalue={isArabic ? 'بسعر الشراء التكلفي' : 'based on cost value'}
          icon={DollarSign}
          colorScheme="blue"
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="table-filter-bar">
        <div className="filter-search-wrap">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={t('invSearchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <select
            className="select-field"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">{t('invAllCategories')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {translateCategory(c, isArabic)}
              </option>
            ))}
          </select>

          <select
            className="select-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">{t('invAllStatuses')}</option>
            <option value="IN_STOCK">{t('invInStock')}</option>
            <option value="LOW_STOCK">{t('invLowStock')}</option>
            <option value="OUT_OF_STOCK">{t('invOutOfStock')}</option>
          </select>

          {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
            <Button variant="ghost" size="sm" icon={X} onClick={clearAllFilters}>
              {t('clearFilters')}
            </Button>
          )}
        </div>
      </div>

      {/* Products Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyField="id"
        emptyMessage={isArabic ? 'لم يتم العثور على أية منتجات' : 'No products found'}
        emptySubtext={isArabic ? 'جرب تغيير شروط البحث أو الفلاتر' : 'Try adjusting your search query or filters'}
        emptyAction={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            {t('invNewProduct')}
          </Button>
        }
      />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingProduct ? t('invEditProduct') : t('invNewProduct')}
        size="lg"
        footer={
          <div className="modal-actions-right">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveProduct}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveProduct} className="product-form-grid">
          <div className="form-group col-span-2 md:col-span-1">
            <label className="form-label">{t('invProductNameEn')} *</label>
            <input
              type="text"
              className={`input-field ${formErrors.nameEn ? 'border-danger' : ''}`}
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="e.g. Industrial Barcode Scanner"
            />
            {formErrors.nameEn && <span className="error-text">{formErrors.nameEn}</span>}
          </div>

          <div className="form-group col-span-2 md:col-span-1">
            <label className="form-label">{t('invProductNameAr')}</label>
            <input
              type="text"
              className="input-field font-arabic"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder="مثال: قارئ باركود صناعي عالي السرعة"
              dir="rtl"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('invSku')} *</label>
            <input
              type="text"
              className={`input-field font-mono ${formErrors.sku ? 'border-danger' : ''}`}
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. TECH-BC-901"
            />
            {formErrors.sku && <span className="error-text">{formErrors.sku}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('invBarcode')}</label>
            <input
              type="text"
              className="input-field font-mono"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="e.g. 6281002345912"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('invCategory')}</label>
            <input
              type="text"
              className="input-field"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Electronics, Hardware, Supplies"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('invUnit')}</label>
            <select
              className="select-field"
              value={formData.unit}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  unit: val,
                  unitAr: val === 'Unit' ? 'حبة' : val === 'Pack' ? 'حزمة' : val === 'Set' ? 'طقم' : 'متر',
                });
              }}
            >
              <option value="Unit">Unit / حبة</option>
              <option value="Pack">Pack / حزمة</option>
              <option value="Set">Set / طقم</option>
              <option value="Box">Box / كرتون</option>
              <option value="Meter">Meter / متر</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('invPurchasePrice')} *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`input-field font-mono ${formErrors.purchasePrice ? 'border-danger' : ''}`}
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              placeholder="0.00"
            />
            {formErrors.purchasePrice && <span className="error-text">{formErrors.purchasePrice}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('invSellingPrice')} *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`input-field font-mono ${formErrors.sellingPrice ? 'border-danger' : ''}`}
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              placeholder="0.00"
            />
            {formErrors.sellingPrice && <span className="error-text">{formErrors.sellingPrice}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('vatRate')}</label>
            <select
              className="select-field font-mono"
              value={formData.vatRate}
              onChange={(e) => setFormData({ ...formData, vatRate: Number(e.target.value) })}
            >
              <option value={15}>15% (Standard Rate)</option>
              <option value={0}>0% (Zero Rated)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('invInitialStock')} *</label>
            <input
              type="number"
              min="0"
              className={`input-field font-mono ${formErrors.stockQuantity ? 'border-danger' : ''}`}
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              placeholder="0"
            />
            {formErrors.stockQuantity && <span className="error-text">{formErrors.stockQuantity}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('invMinAlert')}</label>
            <input
              type="number"
              min="1"
              className="input-field font-mono"
              value={formData.minStockLevel}
              onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
              placeholder="5"
            />
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">{t('invDescription')}</label>
            <textarea
              rows="3"
              className="textarea-field"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical specifications, warehouse bin location, and warranty notes..."
            />
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <Modal
          isOpen={!!adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          title={`${t('invAdjustStock')}: ${adjustingProduct.nameEn}`}
          size="sm"
          footer={
            <div className="modal-actions-right">
              <Button variant="outline" onClick={() => setAdjustingProduct(null)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleApplyAdjustment}>
                {t('confirm')}
              </Button>
            </div>
          }
        >
          <div className="adjust-stock-content">
            <div className="current-stock-info">
              <span className="text-muted text-xs">{t('invInitialStock')}:</span>
              <span className="font-mono font-bold text-lg text-forest">
                {adjustingProduct.stockQuantity} {adjustingProduct.unit}
              </span>
            </div>

            <div className="adjust-type-toggle">
              <button
                type="button"
                className={`adjust-toggle-btn ${adjustType === 'add' ? 'active-add' : ''}`}
                onClick={() => setAdjustType('add')}
              >
                + {isArabic ? 'إضافة كمية (توريد)' : 'Add Stock (Inbound)'}
              </button>
              <button
                type="button"
                className={`adjust-toggle-btn ${adjustType === 'subtract' ? 'active-sub' : ''}`}
                onClick={() => setAdjustType('subtract')}
              >
                - {isArabic ? 'إنقاص كمية (تالف/سحب)' : 'Deduct Stock (Damage/Out)'}
              </button>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">{t('quantity')} *</label>
              <input
                type="number"
                min="1"
                className="input-field font-mono font-bold text-center text-lg"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <div className="form-group mt-3">
              <label className="form-label">{isArabic ? 'سبب التعديل' : 'Reason for Adjustment'}</label>
              <select
                className="select-field"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              >
                <option value="Restock / Purchase">Supplier Delivery / Restock</option>
                <option value="Inventory Count Correction">Physical Inventory Count Correction</option>
                <option value="Damaged / Expired">Damaged or Defective Items Write-off</option>
                <option value="Return from Customer">Customer Return / Exchange</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Product Details Modal */}
      {viewingProduct && (
        <Modal
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          title={isArabic ? (viewingProduct.nameAr || viewingProduct.nameEn) : viewingProduct.nameEn}
          size="md"
          footer={
            <div className="modal-actions-right">
              <Button variant="outline" onClick={() => setViewingProduct(null)}>
                {t('close')}
              </Button>
              <Button
                variant="primary"
                icon={Edit}
                onClick={() => {
                  const p = viewingProduct;
                  setViewingProduct(null);
                  handleOpenEdit(p);
                }}
              >
                {t('edit')}
              </Button>
            </div>
          }
        >
          <div className="product-details-sheet">
            <div className="detail-meta-header">
              <div>
                <span className="font-mono text-xs text-muted">SKU: {viewingProduct.sku}</span>
                {viewingProduct.barcode && (
                  <span className="font-mono text-xs text-muted ml-3">
                    Barcode: {viewingProduct.barcode}
                  </span>
                )}
              </div>
              <StatusBadge
                status={
                  viewingProduct.stockQuantity === 0
                    ? 'Out of Stock'
                    : viewingProduct.stockQuantity <= viewingProduct.minStockLevel
                    ? 'Low Stock'
                    : 'In Stock'
                }
              />
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <span className="detail-label">{t('invSellingPrice')}</span>
                <span className="detail-value text-gold-dark font-mono font-bold">
                  {formatSAR(viewingProduct.sellingPrice, isArabic)}
                </span>
              </div>
              <div className="detail-card">
                <span className="detail-label">{t('invPurchasePrice')}</span>
                <span className="detail-value font-mono">
                  {formatSAR(viewingProduct.purchasePrice, isArabic)}
                </span>
              </div>
              <div className="detail-card">
                <span className="detail-label">{isArabic ? 'هامش الربح التقديري' : 'Estimated Margin'}</span>
                <span className="detail-value font-mono text-emerald-700">
                  {formatSAR(viewingProduct.sellingPrice - viewingProduct.purchasePrice, isArabic)} (
                  {viewingProduct.purchasePrice > 0
                    ? `${Math.round(
                        ((viewingProduct.sellingPrice - viewingProduct.purchasePrice) /
                          viewingProduct.purchasePrice) *
                          100
                      )}%`
                    : '100%'}
                  )
                </span>
              </div>
              <div className="detail-card">
                <span className="detail-label">{t('invInitialStock')}</span>
                <span className="detail-value font-mono font-bold">
                  {viewingProduct.stockQuantity} {viewingProduct.unit}
                </span>
              </div>
            </div>

            {viewingProduct.description && (
              <div className="mt-4">
                <label className="text-xs font-semibold text-muted block mb-1">
                  {t('invDescription')}
                </label>
                <p className="text-sm bg-neutral-50 p-3 rounded-lg border border-neutral-200 leading-relaxed">
                  {viewingProduct.description}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        onConfirm={() => {
          deleteProduct(deletingProductId);
          setDeletingProductId(null);
        }}
        title={t('confirmTitle')}
        message={t('confirmDeleteProduct')}
        type="danger"
      />
    </div>
  );
};
