import { useState } from 'react';
import { ArrowLeft, RotateCcw, Save, Printer, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CurrencyInput from '@/components/shared/CurrencyInput';
import ItemsTable from '@/components/shared/ItemsTable';
import { PurchaseFormData, CostSummary } from '@/types/transaction';
import { formatRupiah, formatDate } from '@/utils/formatters';
import { usePurchaseData } from '@/hooks/usePurchaseData';
import { printDotMatrixInvoice, getDotMatrixContent } from '@/utils/invoicePrinter';
import { useToast } from '@/hooks/use-toast';

interface PurchaseSummaryProps {
  formData: PurchaseFormData;
  onUpdateSummary: (field: keyof CostSummary, value: number) => void;
  onRemoveItem: (id: string) => void;
  onSetNotes: (notes: string) => void;
  onPrev: () => void;
  onReset: () => void;
}

const PurchaseSummary = ({
  formData,
  onUpdateSummary,
  onRemoveItem,
  onSetNotes,
  onPrev,
  onReset,
}: PurchaseSummaryProps) => {
  const { savePurchase } = usePurchaseData();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePurchase(formData);
      onReset();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    printDotMatrixInvoice(formData, 'purchase');
  };

  const handleCopyInvoice = async () => {
    const content = getDotMatrixContent(formData, 'purchase');
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: 'Berhasil',
        description: 'Faktur berhasil disalin ke clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Tidak dapat menyalin faktur',
      });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Summary */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Ringkasan Supplier</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nama:</span>
                <p className="font-medium">{formData.supplier.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">No. Telepon:</span>
                <p className="font-medium">{formData.supplier.phone || '-'}</p>
              </div>
              {formData.supplier.address && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Alamat:</span>
                  <p className="font-medium">{formData.supplier.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Informasi Transaksi</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">No. Transaksi:</span>
                <p className="font-medium font-mono">{formData.transaction.transactionNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tanggal:</span>
                <p className="font-medium">{formatDate(formData.transaction.date)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Metode Bayar:</span>
                <p className="font-medium">
                  {formData.transaction.paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">PPN:</span>
                <p className="font-medium">{formData.applyVat ? 'Ya (11%)' : 'Tidak'}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Daftar Barang</h3>
            <ItemsTable items={formData.items} onRemoveItem={onRemoveItem} />
          </div>

          {/* Notes */}
          <div className="form-section">
            <Label htmlFor="notes" className="text-lg font-semibold">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onSetNotes(e.target.value)}
              placeholder="Catatan tambahan untuk transaksi ini..."
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        {/* Right Column - Cost Summary */}
        <div className="space-y-6">
          <div className="form-section sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Rincian Biaya</h3>
            
            <div className="space-y-4">
              <div className="summary-row">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium">
                  {formatRupiah(formData.summary.subtotal)}
                </span>
              </div>

              <div className="space-y-2">
                <Label>Diskon</Label>
                <CurrencyInput
                  value={formData.summary.discount}
                  onChange={(value) => onUpdateSummary('discount', value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Biaya Pengiriman</Label>
                <CurrencyInput
                  value={formData.summary.shippingCost}
                  onChange={(value) => onUpdateSummary('shippingCost', value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Uang Muka (DP)</Label>
                <CurrencyInput
                  value={formData.summary.downPayment}
                  onChange={(value) => onUpdateSummary('downPayment', value)}
                />
              </div>

              {formData.applyVat && (
                <div className="summary-row">
                  <span className="text-muted-foreground">PPN 11%</span>
                  <span className="font-mono font-medium">
                    {formatRupiah(formData.summary.vatAmount)}
                  </span>
                </div>
              )}

              <div className="summary-total mt-4">
                <span>Grand Total</span>
                <span className="font-mono text-xl">
                  {formatRupiah(formData.summary.grandTotal)}
                </span>
              </div>
            </div>

            {/* Print Actions */}
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
                Cetak Faktur (Dot Matrix)
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={handleCopyInvoice}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin!' : 'Salin Faktur ke Clipboard'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap justify-between gap-4">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset Form
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSummary;
