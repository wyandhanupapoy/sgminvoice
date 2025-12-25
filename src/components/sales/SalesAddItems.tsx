import { useState } from 'react';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CurrencyInput from '@/components/shared/CurrencyInput';
import ItemsTable from '@/components/shared/ItemsTable';
import ItemSearchableSelect from '@/components/shared/ItemSearchableSelect';
import { TransactionItem } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { useItems, Item } from '@/hooks/useItems';

interface SalesAddItemsProps {
  items: TransactionItem[];
  errors: Record<string, string>;
  onAddItem: (item: Omit<TransactionItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

const unitOptions = ['Kg', 'Pcs', 'Unit', 'Batang', 'Lembar', 'Roll', 'Set', 'Pak', 'Box', 'Meter'];

const SalesAddItems = ({
  items,
  errors,
  onAddItem,
  onRemoveItem,
  onPrev,
  onNext,
}: SalesAddItemsProps) => {
  const { items: masterItems, loading: itemsLoading } = useItems();
  const [newItem, setNewItem] = useState({
    itemCode: '',
    itemName: '',
    quantity: 1,
    unit: 'Pcs',
    unitPrice: 0,
  });
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  const handleItemSelect = (item: Item) => {
    setNewItem({
      itemCode: item.item_code,
      itemName: item.item_name,
      quantity: 1,
      unit: item.unit || 'Pcs',
      unitPrice: item.unit_price || 0,
    });
    setItemErrors({});
  };

  const validateItem = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newItem.itemCode.trim()) {
      errors.itemCode = 'Kode barang wajib diisi';
    }
    if (!newItem.itemName.trim()) {
      errors.itemName = 'Nama barang wajib diisi';
    }
    if (newItem.quantity <= 0) {
      errors.quantity = 'Kuantitas harus lebih dari 0';
    }
    if (newItem.unitPrice <= 0) {
      errors.unitPrice = 'Harga satuan harus lebih dari 0';
    }

    setItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddItem = () => {
    if (!validateItem()) return;

    onAddItem(newItem);
    setNewItem({
      itemCode: '',
      itemName: '',
      quantity: 1,
      unit: 'Pcs',
      unitPrice: 0,
    });
    setItemErrors({});
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Item Search from Database */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4">Pilih Barang dari Database</h3>
        <ItemSearchableSelect
          items={masterItems}
          loading={itemsLoading}
          onSelect={handleItemSelect}
          placeholder="Klik untuk memilih barang..."
          searchPlaceholder="Cari nama atau kode barang..."
          emptyText="Barang tidak ditemukan"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Pilih barang dari database untuk mengisi otomatis, atau isi manual di bawah
        </p>
      </div>

      {/* Add Item Form */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4">Detail Barang</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemCode">
              Kode Barang <span className="text-destructive">*</span>
            </Label>
            <Input
              id="itemCode"
              value={newItem.itemCode}
              onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
              placeholder="Contoh: STL-001"
              className={cn(itemErrors.itemCode && 'border-destructive')}
            />
            {itemErrors.itemCode && (
              <p className="text-xs text-destructive">{itemErrors.itemCode}</p>
            )}
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="itemName">
              Nama Barang <span className="text-destructive">*</span>
            </Label>
            <Input
              id="itemName"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              placeholder="Contoh: Besi Beton 10mm"
              className={cn(itemErrors.itemName && 'border-destructive')}
            />
            {itemErrors.itemName && (
              <p className="text-xs text-destructive">{itemErrors.itemName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Qty <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
              className={cn(itemErrors.quantity && 'border-destructive')}
            />
            {itemErrors.quantity && (
              <p className="text-xs text-destructive">{itemErrors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Satuan</Label>
            <Select
              value={newItem.unit}
              onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Harga Satuan <span className="text-destructive">*</span>
            </Label>
            <CurrencyInput
              value={newItem.unitPrice}
              onChange={(value) => setNewItem({ ...newItem, unitPrice: value })}
              className={cn(itemErrors.unitPrice && 'border-destructive')}
            />
            {itemErrors.unitPrice && (
              <p className="text-xs text-destructive">{itemErrors.unitPrice}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={handleAddItem} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Barang
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4">Daftar Barang ({items.length} item)</h3>
        {errors.items && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {errors.items}
          </div>
        )}
        <ItemsTable items={items} onRemoveItem={onRemoveItem} />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Informasi Dasar
        </Button>
        <Button onClick={onNext} className="gap-2">
          Lanjutkan ke Ringkasan
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SalesAddItems;
