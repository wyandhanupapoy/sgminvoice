import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, CalendarIcon } from 'lucide-react';
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
import { useInvoiceDetail } from '@/hooks/useInvoiceDetail';
import { useSalesData } from '@/hooks/useSalesData';
import { usePurchaseData } from '@/hooks/usePurchaseData';
import { formatRupiah, formatDate, formatNPWP } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import CurrencyInput from '@/components/shared/CurrencyInput';
import SearchableSelect, { SelectOption } from '@/components/shared/SearchableSelect';
import ItemSearchableSelect from '@/components/shared/ItemSearchableSelect';
import ItemsTable from '@/components/shared/ItemsTable';
import { useCustomers } from '@/hooks/useCustomers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useItems, Item as MasterItem } from '@/hooks/useItems';
import { TransactionItem } from '@/types/transaction';

const VAT_RATE = 0.11;

const EditInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'sales' | 'purchase' | null;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { invoice, loading: loadingInvoice } = useInvoiceDetail(id, type || undefined);
  const { updateSale } = useSalesData();
  const { updatePurchase } = usePurchaseData();
  const { customers, loading: customersLoading } = useCustomers();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { items: masterItems, loading: itemsLoading } = useItems();

  const [formData, setFormData] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    itemCode: '',
    itemName: '',
    quantity: 1,
    unit: 'Pcs',
    unitPrice: 0,
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        applyVat: invoice.apply_vat,
        vatExempt: invoice.vat_exempt,
        party: {
          id: invoice.party_id,
          name: invoice.party_name,
          address: invoice.party_address || '',
          phone: invoice.party_phone || '',
          npwp: invoice.party_npwp || '',
        },
        transaction: {
          transactionNumber: invoice.transaction_number,
          date: new Date(invoice.transaction_date),
          dueDate: invoice.due_date ? new Date(invoice.due_date) : null,
          paymentMethod: invoice.payment_method,
          vehicleNumber: invoice.vehicle_number || '',
          reference: invoice.reference || '',
        },
        items: invoice.items.map(item => ({
          id: item.id,
          itemCode: item.item_code,
          itemName: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unit_price,
          total: item.total,
        })),
        summary: {
          subtotal: invoice.subtotal,
          discount: invoice.discount,
          shippingCost: invoice.shipping_cost,
          downPayment: invoice.down_payment,
          vatAmount: invoice.vat_amount,
          grandTotal: invoice.grand_total,
        },
        notes: invoice.notes || '',
        status: invoice.status,
      });
    }
  }, [invoice]);

  const partyOptions: SelectOption[] = useMemo(() => {
    if (type === 'sales') {
      return customers.map(c => ({ value: c.id, label: c.name, sublabel: c.address || '', data: c }));
    } else {
      return suppliers.map(s => ({ value: s.id, label: s.name, sublabel: s.address || '', data: s }));
    }
  }, [type, customers, suppliers]);

  const calculateSummary = (items: any[], discount: number, shipping: number, dp: number, applyVat: boolean) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const afterDiscount = subtotal - discount;
    const withShipping = afterDiscount + shipping;
    const vatAmount = applyVat ? withShipping * VAT_RATE : 0;
    const grandTotal = withShipping + vatAmount - dp;
    return { subtotal, discount, shippingCost: shipping, downPayment: dp, vatAmount, grandTotal };
  };

  const updateSummary = (updates: any) => {
    setFormData((prev: any) => {
      if (!prev) return null;
      const newSummary = calculateSummary(
        prev.items,
        updates.discount !== undefined ? updates.discount : prev.summary.discount,
        updates.shippingCost !== undefined ? updates.shippingCost : prev.summary.shippingCost,
        updates.downPayment !== undefined ? updates.downPayment : prev.summary.downPayment,
        updates.applyVat !== undefined ? updates.applyVat : prev.applyVat
      );
      return { ...prev, ...updates, summary: newSummary };
    });
  };

  const handleAddItem = () => {
    if (!newItem.itemCode || !newItem.itemName || newItem.quantity <= 0 || newItem.unitPrice <= 0) return;
    
    const item = {
      ...newItem,
      id: crypto.randomUUID(),
      total: newItem.quantity * newItem.unitPrice
    };

    setFormData((prev: any) => {
      const newItems = [...prev.items, item];
      const newSummary = calculateSummary(newItems, prev.summary.discount, prev.summary.shippingCost, prev.summary.downPayment, prev.applyVat);
      return { ...prev, items: newItems, summary: newSummary };
    });

    setNewItem({ itemCode: '', itemName: '', quantity: 1, unit: 'Pcs', unitPrice: 0 });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData((prev: any) => {
      const newItems = prev.items.filter((i: any) => i.id !== itemId);
      const newSummary = calculateSummary(newItems, prev.summary.discount, prev.summary.shippingCost, prev.summary.downPayment, prev.applyVat);
      return { ...prev, items: newItems, summary: newSummary };
    });
  };

  const handleSave = async () => {
    if (!id || !formData) return;
    
    const payload = {
      ...formData,
      customer: type === 'sales' ? formData.party : undefined,
      supplier: type === 'purchase' ? formData.party : undefined,
    };

    let result;
    if (type === 'sales') {
      result = await updateSale(id, payload);
    } else {
      result = await updatePurchase(id, payload);
    }

    if (!(result as any).error) {
      navigate(`/invoices/${id}?type=${type}`);
    }
  };

  if (loadingInvoice || !formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Edit Faktur {type === 'sales' ? 'Penjualan' : 'Pembelian'}</h1>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary">
          <Save className="w-4 h-4" />
          Simpan Perubahan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Party & Transaction Info */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Informasi Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <Label>{type === 'sales' ? 'Pelanggan' : 'Supplier'}</Label>
                <SearchableSelect
                  options={partyOptions}
                  value={formData.party.id || ''}
                  onSelect={(val, opt) => {
                    const data = opt?.data as any;
                    setFormData({ ...formData, party: {
                      id: data.id,
                      name: data.name,
                      address: data.address || '',
                      phone: data.phone || '',
                      npwp: data.npwp || '',
                    }});
                  }}
                  loading={type === 'sales' ? customersLoading : suppliersLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.transaction.date, 'dd MMMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.transaction.date}
                      onSelect={(date) => setFormData({ ...formData, transaction: { ...formData.transaction, date: date || new Date() } })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Jatuh Tempo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.transaction.dueDate ? format(formData.transaction.dueDate, 'dd MMMM yyyy') : 'Pilih jatuh tempo'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.transaction.dueDate || undefined}
                      onSelect={(date) => setFormData({ ...formData, transaction: { ...formData.transaction, dueDate: date } })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>No. Kendaraan</Label>
                <Input 
                  value={formData.transaction.vehicleNumber} 
                  onChange={(e) => setFormData({ ...formData, transaction: { ...formData.transaction, vehicleNumber: e.target.value } })}
                />
              </div>

              <div className="space-y-2">
                <Label>Referensi / PO</Label>
                <Input 
                  value={formData.transaction.reference} 
                  onChange={(e) => setFormData({ ...formData, transaction: { ...formData.transaction, reference: e.target.value } })}
                />
              </div>

              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select value={formData.transaction.paymentMethod} onValueChange={(val) => setFormData({ ...formData, transaction: { ...formData.transaction, paymentMethod: val } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="cash">Tunai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Daftar Barang</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 bg-muted/50 p-3 rounded-lg">
                <div className="lg:col-span-2">
                  <ItemSearchableSelect
                    items={masterItems}
                    loading={itemsLoading}
                    onSelect={(item) => setNewItem({
                      itemCode: item.item_code,
                      itemName: item.item_name,
                      quantity: 1,
                      unit: item.unit || 'Pcs',
                      unitPrice: item.unit_price || 0,
                    })}
                  />
                </div>
                <Input type="number" placeholder="Qty" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
                <Input placeholder="Satuan" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} />
                <CurrencyInput value={newItem.unitPrice} onChange={(val) => setNewItem({ ...newItem, unitPrice: val })} />
                <Button onClick={handleAddItem} className="w-full"><Plus className="w-4 h-4" /></Button>
              </div>
              
              <ItemsTable items={formData.items} onRemoveItem={handleRemoveItem} />
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Opsi Pajak</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox id="tax" checked={formData.applyVat} onCheckedChange={(val) => updateSummary({ applyVat: !!val })} />
                <Label htmlFor="tax">Kenakan PPN 11%</Label>
              </div>
              {type === 'sales' && (
                <div className="flex items-center gap-2">
                  <Checkbox id="exempt" checked={formData.vatExempt} onCheckedChange={(val) => setFormData({ ...formData, vatExempt: !!val })} />
                  <Label htmlFor="exempt">Bebas PPN</Label>
                </div>
              )}
            </div>
          </div>

          <div className="form-section space-y-4">
            <h3 className="text-lg font-semibold mb-4">Ringkasan Biaya</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatRupiah(formData.summary.subtotal)}</span>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Diskon</Label>
                <CurrencyInput value={formData.summary.discount} onChange={(val) => updateSummary({ discount: val })} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ongkos Kirim</Label>
                <CurrencyInput value={formData.summary.shippingCost} onChange={(val) => updateSummary({ shippingCost: val })} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Uang Muka (DP)</Label>
                <CurrencyInput value={formData.summary.downPayment} onChange={(val) => updateSummary({ downPayment: val })} />
              </div>

              {formData.applyVat && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground">PPN 11%</span>
                  <span>{formatRupiah(formData.summary.vatAmount)}</span>
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatRupiah(formData.summary.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <Label className="mb-2 block">Catatan</Label>
            <Textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tambahkan catatan faktur..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
