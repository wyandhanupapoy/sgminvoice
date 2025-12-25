import { useState, useCallback } from 'react';
import { SalesFormData, TransactionItem, CostSummary } from '@/types/transaction';
import { generateTransactionNumber } from '@/utils/formatters';

const VAT_RATE = 0.11;

const initialSummary: CostSummary = {
  subtotal: 0,
  discount: 0,
  shippingCost: 0,
  downPayment: 0,
  vatAmount: 0,
  grandTotal: 0,
};

const initialFormData: SalesFormData = {
  applyVat: false,
  vatExempt: false,
  customer: {
    name: '',
    address: '',
    phone: '',
    npwp: '',
  },
  transaction: {
    transactionNumber: generateTransactionNumber('sales'),
    date: new Date(),
    dueDate: null,
    paymentMethod: 'transfer',
    vehicleNumber: '',
    reference: '',
  },
  items: [],
  summary: initialSummary,
  notes: '',
};

export const useSalesForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SalesFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateSummary = useCallback((
    items: TransactionItem[],
    discount: number,
    shippingCost: number,
    downPayment: number,
    applyVat: boolean
  ): CostSummary => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const afterDiscount = subtotal - discount;
    const withShipping = afterDiscount + shippingCost;
    const vatAmount = applyVat ? withShipping * VAT_RATE : 0;
    const grandTotal = withShipping + vatAmount - downPayment;

    return {
      subtotal,
      discount,
      shippingCost,
      downPayment,
      vatAmount,
      grandTotal: Math.max(0, grandTotal),
    };
  }, []);

  const updateFormData = useCallback((
    section: 'customer' | 'transaction',
    data: Partial<SalesFormData['customer']> | Partial<SalesFormData['transaction']>
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  }, []);

  const setApplyVat = useCallback((value: boolean) => {
    setFormData(prev => {
      const newSummary = calculateSummary(
        prev.items,
        prev.summary.discount,
        prev.summary.shippingCost,
        prev.summary.downPayment,
        value
      );
      return {
        ...prev,
        applyVat: value,
        vatExempt: value ? false : prev.vatExempt,
        summary: newSummary,
      };
    });
  }, [calculateSummary]);

  const setVatExempt = useCallback((value: boolean) => {
    setFormData(prev => ({
      ...prev,
      vatExempt: value,
      applyVat: value ? false : prev.applyVat,
    }));
  }, []);

  const addItem = useCallback((item: Omit<TransactionItem, 'id' | 'total'>) => {
    const newItem: TransactionItem = {
      ...item,
      id: crypto.randomUUID(),
      total: item.quantity * item.unitPrice,
    };

    setFormData(prev => {
      const newItems = [...prev.items, newItem];
      const newSummary = calculateSummary(
        newItems,
        prev.summary.discount,
        prev.summary.shippingCost,
        prev.summary.downPayment,
        prev.applyVat
      );
      return {
        ...prev,
        items: newItems,
        summary: newSummary,
      };
    });
  }, [calculateSummary]);

  const removeItem = useCallback((id: string) => {
    setFormData(prev => {
      const newItems = prev.items.filter(item => item.id !== id);
      const newSummary = calculateSummary(
        newItems,
        prev.summary.discount,
        prev.summary.shippingCost,
        prev.summary.downPayment,
        prev.applyVat
      );
      return {
        ...prev,
        items: newItems,
        summary: newSummary,
      };
    });
  }, [calculateSummary]);

  const updateSummary = useCallback((field: keyof CostSummary, value: number) => {
    setFormData(prev => {
      const newSummaryPartial = { ...prev.summary, [field]: value };
      const newSummary = calculateSummary(
        prev.items,
        field === 'discount' ? value : prev.summary.discount,
        field === 'shippingCost' ? value : prev.summary.shippingCost,
        field === 'downPayment' ? value : prev.summary.downPayment,
        prev.applyVat
      );
      return {
        ...prev,
        summary: newSummary,
      };
    });
  }, [calculateSummary]);

  const validateStep1 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer.name.trim()) {
      newErrors.customerName = 'Nama pelanggan wajib diisi';
    }
    if (!formData.customer.address.trim()) {
      newErrors.customerAddress = 'Alamat pelanggan wajib diisi';
    }
    if (!formData.transaction.date) {
      newErrors.date = 'Tanggal transaksi wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.customer, formData.transaction.date]);

  const validateStep2 = useCallback((): boolean => {
    if (formData.items.length === 0) {
      setErrors({ items: 'Minimal satu item harus ditambahkan' });
      return false;
    }
    setErrors({});
    return true;
  }, [formData.items]);

  const nextStep = useCallback(() => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  }, [currentStep, validateStep1, validateStep2]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      ...initialFormData,
      transaction: {
        ...initialFormData.transaction,
        transactionNumber: generateTransactionNumber('sales'),
      },
    });
    setCurrentStep(1);
    setErrors({});
  }, []);

  const setNotes = useCallback((notes: string) => {
    setFormData(prev => ({ ...prev, notes }));
  }, []);

  return {
    currentStep,
    formData,
    errors,
    setCurrentStep,
    updateFormData,
    setApplyVat,
    setVatExempt,
    addItem,
    removeItem,
    updateSummary,
    setNotes,
    nextStep,
    prevStep,
    resetForm,
  };
};
