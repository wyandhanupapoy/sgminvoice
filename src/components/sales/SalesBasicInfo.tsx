import { useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRight, UserPlus } from 'lucide-react';
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
import { SalesFormData } from '@/types/transaction';
import { formatNPWP } from '@/utils/formatters';
import SearchableSelect, { SelectOption } from '@/components/shared/SearchableSelect';
import { useCustomers, Customer } from '@/hooks/useCustomers';

interface SalesBasicInfoProps {
  formData: SalesFormData;
  errors: Record<string, string>;
  onUpdateFormData: (section: keyof SalesFormData, data: any) => void;
  onSetApplyVat: (value: boolean) => void;
  onSetVatExempt: (value: boolean) => void;
  onNext: () => void;
}

const SalesBasicInfo = ({
  formData,
  errors,
  onUpdateFormData,
  onSetApplyVat,
  onSetVatExempt,
  onNext,
}: SalesBasicInfoProps) => {
  const { customers, loading: customersLoading } = useCustomers();

  const customerOptions: SelectOption[] = useMemo(() => {
    return customers.map((customer) => ({
      value: customer.id,
      label: customer.name,
      sublabel: customer.address || customer.phone || undefined,
      data: customer,
    }));
  }, [customers]);

  const handleCustomerSelect = (value: string, option?: SelectOption) => {
    if (option?.data) {
      const customer = option.data as Customer;
      onUpdateFormData('customer', {
        id: customer.id,
        name: customer.name,
        address: customer.address || '',
        phone: customer.phone || '',
        npwp: customer.npwp || '',
      });
    }
  };

  const handleNPWPChange = (value: string) => {
    const formatted = formatNPWP(value);
    onUpdateFormData('customer', { npwp: formatted });
  };

  const handleClearCustomer = () => {
    onUpdateFormData('customer', {
      id: undefined,
      name: '',
      address: '',
      phone: '',
      npwp: '',
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* VAT Options */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4">Opsi Pajak</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="applyVat"
              checked={formData.applyVat}
              onCheckedChange={(checked) => onSetApplyVat(checked as boolean)}
            />
            <Label htmlFor="applyVat" className="cursor-pointer">
              Kenakan PPN 11% (Buat Faktur)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="vatExempt"
              checked={formData.vatExempt}
              onCheckedChange={(checked) => onSetVatExempt(checked as boolean)}
            />
            <Label htmlFor="vatExempt" className="cursor-pointer">
              Bebas PPN
            </Label>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Informasi Pelanggan</h3>
          {formData.customer.id && (
            <Button variant="ghost" size="sm" onClick={handleClearCustomer}>
              <UserPlus className="w-4 h-4 mr-1" />
              Pelanggan Baru
            </Button>
          )}
        </div>

        {/* Customer Search Dropdown */}
        <div className="mb-4">
          <Label htmlFor="customerSelect" className="mb-2 block">Pilih Pelanggan dari Database</Label>
          <SearchableSelect
            id="customerSelect"
            options={customerOptions}
            value={formData.customer.id || ''}
            onSelect={handleCustomerSelect}
            placeholder="Cari dan pilih pelanggan..."
            searchPlaceholder="Ketik nama pelanggan..."
            emptyText="Pelanggan tidak ditemukan"
            loading={customersLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Pilih pelanggan yang sudah ada atau isi manual di bawah
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Nama Pelanggan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              value={formData.customer.name}
              onChange={(e) => onUpdateFormData('customer', { name: e.target.value, id: undefined })}
              placeholder="Masukkan nama pelanggan"
              className={cn(errors.customerName && 'border-destructive')}
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">No. Telepon</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customer.phone}
              onChange={(e) => onUpdateFormData('customer', { phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerAddress">
              Alamat <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="customerAddress"
              value={formData.customer.address}
              onChange={(e) => onUpdateFormData('customer', { address: e.target.value })}
              placeholder="Masukkan alamat lengkap"
              className={cn(errors.customerAddress && 'border-destructive')}
              rows={3}
            />
            {errors.customerAddress && (
              <p className="text-sm text-destructive">{errors.customerAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="npwp">NPWP / NIK</Label>
            <Input
              id="npwp"
              value={formData.customer.npwp}
              onChange={(e) => handleNPWPChange(e.target.value)}
              placeholder="XX.XXX.XXX.X-XXX.XXX"
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
            <Label htmlFor="transactionDate">
              Tanggal <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="transactionDate"
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
              placeholder="No. PO / Referensi lainnya"
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

export default SalesBasicInfo;
