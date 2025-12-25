// Transaction Types for Sales and Purchases

export interface TransactionItem {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface CustomerInfo {
  id?: string;
  name: string;
  address: string;
  phone: string;
  npwp: string;
}

export interface SupplierInfo {
  id?: string;
  name: string;
  address: string;
  phone: string;
}

export interface TransactionInfo {
  transactionNumber: string;
  date: Date | null;
  dueDate: Date | null;
  paymentMethod: 'transfer' | 'cash';
  vehicleNumber: string;
  reference: string;
}

export interface CostSummary {
  subtotal: number;
  discount: number;
  shippingCost: number;
  downPayment: number;
  vatAmount: number;
  grandTotal: number;
}

export interface SalesFormData {
  applyVat: boolean;
  vatExempt: boolean;
  customer: CustomerInfo;
  transaction: TransactionInfo;
  items: TransactionItem[];
  summary: CostSummary;
  notes: string;
}

export interface PurchaseFormData {
  applyVat: boolean;
  supplier: SupplierInfo;
  transaction: TransactionInfo;
  items: TransactionItem[];
  summary: CostSummary;
  notes: string;
}

export type TransactionType = 'sales' | 'purchase';
