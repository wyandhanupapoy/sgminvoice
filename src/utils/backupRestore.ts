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

export interface RestoreProgress {
  message: string;
  percentage: number;
}

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
  },
  onProgress?: (progress: RestoreProgress) => void
): Promise<{ success: boolean; message: string; stats: { items: number; customers: number; suppliers: number; sales: number; purchases: number } }> => {
  const stats = { items: 0, customers: 0, suppliers: 0, sales: 0, purchases: 0 };
  
  try {
    // Validate backup data structure before processing
    const validation = validateBackupData(data);
    if (!validation.valid) {
      return { success: false, message: `Invalid backup file: ${validation.error}`, stats };
    }

    // Version compatibility check
    if (data.version !== '1.0') {
      return { success: false, message: `Unsupported backup version: ${data.version}. Expected version 1.0`, stats };
    }

    const totalSteps = (options.restoreItems ? 1 : 0) + 
                      (options.restoreCustomers ? 1 : 0) + 
                      (options.restoreSuppliers ? 1 : 0) + 
                      (options.restoreSales ? (data.sales?.length || 0) / 100 + 1 : 0) + 
                      (options.restorePurchases ? (data.purchases?.length || 0) / 100 + 1 : 0);
    
    let currentStepProgress = 0;
    const updateProgress = (message: string) => {
      currentStepProgress++;
      if (onProgress) {
        onProgress({
          message,
          percentage: Math.min(Math.round((currentStepProgress / totalSteps) * 100), 99),
        });
      }
    };

    updateProgress('Membersihkan data lama...');

    // Clear existing data (Cascading Deletes are much faster)
    if (options.clearExisting) {
      if (options.restoreSales) await supabase.from('sales').delete().eq('user_id', userId);
      if (options.restorePurchases) await supabase.from('purchases').delete().eq('user_id', userId);
      if (options.restoreItems) await supabase.from('items').delete().eq('user_id', userId);
      if (options.restoreCustomers) await supabase.from('customers').delete().eq('user_id', userId);
      if (options.restoreSuppliers) await supabase.from('suppliers').delete().eq('user_id', userId);
    }

    // 1. Restore items (Batch)
    if (options.restoreItems && data.items && data.items.length > 0) {
      updateProgress(`Merestore ${data.items.length} barang...`);
      const items = data.items.map(({ id, created_at, updated_at, ...item }) => ({
        ...item,
        user_id: userId,
      }));
      
      const BATCH_SIZE = 200;
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('items').insert(batch);
        if (error) throw error;
        stats.items += batch.length;
      }
    }

    // 2. Restore customers (Batch)
    if (options.restoreCustomers && data.customers && data.customers.length > 0) {
      updateProgress(`Merestore ${data.customers.length} pelanggan...`);
      const customers = data.customers.map(({ id, created_at, updated_at, ...customer }) => ({
        ...customer,
        user_id: userId,
      }));

      const BATCH_SIZE = 100;
      for (let i = 0; i < customers.length; i += BATCH_SIZE) {
        const batch = customers.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('customers').insert(batch);
        if (error) throw error;
        stats.customers += batch.length;
      }
    }

    // 3. Restore suppliers (Batch)
    if (options.restoreSuppliers && data.suppliers && data.suppliers.length > 0) {
      updateProgress(`Merestore ${data.suppliers.length} supplier...`);
      const suppliers = data.suppliers.map(({ id, created_at, updated_at, ...supplier }) => ({
        ...supplier,
        user_id: userId,
      }));

      const BATCH_SIZE = 100;
      for (let i = 0; i < suppliers.length; i += BATCH_SIZE) {
        const batch = suppliers.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('suppliers').insert(batch);
        if (error) throw error;
        stats.suppliers += batch.length;
      }
    }

    // 4. Restore sales (Chunked Cycle)
    if (options.restoreSales && data.sales && data.sales.length > 0) {
      const CHUNK_SIZE = 100;
      for (let i = 0; i < data.sales.length; i += CHUNK_SIZE) {
        const chunk = data.sales.slice(i, i + CHUNK_SIZE);
        updateProgress(`Merestore Penjualan: ${i} sampai ${Math.min(i + CHUNK_SIZE, data.sales.length)}...`);

        const salesToInsert = chunk.map(({ created_at, updated_at, ...sale }) => ({
          ...sale,
          items: undefined, // Items are inserted separately
          user_id: userId,
        }));

        const itemsToInsert = chunk.flatMap(sale => 
          (sale.items || []).map(item => ({
            ...item,
            sales_id: sale.id, // Use the original sale ID for linking
          }))
        );

        // Insert this chunk of sales
        const { error: sError } = await supabase.from('sales').insert(salesToInsert);
        if (sError) throw sError;
        stats.sales += salesToInsert.length;

        // Insert this chunk's items
        if (itemsToInsert.length > 0) {
          const { error: iError } = await supabase.from('sales_items').insert(itemsToInsert);
          if (iError) throw iError;
        }
      }
    }

    // 5. Restore purchases (Chunked Cycle)
    if (options.restorePurchases && data.purchases && data.purchases.length > 0) {
      const CHUNK_SIZE = 100;
      for (let i = 0; i < data.purchases.length; i += CHUNK_SIZE) {
        const chunk = data.purchases.slice(i, i + CHUNK_SIZE);
        updateProgress(`Merestore Pembelian: ${i} sampai ${Math.min(i + CHUNK_SIZE, data.purchases.length)}...`);

        const purchasesToInsert = chunk.map(({ created_at, updated_at, ...purchase }) => ({
          ...purchase,
          items: undefined,
          user_id: userId,
        }));

        const itemsToInsert = chunk.flatMap(purchase => 
          (purchase.items || []).map(item => ({
            ...item,
            purchase_id: purchase.id, // Use the original purchase ID for linking
          }))
        );

        // Insert this chunk of purchases
        const { error: pError } = await supabase.from('purchases').insert(purchasesToInsert);
        if (pError) throw pError;
        stats.purchases += purchasesToInsert.length;

        // Insert this chunk's items
        if (itemsToInsert.length > 0) {
          const { error: iError } = await supabase.from('purchase_items').insert(itemsToInsert);
          if (iError) throw iError;
        }
      }
    }

    if (onProgress) onProgress({ message: 'Selesai!', percentage: 100 });

    return {
      success: true,
      message: `Berhasil restore data lengkap`,
      stats,
    };
  } catch (error: unknown) {
    console.error('Restore error:', error);
    const message = error instanceof Error ? error.message : 'Gagal melakukan restore data';
    return {
      success: false,
      message,
      stats,
    };
  }
};
