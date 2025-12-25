import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer, Copy, CheckCircle, Clock, AlertCircle, FileText, Truck, Receipt, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInvoiceDetail } from '@/hooks/useInvoiceDetail';
import { formatRupiah, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { usePrintSettings } from '@/hooks/usePrintSettings';
import { printInvoice, printSuratJalan, printKwitansi } from '@/utils/printTemplates';
import { printInvoiceDotMatrix, printSuratJalanDotMatrix, printKwitansiDotMatrix } from '@/utils/dotMatrixTemplates';

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'sales' | 'purchase' | null;
  const printAction = searchParams.get('print');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = usePrintSettings();
  
  const { invoice, loading, updateStatus } = useInvoiceDetail(id, type || undefined);

  // Auto-print when navigating with print parameter
  useEffect(() => {
    if (invoice && printAction && !loading) {
      setTimeout(() => {
        if (printAction === 'invoice') {
          handlePrintInvoice();
        } else if (printAction === 'surat-jalan') {
          handlePrintSuratJalan();
        } else if (printAction === 'kwitansi') {
          handlePrintKwitansi();
        }
      }, 300);
    }
  }, [invoice, printAction, loading]);

  const handlePrintInvoice = () => {
    if (!invoice) return;
    if (settings.useDotMatrix) {
      printInvoiceDotMatrix(invoice);
    } else {
      printInvoice(invoice);
    }
  };

  const handlePrintSuratJalan = () => {
    if (!invoice) return;
    if (settings.useDotMatrix) {
      printSuratJalanDotMatrix(invoice);
    } else {
      printSuratJalan(invoice);
    }
  };

  const handlePrintKwitansi = () => {
    if (!invoice) return;
    if (settings.useDotMatrix) {
      printKwitansiDotMatrix(invoice);
    } else {
      printKwitansi(invoice);
    }
  };


  const handleCopyToClipboard = async () => {
    if (!invoice) return;

    const content = `
FAKTUR ${invoice.type === 'sales' ? 'PENJUALAN' : 'PEMBELIAN'}
No: ${invoice.transaction_number}
Tanggal: ${formatDate(new Date(invoice.transaction_date))}
${invoice.type === 'sales' ? 'Pelanggan' : 'Supplier'}: ${invoice.party_name}

DAFTAR BARANG:
${invoice.items.map((item, i) => `${i + 1}. ${item.item_name} - ${item.quantity} ${item.unit} x ${formatRupiah(item.unit_price)} = ${formatRupiah(item.total)}`).join('\n')}

Subtotal: ${formatRupiah(invoice.subtotal)}
${invoice.discount > 0 ? `Diskon: ${formatRupiah(invoice.discount)}\n` : ''}${invoice.shipping_cost > 0 ? `Ongkos Kirim: ${formatRupiah(invoice.shipping_cost)}\n` : ''}${invoice.apply_vat ? `PPN 11%: ${formatRupiah(invoice.vat_amount)}\n` : ''}${invoice.down_payment > 0 ? `Uang Muka: ${formatRupiah(invoice.down_payment)}\n` : ''}GRAND TOTAL: ${formatRupiah(invoice.grand_total)}
    `.trim();

    await navigator.clipboard.writeText(content);
    toast({
      title: 'Disalin',
      description: 'Detail faktur berhasil disalin ke clipboard',
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateStatus(newStatus);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
      paid: { variant: 'default', icon: <CheckCircle className="w-3 h-3 mr-1" />, label: 'Lunas' },
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3 mr-1" />, label: 'Pending' },
      overdue: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3 mr-1" />, label: 'Terlambat' },
    };
    const c = config[status] || config.pending;
    return (
      <Badge variant={c.variant} className="flex items-center">
        {c.icon}
        {c.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate('/invoices')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <div className="form-section text-center py-12">
          <p className="text-muted-foreground">Faktur tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/invoices')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.transaction_number}</h1>
            <p className="text-muted-foreground">
              {invoice.type === 'sales' ? 'Faktur Penjualan' : 'Faktur Pembelian'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/invoices/edit/${invoice.id}?type=${invoice.type}`)} 
            className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>

          <Button variant="outline" onClick={handleCopyToClipboard} className="gap-2">
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Salin</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Printer className="w-4 h-4" />
                Cetak {settings.useDotMatrix ? '(Dot Matrix)' : ''}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePrintInvoice}>
                <FileText className="w-4 h-4 mr-2" />
                Invoice Penjualan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintSuratJalan}>
                <Truck className="w-4 h-4 mr-2" />
                Surat Jalan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintKwitansi}>
                <Receipt className="w-4 h-4 mr-2" />
                Kwitansi Pembayaran
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Details */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Informasi Transaksi</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium">{formatDate(new Date(invoice.transaction_date))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                <p className="font-medium">{invoice.payment_method === 'transfer' ? 'Transfer Bank' : 'Tunai'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
              {invoice.vehicle_number && (
                <div>
                  <p className="text-sm text-muted-foreground">No. Kendaraan</p>
                  <p className="font-medium">{invoice.vehicle_number}</p>
                </div>
              )}
              {invoice.reference && (
                <div>
                  <p className="text-sm text-muted-foreground">Referensi</p>
                  <p className="font-medium">{invoice.reference}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">PPN</p>
                <p className="font-medium">{invoice.apply_vat ? 'Termasuk PPN 11%' : 'Tanpa PPN'}</p>
              </div>
            </div>
          </div>

          {/* Customer/Supplier Info */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">
              {invoice.type === 'sales' ? 'Informasi Pelanggan' : 'Informasi Supplier'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">{invoice.party_name}</p>
              </div>
              {invoice.party_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telepon</p>
                  <p className="font-medium">{invoice.party_phone}</p>
                </div>
              )}
              {invoice.party_address && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="font-medium">{invoice.party_address}</p>
                </div>
              )}
              {invoice.party_npwp && (
                <div>
                  <p className="text-sm text-muted-foreground">NPWP</p>
                  <p className="font-medium">{invoice.party_npwp}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Daftar Barang ({invoice.items.length} item)</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-8 sm:w-12">No</th>
                      <th className="hidden sm:table-cell">Kode</th>
                      <th>Nama Barang</th>
                      <th className="text-right">Qty</th>
                      <th className="hidden md:table-cell">Satuan</th>
                      <th className="text-right hidden lg:table-cell">Harga</th>
                      <th className="text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-center text-[10px] sm:text-xs">{index + 1}</td>
                        <td className="hidden sm:table-cell font-mono text-[10px] sm:text-xs">{item.item_code}</td>
                        <td className="max-w-[120px] sm:max-w-none truncate text-[10px] sm:text-xs">{item.item_name}</td>
                        <td className="text-right text-[10px] sm:text-xs">{item.quantity}</td>
                        <td className="hidden md:table-cell text-[10px] sm:text-xs">{item.unit}</td>
                        <td className="hidden lg:table-cell text-right font-mono text-[10px] sm:text-xs whitespace-nowrap">{formatRupiah(item.unit_price)}</td>
                        <td className="text-right font-mono font-medium text-[10px] sm:text-xs whitespace-nowrap">{formatRupiah(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-2">Catatan</h3>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Update Status</h3>
            <Select value={invoice.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="overdue">Terlambat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatRupiah(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Diskon</span>
                  <span className="font-mono">-{formatRupiah(invoice.discount)}</span>
                </div>
              )}
              {invoice.shipping_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="font-mono">{formatRupiah(invoice.shipping_cost)}</span>
                </div>
              )}
              {invoice.apply_vat && invoice.vat_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPN 11%</span>
                  <span className="font-mono">{formatRupiah(invoice.vat_amount)}</span>
                </div>
              )}
              {invoice.down_payment > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Uang Muka (DP)</span>
                  <span className="font-mono">-{formatRupiah(invoice.down_payment)}</span>
                </div>
              )}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="font-mono">{formatRupiah(invoice.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="form-section">
            <p className="text-xs text-muted-foreground">
              Dibuat: {new Date(invoice.created_at).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;