import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  npwp: string | null;
  email: string | null;
}

export const useCustomers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading: loading, refetch: fetchCustomers } = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal mengambil data pelanggan: ' + error.message,
        });
        throw error;
      }
      return data as Customer[];
    },
    enabled: !!user,
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customer,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Pelanggan berhasil ditambahkan',
      });
      queryClient.invalidateQueries({ queryKey: ['customers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menambah pelanggan',
      });
    }
  });

  const addCustomersBulkMutation = useMutation({
    mutationFn: async (customersData: Omit<Customer, 'id'>[]) => {
      if (!user) throw new Error('Not authenticated');

      const customersWithUserId = customersData.map(customer => ({
        ...customer,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('customers')
        .insert(customersWithUserId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Berhasil',
        description: `${data?.length || 0} pelanggan berhasil ditambahkan`,
      });
      queryClient.invalidateQueries({ queryKey: ['customers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menambah pelanggan',
      });
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Customer> }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Pelanggan berhasil diupdate',
      });
      queryClient.invalidateQueries({ queryKey: ['customers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengupdate pelanggan',
      });
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Pelanggan berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['customers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus pelanggan',
      });
    }
  });

  const deleteAllCustomersMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Semua pelanggan berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['customers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus semua pelanggan',
      });
    }
  });

  return {
    customers,
    loading,
    fetchCustomers,
    addCustomer: (customer: Omit<Customer, 'id'>) => addCustomerMutation.mutateAsync(customer).then(data => ({ data })).catch(error => ({ error })),
    addCustomersBulk: (customersData: Omit<Customer, 'id'>[]) => addCustomersBulkMutation.mutateAsync(customersData).then(data => ({ data })).catch(error => ({ error })),
    updateCustomer: (id: string, updates: Partial<Customer>) => updateCustomerMutation.mutateAsync({ id, updates }).then(data => ({ data })).catch(error => ({ error })),
    deleteCustomer: (id: string) => deleteCustomerMutation.mutateAsync(id).then(() => ({ success: true })).catch(error => ({ error })),
    deleteAllCustomers: () => deleteAllCustomersMutation.mutateAsync().then(() => ({ success: true })).catch(error => ({ error })),
  };
};
