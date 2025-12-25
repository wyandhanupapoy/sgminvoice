import { useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PurchaseFormData } from '@/types/transaction';
import SearchableSelect, { SelectOption } from '@/components/shared/SearchableSelect';
import { useSuppliers, Supplier } from '@/hooks/useSuppliers';

interface PurchaseBasicInfoProps {
  formData: PurchaseFormData;
  errors: Record<string, string>;
  onUpdateFormData: (section: keyof PurchaseFormData, data: any) => void;
  onSetApplyVat: (value: boolean) => void;
  onNext: () => void;
}

const PurchaseBasicInfo = ({
  formData,
  errors,
  onUpdateFormData,
  onSetApplyVat,
  onNext,
}: PurchaseBasicInfoProps) => {
  const { suppliers, loading: suppliersLoading } = useSuppliers();

  const supplierOptions: SelectOption[] = useMemo(() => {
    return suppliers.map((supplier) => ({
      value: supplier.id,
      label: supplier.name,
      sublabel: supplier.address || supplier.phone || undefined,
      data: supplier,
    }));
  }, [suppliers]);

  const handleSupplierSelect = (value: string, option?: SelectOption) => {
    if (option?.data) {
      const supplier = option.data as Supplier;
      onUpdateFormData('supplier', {
        id: supplier.id,
        name: supplier.name,
        address: supplier.address || '',
        phone: supplier.phone || '',
      });
    }
  };

  const handleClearSupplier = () => {
    onUpdateFormData('supplier', {
      id: undefined,
      name: '',
      address: '',
      phone: '',
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* VAT Options */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4">Opsi Pajak</h3>
        <div className="flex items-center gap-2">
          <Checkbox
            id="applyVat"
            checked={formData.applyVat}
            onCheckedChange={(checked) => onSetApplyVat(checked as boolean)}
          />
          <Label htmlFor="applyVat" className="cursor-pointer">
            Termasuk PPN 11%
          </Label>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Informasi Supplier</h3>
          {formData.supplier.id && (
            <Button variant="ghost" size="sm" onClick={handleClearSupplier}>
              <Building2 className="w-4 h-4 mr-1" />
              Supplier Baru
            </Button>
          )}
        </div>

        {/* Supplier Search Dropdown */}
        <div className="mb-4">
          <Label htmlFor="supplierSelect" className="mb-2 block">Pilih Supplier dari Database</Label>
          <SearchableSelect
            id="supplierSelect"
            options={supplierOptions}
            value={formData.supplier.id || ''}
            onSelect={handleSupplierSelect}
            placeholder="Cari dan pilih supplier..."
            searchPlaceholder="Ketik nama supplier..."
            emptyText="Supplier tidak ditemukan"
            loading={suppliersLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Pilih supplier yang sudah ada atau isi manual di bawah
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplierName">
              Nama Supplier <span className="text-destructive">*</span>
            </Label>
            <Input
              id="supplierName"
              value={formData.supplier.name}
              onChange={(e) => onUpdateFormData('supplier', { name: e.target.value, id: undefined })}
              placeholder="Masukkan nama supplier"
              className={cn(errors.supplierName && 'border-destructive')}
            />
            {errors.supplierName && (
              <p className="text-sm text-destructive">{errors.supplierName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierPhone">No. Telepon</Label>
            <Input
              id="supplierPhone"
              type="tel"
              value={formData.supplier.phone}
              onChange={(e) => onUpdateFormData('supplier', { phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="supplierAddress">Alamat</Label>
            <Textarea
              id="supplierAddress"
              value={formData.supplier.address}
              onChange={(e) => onUpdateFormData('supplier', { address: e.target.value })}
              placeholder="Masukkan alamat supplier"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Transaction Information */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4">Informasi Transaksi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transactionNumber">No. Transaksi</Label>
            <Input
              id="transactionNumber"
              value={formData.transaction.transactionNumber}
              readOnly
              className="bg-muted font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">
              Tanggal <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="purchaseDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.transaction.date && 'text-muted-foreground',
                    errors.date && 'border-destructive'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.transaction.date ? (
                    format(formData.transaction.date, 'dd MMMM yyyy')
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.transaction.date || undefined}
                  onSelect={(date) => onUpdateFormData('transaction', { date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Jatuh Tempo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dueDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.transaction.dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.transaction.dueDate ? (
                    format(formData.transaction.dueDate, 'dd MMMM yyyy')
                  ) : (
                    <span>Pilih jatuh tempo</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.transaction.dueDate || undefined}
                  onSelect={(date) => onUpdateFormData('transaction', { dueDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
            <Select
              value={formData.transaction.paymentMethod}
              onValueChange={(value) => 
                onUpdateFormData('transaction', { paymentMethod: value })
              }
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Pilih metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transfer Bank</SelectItem>
                <SelectItem value="cash">Tunai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">No. Kendaraan</Label>
            <Input
              id="vehicleNumber"
              value={formData.transaction.vehicleNumber}
              onChange={(e) => 
                onUpdateFormData('transaction', { vehicleNumber: e.target.value })
              }
              placeholder="Contoh: B 1234 ABC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referensi</Label>
            <Input
              id="reference"
              value={formData.transaction.reference}
              onChange={(e) => 
                onUpdateFormData('transaction', { reference: e.target.value })
              }
              placeholder="No. Invoice Supplier"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Lanjutkan ke Tambah Barang
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PurchaseBasicInfo;
