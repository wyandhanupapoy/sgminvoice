import { supabase } from '@/integrations/supabase/client';

// Types for legacy backup format
export interface LegacyBackupItem {
  id: number;
  code: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface LegacySale {
  id: string;
  tanggal: string;
  notes: string;
  items: LegacyBackupItem[];
  subtotal: number;
  dpp: number;
  ppn: number;
  discount: number;
  shippingCost: number;
  dp: number;
  grandTotal: number;
  customer: string;
  alamat: string;
  telepon: string;
  npwp: string;
  isPpnDibebaskan: boolean;
  noKendaraan: string;
  metodePembayaran: string;
  transType: string;
  ref: string;
}

export interface LegacyPurchase {
  id: string;
  tanggal: string;
  notes: string;
  items: LegacyBackupItem[];
  subtotal: number;
  dpp: number;
  ppn: number;
  discount: number;
  shippingCost: number;
  dp: number;
  grandTotal: number;
  pemasok: string;
  alamat: string;
  telepon: string;
  npwp: string;
  noKendaraan: string;
  metodePembayaran: string;
  transType: string;
}

export interface LegacyItem {
  code: string;
  name: string;
  unit: string;
  price: number;
}

export interface LegacyPartyDetail {
  address?: string;
  alamat?: string;
  phone?: string;
  npwp?: string;
}

export interface LegacyBackupData {
  penjualan?: LegacySale[];
  pembelian?: LegacyPurchase[];
  barang?: LegacyItem[];
  companyData?: {
    namaPerusahaan?: string;
    alamatPerusahaan?: string;
    kontak?: string;
    rekening?: string;
    rekeningPpn?: string;
    tagline?: string;
    logoUrl?: string;
  };
  partyDetails?: {
    customer?: Record<string, LegacyPartyDetail>;
    supplier?: Record<string, LegacyPartyDetail>;
  };
}

export const isLegacyBackup = (data: unknown): data is LegacyBackupData => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  // Legacy backup has penjualan/pembelian/barang instead of version/exportedAt
  return (
    ('penjualan' in obj || 'pembelian' in obj || 'barang' in obj) &&
    !('version' in obj)
  );
};

export const analyzeLegacyBackup = (data: LegacyBackupData) => {
  // Extract unique customers from sales and partyDetails
  const customersFromSales = new Map<string, { address: string; phone: string; npwp: string }>();
  
  if (data.penjualan) {
    data.penjualan.forEach((sale) => {
      if (sale.customer && !customersFromSales.has(sale.customer)) {
        customersFromSales.set(sale.customer, {
          address: sale.alamat || '',
          phone: sale.telepon || '',
          npwp: sale.npwp || '',
        });
      }
    });
  }

  // Merge with partyDetails if exists
  if (data.partyDetails?.customer) {
    Object.entries(data.partyDetails.customer).forEach(([name, detail]) => {
      if (!customersFromSales.has(name)) {
        customersFromSales.set(name, {
          address: detail.address || detail.alamat || '',
          phone: detail.phone || '',
          npwp: detail.npwp || '',
        });
      } else {
        // Update with more complete data
        const existing = customersFromSales.get(name)!;
        customersFromSales.set(name, {
          address: detail.address || detail.alamat || existing.address,
          phone: detail.phone || existing.phone,
          npwp: detail.npwp || existing.npwp,
        });
      }
    });
  }

  // Extract unique suppliers from purchases and partyDetails
  const suppliersFromPurchases = new Map<string, { address: string; phone: string }>();
  
  if (data.pembelian) {
    data.pembelian.forEach((purchase) => {
      if (purchase.pemasok && !suppliersFromPurchases.has(purchase.pemasok)) {
        suppliersFromPurchases.set(purchase.pemasok, {
          address: purchase.alamat || '',
          phone: purchase.telepon || '',
        });
      }
    });
  }

  // Merge with partyDetails suppliers
  if (data.partyDetails?.supplier) {
    Object.entries(data.partyDetails.supplier).forEach(([name, detail]) => {
      if (!suppliersFromPurchases.has(name)) {
        suppliersFromPurchases.set(name, {
          address: detail.address || detail.alamat || '',
          phone: detail.phone || '',
        });
      }
    });
  }

  return {
    salesCount: data.penjualan?.length || 0,
    purchasesCount: data.pembelian?.length || 0,
    itemsCount: data.barang?.length || 0,
    customersCount: customersFromSales.size,
    suppliersCount: suppliersFromPurchases.size,
    customers: customersFromSales,
    suppliers: suppliersFromPurchases,
  };
};

const mapPaymentMethod = (method: string): string => {
  const methodLower = method.toLowerCase();
  if (methodLower.includes('tunai') || methodLower.includes('cash')) {
    return 'cash';
  }
  if (methodLower.includes('kredit') || methodLower.includes('credit')) {
    return 'credit';
  }
  return 'transfer';
};

const parseStatus = (paymentMethod: string, dp: number, grandTotal: number): string => {
  if (paymentMethod.toLowerCase().includes('kredit')) {
    return 'pending';
  }
  if (dp > 0 && dp < grandTotal) {
    return 'partial';
  }
  return 'paid';
};

export interface RestoreProgress {
  message: string;
  percentage: number;
}

export const restoreLegacyData = async (
  userId: string,
  data: LegacyBackupData,
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
    const analysis = analyzeLegacyBackup(data);
    const totalSteps = (options.restoreItems ? 1 : 0) + 
                      (options.restoreCustomers ? 1 : 0) + 
                      (options.restoreSuppliers ? 1 : 0) + 
                      (options.restoreSales ? (data.penjualan?.length || 0) / 50 + 1 : 0) + 
                      (options.restorePurchases ? (data.pembelian?.length || 0) / 50 + 1 : 0);
    
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
    if (options.restoreItems && data.barang && data.barang.length > 0) {
      updateProgress(`Merestore ${data.barang.length} barang...`);
      const items = data.barang.map((item) => ({
        item_code: item.code,
        item_name: item.name,
        unit: item.unit || 'Pcs',
        unit_price: item.price || 0,
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
    const customerIdMap: Record<string, string> = {};
    if (options.restoreCustomers && analysis.customersCount > 0) {
      updateProgress(`Merestore ${analysis.customersCount} pelanggan...`);
      const customersToInsert = Array.from(analysis.customers.entries()).map(([name, detail]) => {
        const id = crypto.randomUUID();
        customerIdMap[name] = id;
        return {
          id,
          name,
          address: detail.address || null,
          phone: detail.phone || null,
          npwp: detail.npwp || null,
          user_id: userId,
        };
      });

      const BATCH_SIZE = 100;
      for (let i = 0; i < customersToInsert.length; i += BATCH_SIZE) {
        const batch = customersToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('customers').insert(batch);
        if (error) throw error;
        stats.customers += batch.length;
      }
    }

    // 3. Restore suppliers (Batch)
    const supplierIdMap: Record<string, string> = {};
    if (options.restoreSuppliers && analysis.suppliersCount > 0) {
      updateProgress(`Merestore ${analysis.suppliersCount} supplier...`);
      const suppliersToInsert = Array.from(analysis.suppliers.entries()).map(([name, detail]) => {
        const id = crypto.randomUUID();
        supplierIdMap[name] = id;
        return {
          id,
          name,
          address: detail.address || null,
          phone: detail.phone || null,
          user_id: userId,
        };
      });

      const BATCH_SIZE = 100;
      for (let i = 0; i < suppliersToInsert.length; i += BATCH_SIZE) {
        const batch = suppliersToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('suppliers').insert(batch);
        if (error) throw error;
        stats.suppliers += batch.length;
      }
    }

    // 4. Restore sales (Chunked Cycle to prevent memory overhead)
    if (options.restoreSales && data.penjualan && data.penjualan.length > 0) {
      const CHUNK_SIZE = 50;
      for (let i = 0; i < data.penjualan.length; i += CHUNK_SIZE) {
        const chunk = data.penjualan.slice(i, i + CHUNK_SIZE);
        updateProgress(`Merestore Penjualan: ${i} sampai ${Math.min(i + CHUNK_SIZE, data.penjualan.length)}...`);

        const salesToInsert = [];
        const itemsToInsert = [];

        for (const sale of chunk) {
          const saleId = crypto.randomUUID();
          salesToInsert.push({
            id: saleId,
            transaction_number: sale.id,
            transaction_date: sale.tanggal,
            customer_id: customerIdMap[sale.customer] || null,
            customer_name: sale.customer,
            customer_address: sale.alamat || null,
            customer_phone: sale.telepon || null,
            customer_npwp: sale.npwp || null,
            subtotal: sale.subtotal,
            discount: sale.discount,
            shipping_cost: sale.shippingCost,
            down_payment: sale.dp,
            apply_vat: sale.ppn > 0,
            vat_amount: sale.ppn || 0,
            vat_exempt: sale.isPpnDibebaskan,
            grand_total: sale.grandTotal,
            vehicle_number: sale.noKendaraan || null,
            payment_method: mapPaymentMethod(sale.metodePembayaran),
            notes: sale.notes || null,
            reference: sale.ref || null,
            status: parseStatus(sale.metodePembayaran, sale.dp, sale.grandTotal),
            user_id: userId,
          });

          if (sale.items) {
            for (const item of sale.items) {
              itemsToInsert.push({
                sales_id: saleId,
                item_code: item.code,
                item_name: item.name,
                quantity: item.qty,
                unit: item.unit,
                unit_price: item.price,
                total: item.total,
              });
            }
          }
        }

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
    if (options.restorePurchases && data.pembelian && data.pembelian.length > 0) {
      const CHUNK_SIZE = 50;
      for (let i = 0; i < data.pembelian.length; i += CHUNK_SIZE) {
        const chunk = data.pembelian.slice(i, i + CHUNK_SIZE);
        updateProgress(`Merestore Pembelian: ${i} sampai ${Math.min(i + CHUNK_SIZE, data.pembelian.length)}...`);

        const purchasesToInsert = [];
        const itemsToInsert = [];

        for (const purchase of chunk) {
          const purchaseId = crypto.randomUUID();
          purchasesToInsert.push({
            id: purchaseId,
            transaction_number: purchase.id,
            transaction_date: purchase.tanggal,
            supplier_id: supplierIdMap[purchase.pemasok] || null,
            supplier_name: purchase.pemasok,
            supplier_address: purchase.alamat || null,
            supplier_phone: purchase.telepon || null,
            subtotal: purchase.subtotal,
            discount: purchase.discount,
            shipping_cost: purchase.shippingCost,
            down_payment: purchase.dp,
            apply_vat: purchase.ppn > 0,
            vat_amount: purchase.ppn || 0,
            grand_total: purchase.grandTotal,
            vehicle_number: purchase.noKendaraan || null,
            payment_method: mapPaymentMethod(purchase.metodePembayaran),
            notes: purchase.notes || null,
            status: parseStatus(purchase.metodePembayaran, purchase.dp, purchase.grandTotal),
            user_id: userId,
          });

          if (purchase.items) {
            for (const item of purchase.items) {
              itemsToInsert.push({
                purchase_id: purchaseId,
                item_code: item.code,
                item_name: item.name,
                quantity: item.qty,
                unit: item.unit,
                unit_price: item.price,
                total: item.total,
              });
            }
          }
        }

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
      message: `Berhasil restore: ${stats.items} barang, ${stats.customers} pelanggan, ${stats.suppliers} supplier, ${stats.sales} penjualan, ${stats.purchases} pembelian`,
      stats,
    };
  } catch (error: unknown) {
    console.error('Restore error:', error);
    const message = error instanceof Error ? error.message : 'Gagal melakukan restore';
    return {
      success: false,
      message,
      stats,
    };
  }
};
