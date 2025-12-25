import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export const useSuppliers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading: loading, refetch: fetchSuppliers } = useQuery({
    queryKey: ['suppliers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal mengambil data supplier: ' + error.message,
        });
        throw error;
      }
      return data as Supplier[];
    },
    enabled: !!user,
  });

  const addSupplierMutation = useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplier,
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
        description: 'Supplier berhasil ditambahkan',
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menambah supplier',
      });
    }
  });

  const addSuppliersBulkMutation = useMutation({
    mutationFn: async (suppliersData: Omit<Supplier, 'id'>[]) => {
      if (!user) throw new Error('Not authenticated');

      const suppliersWithUserId = suppliersData.map(supplier => ({
        ...supplier,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('suppliers')
        .insert(suppliersWithUserId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Berhasil',
        description: `${data?.length || 0} supplier berhasil ditambahkan`,
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menambah supplier',
      });
    }
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Supplier> }) => {
      const { data, error } = await supabase
        .from('suppliers')
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
        description: 'Supplier berhasil diupdate',
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengupdate supplier',
      });
    }
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Supplier berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus supplier',
      });
    }
  });

  const deleteAllSuppliersMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Semua supplier berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers', user?.id] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus semua supplier',
      });
    }
  });

  return {
    suppliers,
    loading,
    fetchSuppliers,
    addSupplier: (supplier: Omit<Supplier, 'id'>) => addSupplierMutation.mutateAsync(supplier).then(data => ({ data })).catch(error => ({ error })),
    addSuppliersBulk: (suppliersData: Omit<Supplier, 'id'>[]) => addSuppliersBulkMutation.mutateAsync(suppliersData).then(data => ({ data })).catch(error => ({ error })),
    updateSupplier: (id: string, updates: Partial<Supplier>) => updateSupplierMutation.mutateAsync({ id, updates }).then(data => ({ data })).catch(error => ({ error })),
    deleteSupplier: (id: string) => deleteSupplierMutation.mutateAsync(id).then(() => ({ success: true })).catch(error => ({ error })),
    deleteAllSuppliers: () => deleteAllSuppliersMutation.mutateAsync().then(() => ({ success: true })).catch(error => ({ error })),
  };
};
