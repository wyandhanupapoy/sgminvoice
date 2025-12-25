import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { Item } from '@/hooks/useItems';

interface EditItemDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Item>) => Promise<any>;
}

const EditItemDialog = ({ item, open, onOpenChange, onSave }: EditItemDialogProps) => {
  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    unit: '',
    unit_price: 0,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        item_code: item.item_code,
        item_name: item.item_name,
        unit: item.unit || 'Pcs',
        unit_price: item.unit_price || 0,
        description: item.description || '',
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    await onSave(item.id, formData);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Barang</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-code">Kode Barang</Label>
              <Input
                id="edit-item-code"
                value={formData.item_code}
                onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-unit">Satuan</Label>
              <Input
                id="edit-item-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-item-name">Nama Barang</Label>
            <Input
              id="edit-item-name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-item-price">Harga Satuan</Label>
            <CurrencyInput
              id="edit-item-price"
              value={formData.unit_price}
              onChange={(value) => setFormData({ ...formData, unit_price: value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-item-description">Deskripsi</Label>
            <Textarea
              id="edit-item-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;