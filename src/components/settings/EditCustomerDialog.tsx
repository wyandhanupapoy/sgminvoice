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
import { Customer } from '@/hooks/useCustomers';

interface EditCustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Customer>) => Promise<any>;
}

const EditCustomerDialog = ({ customer, open, onOpenChange, onSave }: EditCustomerDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    npwp: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        address: customer.address || '',
        phone: customer.phone || '',
        npwp: customer.npwp || '',
        email: customer.email || '',
      });
    }
  }, [customer]);

  const handleSave = async () => {
    if (!customer) return;
    setSaving(true);
    await onSave(customer.id, formData);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Pelanggan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-customer-name">Nama Pelanggan</Label>
            <Input
              id="edit-customer-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customer-phone">Telepon</Label>
              <Input
                id="edit-customer-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-customer-email">Email</Label>
              <Input
                id="edit-customer-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-customer-address">Alamat</Label>
            <Textarea
              id="edit-customer-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-customer-npwp">NPWP</Label>
            <Input
              id="edit-customer-npwp"
              value={formData.npwp}
              onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
              placeholder="XX.XXX.XXX.X-XXX.XXX"
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

export default EditCustomerDialog;