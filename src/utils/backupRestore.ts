import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Validation schemas
const uuidSchema = z.string().uuid();

const itemSchema = z.object({
  item_code: z.string().min(1).max(100),
  item_name: z.string().min(1).max(255),
  unit: z.string().max(50).nullable().optional(),
  unit_price: z.number().min(0).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
}).passthrough();

const customerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  npwp: z.string().max(50).nullable().optional(),
}).passthrough();

const supplierSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
}).passthrough();

const saleSchema = z.object({
  transaction_number: z.string().min(1).max(100),
  customer_name: z.string().min(1).max(255),
}).passthrough();

const purchaseSchema = z.object({
  transaction_number: z.string().min(1).max(100),
  supplier_name: z.string().min(1).max(255),
}).passthrough();

const salesItemSchema = z.object({
  sales_id: uuidSchema,
  item_code: z.string().min(1).max(100),
  item_name: z.string().min(1).max(255),
  quantity: z.number().min(0),
  unit_price: z.number().min(0),
  unit: z.string().max(50),
  total: z.number().min(0),
}).passthrough();

const purchaseItemSchema = z.object({
  purchase_id: uuidSchema,
  item_code: z.string().min(1).max(100),
  item_name: z.string().min(1).max(255),
  quantity: z.number().min(0),
  unit_price: z.number().min(0),
  unit: z.string().max(50),
  total: z.number().min(0),
}).passthrough();

const MAX_ITEMS_PER_CATEGORY = 10000;

const backupDataSchema = z.object({
  version: z.string().min(1).max(10),
  exportedAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)),
  items: z.array(itemSchema).max(MAX_ITEMS_PER_CATEGORY),
  customers: z.array(customerSchema).max(MAX_ITEMS_PER_CATEGORY),
  suppliers: z.array(supplierSchema).max(MAX_ITEMS_PER_CATEGORY),
  sales: z.array(saleSchema).max(MAX_ITEMS_PER_CATEGORY),
  salesItems: z.array(salesItemSchema).max(MAX_ITEMS_PER_CATEGORY),
  purchases: z.array(purchaseSchema).max(MAX_ITEMS_PER_CATEGORY),
  purchaseItems: z.array(purchaseItemSchema).max(MAX_ITEMS_PER_CATEGORY),
});

export interface BackupData {
  version: string;
  exportedAt: string;
  items: any[];
  customers: any[];
  suppliers: any[];
  sales: any[];
  salesItems: any[];
  purchases: any[];
  purchaseItems: any[];
}

export const validateBackupData = (data: unknown): { valid: boolean; error?: string; data?: BackupData } => {
  try {
    const validatedData = backupDataSchema.parse(data);
    return { valid: true, data: validatedData as BackupData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        valid: false, 
        error: `Validation error at ${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { valid: false, error: 'Invalid backup file format' };
  }
};

export const exportAllData = async (userId: string): Promise<BackupData> => {
  // Fetch all data
  const [itemsRes, customersRes, suppliersRes, salesRes, salesItemsRes, purchasesRes, purchaseItemsRes] = await Promise.all([
    supabase.from('items').select('*').eq('user_id', userId),
    supabase.from('customers').select('*').eq('user_id', userId),
    supabase.from('suppliers').select('*').eq('user_id', userId),
    supabase.from('sales').select('*').eq('user_id', userId),
    supabase.from('sales_items').select('*, sales!inner(user_id)').eq('sales.user_id', userId),
    supabase.from('purchases').select('*').eq('user_id', userId),
    supabase.from('purchase_items').select('*, purchases!inner(user_id)').eq('purchases.user_id', userId),
  ]);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    items: itemsRes.data || [],
    customers: customersRes.data || [],
    suppliers: suppliersRes.data || [],
    sales: salesRes.data || [],
    salesItems: (salesItemsRes.data || []).map(({ sales, ...item }) => item),
    purchases: purchasesRes.data || [],
    purchaseItems: (purchaseItemsRes.data || []).map(({ purchases, ...item }) => item),
  };
};

export const downloadBackup = (data: BackupData) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const restoreData = async (
  userId: string,
  data: BackupData,
  options: {
    restoreItems: boolean;
    restoreCustomers: boolean;
    restoreSuppliers: boolean;
    restoreSales: boolean;
    restorePurchases: boolean;
    clearExisting: boolean;
  }
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate backup data structure before processing
    const validation = validateBackupData(data);
    if (!validation.valid) {
      return { success: false, message: `Invalid backup file: ${validation.error}` };
    }

    // Version compatibility check
    if (data.version !== '1.0') {
      return { success: false, message: `Unsupported backup version: ${data.version}. Expected version 1.0` };
    }

    // Clear existing data if requested
    if (options.clearExisting) {
      if (options.restoreSales) {
        // Delete sales items first (foreign key constraint)
        const { data: salesData } = await supabase.from('sales').select('id').eq('user_id', userId);
        if (salesData && salesData.length > 0) {
          const salesIds = salesData.map(s => s.id);
          await supabase.from('sales_items').delete().in('sales_id', salesIds);
          await supabase.from('sales').delete().eq('user_id', userId);
        }
      }
      if (options.restorePurchases) {
        const { data: purchasesData } = await supabase.from('purchases').select('id').eq('user_id', userId);
        if (purchasesData && purchasesData.length > 0) {
          const purchaseIds = purchasesData.map(p => p.id);
          await supabase.from('purchase_items').delete().in('purchase_id', purchaseIds);
          await supabase.from('purchases').delete().eq('user_id', userId);
        }
      }
      if (options.restoreItems) {
        await supabase.from('items').delete().eq('user_id', userId);
      }
      if (options.restoreCustomers) {
        await supabase.from('customers').delete().eq('user_id', userId);
      }
      if (options.restoreSuppliers) {
        await supabase.from('suppliers').delete().eq('user_id', userId);
      }
    }

    // Create ID mappings for relationships
    const salesIdMap: Record<string, string> = {};
    const purchasesIdMap: Record<string, string> = {};

    // Restore items
    if (options.restoreItems && data.items.length > 0) {
      const items = data.items.map(({ id, created_at, updated_at, ...item }) => ({
        ...item,
        user_id: userId,
      }));
      const { error } = await supabase.from('items').insert(items);
      if (error) throw error;
    }

    // Restore customers
    if (options.restoreCustomers && data.customers.length > 0) {
      const customers = data.customers.map(({ id, created_at, updated_at, ...customer }) => ({
        ...customer,
        user_id: userId,
      }));
      const { error } = await supabase.from('customers').insert(customers);
      if (error) throw error;
    }

    // Restore suppliers
    if (options.restoreSuppliers && data.suppliers.length > 0) {
      const suppliers = data.suppliers.map(({ id, created_at, updated_at, ...supplier }) => ({
        ...supplier,
        user_id: userId,
      }));
      const { error } = await supabase.from('suppliers').insert(suppliers);
      if (error) throw error;
    }

    // Restore sales with new IDs
    if (options.restoreSales && data.sales.length > 0) {
      for (const sale of data.sales) {
        const { id: oldId, created_at, updated_at, ...saleData } = sale;
        const { data: newSale, error } = await supabase
          .from('sales')
          .insert({ ...saleData, user_id: userId })
          .select()
          .single();
        if (error) throw error;
        if (newSale) salesIdMap[oldId] = newSale.id;
      }

      // Restore sales items with updated sales_id
      if (data.salesItems.length > 0) {
        const salesItems = data.salesItems
          .filter(item => salesIdMap[item.sales_id])
          .map(({ id, created_at, ...item }) => ({
            ...item,
            sales_id: salesIdMap[item.sales_id],
          }));
        if (salesItems.length > 0) {
          const { error } = await supabase.from('sales_items').insert(salesItems);
          if (error) throw error;
        }
      }
    }

    // Restore purchases with new IDs
    if (options.restorePurchases && data.purchases.length > 0) {
      for (const purchase of data.purchases) {
        const { id: oldId, created_at, updated_at, ...purchaseData } = purchase;
        const { data: newPurchase, error } = await supabase
          .from('purchases')
          .insert({ ...purchaseData, user_id: userId })
          .select()
          .single();
        if (error) throw error;
        if (newPurchase) purchasesIdMap[oldId] = newPurchase.id;
      }

      // Restore purchase items with updated purchase_id
      if (data.purchaseItems.length > 0) {
        const purchaseItems = data.purchaseItems
          .filter(item => purchasesIdMap[item.purchase_id])
          .map(({ id, created_at, ...item }) => ({
            ...item,
            purchase_id: purchasesIdMap[item.purchase_id],
          }));
        if (purchaseItems.length > 0) {
          const { error } = await supabase.from('purchase_items').insert(purchaseItems);
          if (error) throw error;
        }
      }
    }

    return { success: true, message: 'Data berhasil direstore' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal melakukan restore' };
  }
};
