import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface InvoiceDetail {
  id: string;
  type: 'sales' | 'purchase';
  transaction_number: string;
  transaction_date: string;
  payment_method: string;
  vehicle_number: string | null;
  reference: string | null;
  apply_vat: boolean;
  vat_exempt?: boolean;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  down_payment: number;
  vat_amount: number;
  grand_total: number;
  notes: string | null;
  status: string;
  created_at: string;
  // Customer/Supplier
  party_name: string;
  party_address: string | null;
  party_phone: string | null;
  party_npwp?: string | null;
  // Items
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  item_code: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

export const useInvoiceDetail = (id: string | undefined, type: 'sales' | 'purchase' | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    if (!user || !id || !type) {
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      if (type === 'sales') {
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .select('*')
          .eq('id', id)
          .single();

        if (saleError) throw saleError;

        const { data: itemsData, error: itemsError } = await supabase
          .from('sales_items')
          .select('*')
          .eq('sales_id', id);

        if (itemsError) throw itemsError;

        setInvoice({
          id: saleData.id,
          type: 'sales',
          transaction_number: saleData.transaction_number,
          transaction_date: saleData.transaction_date,
          payment_method: saleData.payment_method || 'transfer',
          vehicle_number: saleData.vehicle_number,
          reference: saleData.reference,
          apply_vat: saleData.apply_vat || false,
          vat_exempt: saleData.vat_exempt || false,
          subtotal: Number(saleData.subtotal) || 0,
          discount: Number(saleData.discount) || 0,
          shipping_cost: Number(saleData.shipping_cost) || 0,
          down_payment: Number(saleData.down_payment) || 0,
          vat_amount: Number(saleData.vat_amount) || 0,
          grand_total: Number(saleData.grand_total) || 0,
          notes: saleData.notes,
          status: saleData.status || 'pending',
          created_at: saleData.created_at || '',
          party_name: saleData.customer_name,
          party_address: saleData.customer_address,
          party_phone: saleData.customer_phone,
          party_npwp: saleData.customer_npwp,
          items: (itemsData || []).map(item => ({
            id: item.id,
            item_code: item.item_code,
            item_name: item.item_name,
            quantity: Number(item.quantity),
            unit: item.unit,
            unit_price: Number(item.unit_price),
            total: Number(item.total),
          })),
        });
      } else {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select('*')
          .eq('id', id)
          .single();

        if (purchaseError) throw purchaseError;

        const { data: itemsData, error: itemsError } = await supabase
          .from('purchase_items')
          .select('*')
          .eq('purchase_id', id);

        if (itemsError) throw itemsError;

        setInvoice({
          id: purchaseData.id,
          type: 'purchase',
          transaction_number: purchaseData.transaction_number,
          transaction_date: purchaseData.transaction_date,
          payment_method: purchaseData.payment_method || 'transfer',
          vehicle_number: purchaseData.vehicle_number,
          reference: purchaseData.reference,
          apply_vat: purchaseData.apply_vat || false,
          subtotal: Number(purchaseData.subtotal) || 0,
          discount: Number(purchaseData.discount) || 0,
          shipping_cost: Number(purchaseData.shipping_cost) || 0,
          down_payment: Number(purchaseData.down_payment) || 0,
          vat_amount: Number(purchaseData.vat_amount) || 0,
          grand_total: Number(purchaseData.grand_total) || 0,
          notes: purchaseData.notes,
          status: purchaseData.status || 'pending',
          created_at: purchaseData.created_at || '',
          party_name: purchaseData.supplier_name,
          party_address: purchaseData.supplier_address,
          party_phone: purchaseData.supplier_phone,
          items: (itemsData || []).map(item => ({
            id: item.id,
            item_code: item.item_code,
            item_name: item.item_name,
            quantity: Number(item.quantity),
            unit: item.unit,
            unit_price: Number(item.unit_price),
            total: Number(item.total),
          })),
        });
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengambil detail faktur',
      });
    } finally {
      setLoading(false);
    }
  }, [user, id, type, toast]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const updateStatus = async (newStatus: string) => {
    if (!id || !type) return { error: new Error('Invalid invoice') };

    const table = type === 'sales' ? 'sales' : 'purchases';
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengupdate status',
      });
      return { error };
    }

    toast({
      title: 'Berhasil',
      description: 'Status berhasil diperbarui',
    });

    fetchInvoice();
    return { success: true };
  };

  return {
    invoice,
    loading,
    fetchInvoice,
    updateStatus,
  };
};