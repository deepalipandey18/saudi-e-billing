import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialCompanySettings,
  initialCustomers,
  initialProducts,
  initialQuotations,
  initialDeliveryNotes,
  initialInvoices,
} from '../data/sampleData';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { generateId, calculateTotals } from '../utils/formatters';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { showToast } = useToast();
  const { isArabic } = useLanguage();

  // Load from localStorage with demo fallbacks
  const [companySettings, setCompanySettings] = useState(() =>
    loadFromStorage('saudi_ebilling_settings', initialCompanySettings)
  );

  const [products, setProducts] = useState(() =>
    loadFromStorage('saudi_ebilling_products', initialProducts)
  );

  const [customers, setCustomers] = useState(() =>
    loadFromStorage('saudi_ebilling_customers', initialCustomers)
  );

  const [quotations, setQuotations] = useState(() =>
    loadFromStorage('saudi_ebilling_quotations', initialQuotations)
  );

  const [deliveryNotes, setDeliveryNotes] = useState(() =>
    loadFromStorage('saudi_ebilling_delivery_notes', initialDeliveryNotes)
  );

  const [invoices, setInvoices] = useState(() =>
    loadFromStorage('saudi_ebilling_invoices', initialInvoices)
  );

  // Sync to storage
  useEffect(() => {
    saveToStorage('saudi_ebilling_settings', companySettings);
  }, [companySettings]);

  useEffect(() => {
    saveToStorage('saudi_ebilling_products', products);
  }, [products]);

  useEffect(() => {
    saveToStorage('saudi_ebilling_customers', customers);
  }, [customers]);

  useEffect(() => {
    saveToStorage('saudi_ebilling_quotations', quotations);
  }, [quotations]);

  useEffect(() => {
    saveToStorage('saudi_ebilling_delivery_notes', deliveryNotes);
  }, [deliveryNotes]);

  useEffect(() => {
    saveToStorage('saudi_ebilling_invoices', invoices);
  }, [invoices]);

  // Product Actions
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: generateId('prod'),
      purchasePrice: Number(productData.purchasePrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      stockQuantity: Number(productData.stockQuantity) || 0,
      minStockLevel: Number(productData.minStockLevel) || 5,
      vatRate: Number(productData.vatRate ?? 15),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(isArabic ? 'تمت إضافة المنتج بنجاح' : 'Product created successfully', 'success');
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updatedData,
              purchasePrice: Number(updatedData.purchasePrice ?? p.purchasePrice),
              sellingPrice: Number(updatedData.sellingPrice ?? p.sellingPrice),
              stockQuantity: Number(updatedData.stockQuantity ?? p.stockQuantity),
              minStockLevel: Number(updatedData.minStockLevel ?? p.minStockLevel),
              vatRate: Number(updatedData.vatRate ?? p.vatRate),
            }
          : p
      )
    );
    showToast(isArabic ? 'تم تحديث بيانات المنتج' : 'Product updated successfully', 'success');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(isArabic ? 'تم حذف المنتج من المخزون' : 'Product deleted successfully', 'info');
  };

  const adjustProductStock = (id, quantityChange, reason = 'Adjustment') => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, (Number(p.stockQuantity) || 0) + Number(quantityChange));
          return { ...p, stockQuantity: newQty };
        }
        return p;
      })
    );
    showToast(
      isArabic ? `تم تعديل المخزون (${reason})` : `Stock adjusted successfully (${reason})`,
      'success'
    );
  };

  // Customer Actions
  const addCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: generateId('cust'),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(isArabic ? 'تمت إضافة العميل بنجاح' : 'Customer added successfully', 'success');
    return newCustomer;
  };

  const updateCustomer = (id, updatedData) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
    showToast(isArabic ? 'تم تحديث بيانات العميل' : 'Customer updated successfully', 'success');
  };

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast(isArabic ? 'تم حذف العميل' : 'Customer deleted', 'info');
  };

  // Quotation Actions
  const addQuotation = (quotationData) => {
    const totals = calculateTotals(quotationData.items);
    const newQuotation = {
      ...quotationData,
      id: generateId('qt'),
      quotationNumber:
        quotationData.quotationNumber ||
        `${companySettings.quotationPrefix}${Date.now().toString().slice(-5)}`,
      ...totals,
      status: quotationData.status || 'Draft',
    };
    setQuotations((prev) => [newQuotation, ...prev]);
    showToast(isArabic ? 'تم إنشاء عرض السعر بنجاح' : 'Quotation created successfully', 'success');
    return newQuotation;
  };

  const updateQuotation = (id, updatedData) => {
    const totals = updatedData.items ? calculateTotals(updatedData.items) : {};
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updatedData, ...totals } : q))
    );
    showToast(isArabic ? 'تم تحديث عرض السعر' : 'Quotation updated successfully', 'success');
  };

  const deleteQuotation = (id) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    showToast(isArabic ? 'تم حذف عرض السعر' : 'Quotation deleted', 'info');
  };

  const updateQuotationStatus = (id, newStatus) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
    );
    showToast(
      isArabic ? `تم تغيير حالة العرض إلى: ${newStatus}` : `Quotation status updated to ${newStatus}`,
      'success'
    );
  };

  // Delivery Note Actions
  const addDeliveryNote = (deliveryData) => {
    const newDelivery = {
      ...deliveryData,
      id: generateId('dn'),
      deliveryNumber:
        deliveryData.deliveryNumber ||
        `${companySettings.deliveryPrefix}${Date.now().toString().slice(-5)}`,
      status: deliveryData.status || 'Draft',
      stockDeducted: deliveryData.status === 'Delivered',
    };

    // If initial status is delivered, deduct stock right away safely
    if (newDelivery.status === 'Delivered' && newDelivery.items?.length) {
      deductItemsFromInventory(newDelivery.items);
    }

    setDeliveryNotes((prev) => [newDelivery, ...prev]);
    showToast(isArabic ? 'تم إنشاء سند التسليم بنجاح' : 'Delivery Note created successfully', 'success');
    return newDelivery;
  };

  const updateDeliveryNote = (id, updatedData) => {
    setDeliveryNotes((prev) =>
      prev.map((dn) => (dn.id === id ? { ...dn, ...updatedData } : dn))
    );
    showToast(isArabic ? 'تم تحديث سند التسليم' : 'Delivery Note updated', 'success');
  };

  const deleteDeliveryNote = (id) => {
    setDeliveryNotes((prev) => prev.filter((dn) => dn.id !== id));
    showToast(isArabic ? 'تم حذف سند التسليم' : 'Delivery Note deleted', 'info');
  };

  // Deduct inventory items helper with negative stock prevention
  const deductItemsFromInventory = (items) => {
    setProducts((prevProducts) => {
      const updated = [...prevProducts];
      items.forEach((item) => {
        const prodIndex = updated.findIndex((p) => p.id === item.productId || p.sku === item.sku);
        if (prodIndex >= 0) {
          const currentStock = updated[prodIndex].stockQuantity || 0;
          const deductQty = Number(item.quantity) || 0;
          updated[prodIndex] = {
            ...updated[prodIndex],
            stockQuantity: Math.max(0, currentStock - deductQty),
          };
        }
      });
      return updated;
    });
  };

  const markAsDelivered = (deliveryId) => {
    const dn = deliveryNotes.find((d) => d.id === deliveryId);
    if (!dn) return;

    if (dn.status === 'Delivered' || dn.stockDeducted) {
      showToast(isArabic ? 'هذا السند تم تسليمه مسبقاً' : 'Delivery already marked as delivered', 'info');
      return;
    }

    // Deduct stock safely
    if (dn.items && dn.items.length > 0) {
      deductItemsFromInventory(dn.items);
    }

    setDeliveryNotes((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              status: 'Delivered',
              stockDeducted: true,
              deliveredDate: new Date().toISOString().split('T')[0],
            }
          : d
      )
    );

    showToast(
      isArabic
        ? 'تم تأكيد تسليم الشحنة وخصم الكميات من المخزون بنجاح'
        : 'Goods delivered successfully. Inventory stock updated.',
      'success'
    );
  };

  // Invoice Actions
  const addInvoice = (invoiceData) => {
    const totals = calculateTotals(invoiceData.items);
    const newInvoice = {
      ...invoiceData,
      id: generateId('inv'),
      invoiceNumber:
        invoiceData.invoiceNumber ||
        `${companySettings.invoicePrefix}${Date.now().toString().slice(-5)}`,
      ...totals,
      status: invoiceData.status || 'Issued',
      amountPaid: invoiceData.status === 'Paid' ? totals.grandTotal : (Number(invoiceData.amountPaid) || 0),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(isArabic ? 'تم إصدار الفاتورة الضريبية بنجاح' : 'Tax Invoice issued successfully', 'success');
    return newInvoice;
  };

  const updateInvoice = (id, updatedData) => {
    const totals = updatedData.items ? calculateTotals(updatedData.items) : {};
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              ...updatedData,
              ...totals,
              amountPaid:
                updatedData.status === 'Paid'
                  ? (totals.grandTotal || inv.grandTotal)
                  : (updatedData.amountPaid ?? inv.amountPaid),
            }
          : inv
      )
    );
    showToast(isArabic ? 'تم تحديث الفاتورة الضريبية' : 'Tax Invoice updated successfully', 'success');
  };

  const deleteInvoice = (id) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    showToast(isArabic ? 'تم حذف الفاتورة' : 'Invoice deleted', 'info');
  };

  const markInvoicePaid = (id, paymentMethod = 'Bank Transfer') => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: 'Paid',
              amountPaid: inv.grandTotal,
              paymentMethod: paymentMethod || inv.paymentMethod,
              paymentDate: new Date().toISOString().split('T')[0],
            }
          : inv
      )
    );
    showToast(isArabic ? 'تم تسجيل سداد الفاتورة بالكامل' : 'Invoice marked as fully paid', 'success');
  };

  // Workflows: Convert Quotation -> Delivery Note
  const convertQuotationToDeliveryNote = (quotationId) => {
    const qt = quotations.find((q) => q.id === quotationId);
    if (!qt) return null;

    const newDelivery = {
      id: generateId('dn'),
      deliveryNumber: `${companySettings.deliveryPrefix}${Date.now().toString().slice(-5)}`,
      customerId: qt.customerId,
      customerName: qt.customerName,
      quotationId: qt.id,
      quotationNumber: qt.quotationNumber,
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryAddress: qt.customerAddress || 'Client Head Office / Premises',
      status: 'Ready for Delivery',
      notes: `Converted from Quotation ${qt.quotationNumber}`,
      receivedBy: '',
      carrier: 'Direct Dispatch',
      stockDeducted: false,
      items: qt.items.map((i) => ({
        productId: i.productId,
        nameEn: i.nameEn,
        nameAr: i.nameAr || i.nameEn,
        sku: i.sku,
        quantity: i.quantity,
        unit: 'Unit',
        unitAr: 'حبة',
      })),
    };

    setDeliveryNotes((prev) => [newDelivery, ...prev]);

    // Link back to quotation
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? { ...q, convertedToDeliveryId: newDelivery.id, status: 'Accepted' }
          : q
      )
    );

    showToast(
      isArabic
        ? `تم إنشاء سند التسليم ${newDelivery.deliveryNumber} من عرض السعر`
        : `Created Delivery Note ${newDelivery.deliveryNumber} from quotation`,
      'success'
    );
    return newDelivery;
  };

  // Workflows: Convert Quotation -> Tax Invoice
  const convertQuotationToInvoice = (quotationId) => {
    const qt = quotations.find((q) => q.id === quotationId);
    if (!qt) return null;

    const totals = calculateTotals(qt.items);
    const newInvoice = {
      id: generateId('inv'),
      invoiceNumber: `${companySettings.invoicePrefix}${Date.now().toString().slice(-5)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      supplyDate: new Date().toISOString().split('T')[0],
      customerId: qt.customerId,
      customerName: qt.customerName,
      customerCompanyNameEn: qt.customerName,
      customerCompanyNameAr: qt.customerNameAr || qt.customerName,
      customerVatNumber: qt.customerVatNumber || '300000000000003',
      customerAddress: qt.customerAddress || 'Riyadh, Saudi Arabia',
      fromQuotationId: qt.id,
      fromDeliveryId: qt.convertedToDeliveryId || null,
      status: 'Issued',
      paymentMethod: 'Bank Transfer',
      notes: `Generated from accepted quotation ${qt.quotationNumber}`,
      items: [...qt.items],
      ...totals,
      amountPaid: 0,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Link back to quotation
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? { ...q, convertedToInvoiceId: newInvoice.id, status: 'Accepted' }
          : q
      )
    );

    showToast(
      isArabic
        ? `تم إنشاء الفاتورة الضريبية ${newInvoice.invoiceNumber} من عرض السعر`
        : `Generated Tax Invoice ${newInvoice.invoiceNumber} from quotation`,
      'success'
    );
    return newInvoice;
  };

  // Workflows: Convert Delivery Note -> Tax Invoice
  const convertDeliveryNoteToInvoice = (deliveryId) => {
    const dn = deliveryNotes.find((d) => d.id === deliveryId);
    if (!dn) return null;

    // Find products to get selling price
    const mappedItems = dn.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      const unitPrice = prod ? prod.sellingPrice : 100;
      const vatRate = prod ? prod.vatRate : 15;
      const lineGross = Number(item.quantity) * unitPrice;
      const vatAmount = lineGross * (vatRate / 100);
      return {
        productId: item.productId,
        nameEn: item.nameEn,
        nameAr: item.nameAr || item.nameEn,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice,
        discount: 0,
        vatRate,
        subtotal: lineGross,
        vatAmount,
        total: lineGross + vatAmount,
      };
    });

    const totals = calculateTotals(mappedItems);
    const newInvoice = {
      id: generateId('inv'),
      invoiceNumber: `${companySettings.invoicePrefix}${Date.now().toString().slice(-5)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      supplyDate: dn.deliveryDate || new Date().toISOString().split('T')[0],
      customerId: dn.customerId,
      customerName: dn.customerName,
      customerCompanyNameEn: dn.customerName,
      customerCompanyNameAr: dn.customerName,
      customerVatNumber: '300000000000003',
      customerAddress: dn.deliveryAddress,
      fromQuotationId: dn.quotationId || null,
      fromDeliveryId: dn.id,
      status: 'Issued',
      paymentMethod: 'Bank Transfer',
      notes: `Issued based on delivered consignment ${dn.deliveryNumber}`,
      items: mappedItems,
      ...totals,
      amountPaid: 0,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    showToast(
      isArabic
        ? `تم إنشاء الفاتورة الضريبية ${newInvoice.invoiceNumber} من سند التسليم`
        : `Generated Tax Invoice ${newInvoice.invoiceNumber} from Delivery Note`,
      'success'
    );
    return newInvoice;
  };

  const updateCompanySettings = (newSettings) => {
    setCompanySettings((prev) => ({ ...prev, ...newSettings }));
    showToast(isArabic ? 'تم حفظ بيانات المنشأة' : 'Settings saved successfully', 'success');
  };

  const resetAllData = () => {
    setCompanySettings(initialCompanySettings);
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setQuotations(initialQuotations);
    setDeliveryNotes(initialDeliveryNotes);
    setInvoices(initialInvoices);
    localStorage.clear();
    showToast(
      isArabic ? 'تمت استعادة كافة البيانات التجريبية الافتراضية' : 'All sample demonstration data restored',
      'info'
    );
  };

  // Stock alerts calculation
  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.minStockLevel
  );

  return (
    <AppContext.Provider
      value={{
        companySettings,
        updateCompanySettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustProductStock,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        updateQuotationStatus,
        deliveryNotes,
        addDeliveryNote,
        updateDeliveryNote,
        deleteDeliveryNote,
        markAsDelivered,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoicePaid,
        convertQuotationToDeliveryNote,
        convertQuotationToInvoice,
        convertDeliveryNoteToInvoice,
        resetAllData,
        lowStockProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
