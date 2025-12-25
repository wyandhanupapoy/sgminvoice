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
  }
): Promise<{ success: boolean; message: string; stats: { items: number; customers: number; suppliers: number; sales: number; purchases: number } }> => {
  const stats = { items: 0, customers: 0, suppliers: 0, sales: 0, purchases: 0 };
  
  try {
    const analysis = analyzeLegacyBackup(data);

    // Clear existing data if requested
    if (options.clearExisting) {
      if (options.restoreSales) {
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

    // Restore items
    if (options.restoreItems && data.barang && data.barang.length > 0) {
      const items = data.barang.map((item) => ({
        item_code: item.code,
        item_name: item.name,
        unit: item.unit || 'Pcs',
        unit_price: item.price || 0,
        user_id: userId,
      }));
      
      // Insert in batches of 100
      for (let i = 0; i < items.length; i += 100) {
        const batch = items.slice(i, i + 100);
        const { error } = await supabase.from('items').insert(batch);
        if (error) throw error;
        stats.items += batch.length;
      }
    }

    // Create customer name to ID mapping
    const customerIdMap: Record<string, string> = {};
    
    // Restore customers
    if (options.restoreCustomers && analysis.customersCount > 0) {
      for (const [name, detail] of analysis.customers.entries()) {
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({
            name,
            address: detail.address || null,
            phone: detail.phone || null,
            npwp: detail.npwp || null,
            user_id: userId,
          })
          .select()
          .single();
        
        if (error) throw error;
        if (newCustomer) {
          customerIdMap[name] = newCustomer.id;
          stats.customers++;
        }
      }
    }

    // Create supplier name to ID mapping
    const supplierIdMap: Record<string, string> = {};

    // Restore suppliers
    if (options.restoreSuppliers && analysis.suppliersCount > 0) {
      for (const [name, detail] of analysis.suppliers.entries()) {
        const { data: newSupplier, error } = await supabase
          .from('suppliers')
          .insert({
            name,
            address: detail.address || null,
            phone: detail.phone || null,
            user_id: userId,
          })
          .select()
          .single();
        
        if (error) throw error;
        if (newSupplier) {
          supplierIdMap[name] = newSupplier.id;
          stats.suppliers++;
        }
      }
    }

    // Restore sales
    if (options.restoreSales && data.penjualan && data.penjualan.length > 0) {
      for (const sale of data.penjualan) {
        const paymentMethod = mapPaymentMethod(sale.metodePembayaran);
        const status = parseStatus(sale.metodePembayaran, sale.dp, sale.grandTotal);
        
        // Calculate VAT
        const hasVat = sale.ppn > 0;
        const vatAmount = hasVat ? sale.ppn : 0;
        
        const { data: newSale, error } = await supabase
          .from('sales')
          .insert({
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
            apply_vat: hasVat,
            vat_amount: vatAmount,
            vat_exempt: sale.isPpnDibebaskan,
            grand_total: sale.grandTotal,
            vehicle_number: sale.noKendaraan || null,
            payment_method: paymentMethod,
            notes: sale.notes || null,
            reference: sale.ref || null,
            status,
            user_id: userId,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Insert sales items
        if (newSale && sale.items && sale.items.length > 0) {
          const salesItems = sale.items.map((item) => ({
            sales_id: newSale.id,
            item_code: item.code,
            item_name: item.name,
            quantity: item.qty,
            unit: item.unit,
            unit_price: item.price,
            total: item.total,
          }));
          
          const { error: itemsError } = await supabase.from('sales_items').insert(salesItems);
          if (itemsError) throw itemsError;
        }
        
        stats.sales++;
      }
    }

    // Restore purchases
    if (options.restorePurchases && data.pembelian && data.pembelian.length > 0) {
      for (const purchase of data.pembelian) {
        const paymentMethod = mapPaymentMethod(purchase.metodePembayaran);
        const status = parseStatus(purchase.metodePembayaran, purchase.dp, purchase.grandTotal);
        
        // Calculate VAT
        const hasVat = purchase.ppn > 0;
        const vatAmount = hasVat ? purchase.ppn : 0;
        
        const { data: newPurchase, error } = await supabase
          .from('purchases')
          .insert({
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
            apply_vat: hasVat,
            vat_amount: vatAmount,
            grand_total: purchase.grandTotal,
            vehicle_number: purchase.noKendaraan || null,
            payment_method: paymentMethod,
            notes: purchase.notes || null,
            status,
            user_id: userId,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Insert purchase items
        if (newPurchase && purchase.items && purchase.items.length > 0) {
          const purchaseItems = purchase.items.map((item) => ({
            purchase_id: newPurchase.id,
            item_code: item.code,
            item_name: item.name,
            quantity: item.qty,
            unit: item.unit,
            unit_price: item.price,
            total: item.total,
          }));
          
          const { error: itemsError } = await supabase.from('purchase_items').insert(purchaseItems);
          if (itemsError) throw itemsError;
        }
        
        stats.purchases++;
      }
    }

    return {
      success: true,
      message: `Berhasil restore: ${stats.items} barang, ${stats.customers} pelanggan, ${stats.suppliers} supplier, ${stats.sales} penjualan, ${stats.purchases} pembelian`,
      stats,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal melakukan restore';
    return {
      success: false,
      message,
      stats,
    };
  }
};
