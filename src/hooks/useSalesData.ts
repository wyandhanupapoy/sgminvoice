import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SalesFormData } from '@/types/transaction';

export interface SalesRecord {
  id: string;
  transaction_number: string;
  customer_id: string | null;
  customer_name: string;
  transaction_date: string;
  due_date: string | null;
  grand_total: number;
  status: string;
  apply_vat: boolean;
}

export const useSalesData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading: loading, refetch: fetchSales } = useQuery({
    queryKey: ['sales', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('sales')
        .select('id, transaction_number, customer_id, customer_name, transaction_date, due_date, grand_total, status, apply_vat')
        .order('created_at', { ascending: false })
        .range(0, 9999);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal mengambil data penjualan',
        });
        throw error;
      }
      return data as SalesRecord[];
    },
    enabled: !!user,
  });

  const saveSaleMutation = useMutation({
    mutationFn: async (formData: SalesFormData) => {
      if (!user) throw new Error('Not authenticated');

      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          transaction_number: formData.transaction.transactionNumber,
          customer_name: formData.customer.name,
          customer_address: formData.customer.address,
          customer_phone: formData.customer.phone,
          customer_npwp: formData.customer.npwp,
          transaction_date: formData.transaction.date?.toISOString().split('T')[0],
          due_date: formData.transaction.dueDate?.toISOString().split('T')[0] || null,
          payment_method: formData.transaction.paymentMethod,
          vehicle_number: formData.transaction.vehicleNumber,
          reference: formData.transaction.reference,
          apply_vat: formData.applyVat,
          vat_exempt: formData.vatExempt,
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

      if (saleError) throw saleError;

      if (formData.items.length > 0) {
        const saleItems = formData.items.map(item => ({
          sales_id: saleData.id,
          item_code: item.itemCode,
          item_name: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from('sales_items')
          .insert(saleItems);

        if (itemsError) {
          toast({
            variant: 'destructive',
            title: 'Warning',
            description: 'Transaksi tersimpan tetapi item gagal ditambahkan',
          });
        }
      }

      return saleData;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Berhasil',
        description: `Transaksi ${variables.transaction.transactionNumber} berhasil disimpan`,
      });
      queryClient.invalidateQueries({ queryKey: ['sales', user?.id] });
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
        .from('sales')
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
      queryClient.invalidateQueries({ queryKey: ['sales', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengupdate status',
      });
    }
  });

  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: SalesFormData }) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Update main sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .update({
          customer_id: formData.customer.id,
          customer_name: formData.customer.name,
          customer_address: formData.customer.address,
          customer_phone: formData.customer.phone,
          customer_npwp: formData.customer.npwp,
          transaction_date: formData.transaction.date?.toISOString().split('T')[0],
          due_date: formData.transaction.dueDate?.toISOString().split('T')[0] || null,
          payment_method: formData.transaction.paymentMethod,
          vehicle_number: formData.transaction.vehicleNumber,
          reference: formData.transaction.reference,
          apply_vat: formData.applyVat,
          vat_exempt: formData.vatExempt,
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

      if (saleError) throw saleError;

      // 2. Delete existing items
      const { error: deleteError } = await supabase
        .from('sales_items')
        .delete()
        .eq('sales_id', id);

      if (deleteError) throw deleteError;

      // 3. Insert new items
      if (formData.items.length > 0) {
        const saleItems = formData.items.map(item => ({
          sales_id: id,
          item_code: item.itemCode,
          item_name: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from('sales_items')
          .insert(saleItems);

        if (itemsError) throw itemsError;
      }

      return saleData;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Berhasil',
        description: `Transaksi ${variables.formData.transaction.transactionNumber} berhasil diperbarui`,
      });
      queryClient.invalidateQueries({ queryKey: ['sales', user?.id] });
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
    sales,
    loading,
    fetchSales,
    saveSale: (formData: SalesFormData) => saveSaleMutation.mutateAsync(formData).then(data => ({ data })).catch(error => ({ error })),
    updateSale: (id: string, formData: SalesFormData) => updateSaleMutation.mutateAsync({ id, formData }).then(data => ({ data })).catch(error => ({ error })),
    updateSaleStatus: (id: string, status: string) => updateStatusMutation.mutateAsync({ id, status }),
  };
};
