import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Item {
  id: string;
  item_code: string;
  item_name: string;
  unit: string;
  unit_price: number;
  description: string | null;
}

export const useItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('item_name');

      if (error) {
        console.error('Error fetching items:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal mengambil data barang: ' + error.message,
        });
      } else {
        console.log('Items fetched:', data?.length || 0);
        setItems(data || []);
      }
    } catch (err) {
      console.error('Exception fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: Omit<Item, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('items')
      .insert({
        ...item,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menambah barang',
      });
      return { error };
    }

    setItems(prev => [...prev, data]);
    toast({
      title: 'Berhasil',
      description: 'Barang berhasil ditambahkan',
    });
    return { data };
  };

  const addItemsBulk = async (itemsData: Omit<Item, 'id'>[]) => {
    if (!user) return { error: new Error('Not authenticated') };

    const itemsWithUserId = itemsData.map(item => ({
      ...item,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from('items')
      .insert(itemsWithUserId)
      .select();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menambah barang',
      });
      return { error };
    }

    setItems(prev => [...prev, ...(data || [])]);
    toast({
      title: 'Berhasil',
      description: `${data?.length || 0} barang berhasil ditambahkan`,
    });
    return { data };
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengupdate barang',
      });
      return { error };
    }

    setItems(prev => prev.map(item => item.id === id ? data : item));
    toast({
      title: 'Berhasil',
      description: 'Barang berhasil diupdate',
    });
    return { data };
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus barang',
      });
      return { error };
    }

    setItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'Berhasil',
      description: 'Barang berhasil dihapus',
    });
    return { success: true };
  };

  const deleteAllItems = async () => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus semua barang',
      });
      return { error };
    }

    setItems([]);
    toast({
      title: 'Berhasil',
      description: 'Semua barang berhasil dihapus',
    });
    return { success: true };
  };

  return {
    items,
    loading,
    fetchItems,
    addItem,
    addItemsBulk,
    updateItem,
    deleteItem,
    deleteAllItems,
  };
};
