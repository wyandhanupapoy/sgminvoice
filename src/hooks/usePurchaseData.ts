import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PurchaseFormData } from '@/types/transaction';

export interface PurchaseRecord {
  id: string;
  transaction_number: string;
  supplier_id: string | null;
  supplier_name: string;
  transaction_date: string;
  due_date: string | null;
  grand_total: number;
  status: string;
  apply_vat: boolean;
}

export const usePurchaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading: loading, refetch: fetchPurchases } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('purchases')
        .select('id, transaction_number, supplier_id, supplier_name, transaction_date, due_date, grand_total, status, apply_vat')
        .order('created_at', { ascending: false })
        .range(0, 9999);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal mengambil data pembelian',
        });
        throw error;
      }
      return data as PurchaseRecord[];
    },
    enabled: !!user,
  });

  const savePurchaseMutation = useMutation({
    mutationFn: async (formData: PurchaseFormData) => {
      if (!user) throw new Error('Not authenticated');

      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          transaction_number: formData.transaction.transactionNumber,
          supplier_name: formData.supplier.name,
          supplier_address: formData.supplier.address,
          supplier_phone: formData.supplier.phone,
          transaction_date: formData.transaction.date?.toISOString().split('T')[0],
          due_date: formData.transaction.dueDate?.toISOString().split('T')[0] || null,
          payment_method: formData.transaction.paymentMethod,
          vehicle_number: formData.transaction.vehicleNumber,
          reference: formData.transaction.reference,
          apply_vat: formData.applyVat,
          subtotal: formData.summary.subtotal,
          discount: formData.summary.discount,
          shipping_cost: formData.summary.shippingCost,
          down_payment: formData.summary.downPayment,
          vat_amount: formData.summary.vatAmount,
          grand_total: formData.summary.grandTotal,
          notes: formData.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      if (formData.items.length > 0) {
        const purchaseItems = formData.items.map(item => ({
          purchase_id: purchaseData.id,
          item_code: item.itemCode,
          item_name: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(purchaseItems);

        if (itemsError) {
          toast({
            variant: 'destructive',
            title: 'Warning',
            description: 'Transaksi tersimpan tetapi item gagal ditambahkan',
          });
        }
      }

      return purchaseData;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Berhasil',
        description: `Transaksi ${variables.transaction.transactionNumber} berhasil disimpan`,
      });
      queryClient.invalidateQueries({ queryKey: ['purchases', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyimpan transaksi',
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('purchases')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Status faktur berhasil diupdate',
      });
      queryClient.invalidateQueries({ queryKey: ['purchases', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengupdate status',
      });
    }
  });

  const updatePurchaseMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: PurchaseFormData }) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Update main purchase record
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .update({
          supplier_id: formData.supplier.id,
          supplier_name: formData.supplier.name,
          supplier_address: formData.supplier.address,
          supplier_phone: formData.supplier.phone,
          transaction_date: formData.transaction.date?.toISOString().split('T')[0],
          due_date: formData.transaction.dueDate?.toISOString().split('T')[0] || null,
          payment_method: formData.transaction.paymentMethod,
          vehicle_number: formData.transaction.vehicleNumber,
          reference: formData.transaction.reference,
          apply_vat: formData.applyVat,
          subtotal: formData.summary.subtotal,
          discount: formData.summary.discount,
          shipping_cost: formData.summary.shippingCost,
          down_payment: formData.summary.downPayment,
          vat_amount: formData.summary.vatAmount,
          grand_total: formData.summary.grandTotal,
          notes: formData.notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // 2. Delete existing items
      const { error: deleteError } = await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', id);

      if (deleteError) throw deleteError;

      // 3. Insert new items
      if (formData.items.length > 0) {
        const purchaseItems = formData.items.map(item => ({
          purchase_id: id,
          item_code: item.itemCode,
          item_name: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(purchaseItems);

        if (itemsError) throw itemsError;
      }

      return purchaseData;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Berhasil',
        description: `Transaksi ${variables.formData.transaction.transactionNumber} berhasil diperbarui`,
      });
      queryClient.invalidateQueries({ queryKey: ['purchases', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memperbarui transaksi',
      });
    }
  });

  return {
    purchases,
    loading,
    fetchPurchases,
    savePurchase: (formData: PurchaseFormData) => savePurchaseMutation.mutateAsync(formData).then(data => ({ data })).catch(error => ({ error })),
    updatePurchase: (id: string, formData: PurchaseFormData) => updatePurchaseMutation.mutateAsync({ id, formData }).then(data => ({ data })).catch(error => ({ error })),
    updatePurchaseStatus: (id: string, status: string) => updateStatusMutation.mutateAsync({ id, status }),
  };
};
