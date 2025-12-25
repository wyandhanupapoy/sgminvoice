import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Eye, Printer, Download, FileText, Truck, Receipt, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { formatRupiah } from '@/utils/formatters';
import { useSalesData } from '@/hooks/useSalesData';
import { usePurchaseData } from '@/hooks/usePurchaseData';
import { exportSalesToExcel, exportPurchasesToExcel, exportAllToExcel } from '@/utils/excelExport';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/shared/Pagination';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { MonthlyReportGenerator } from '@/components/reports/MonthlyReportGenerator';
import { generateOverdueReport } from '@/utils/pdfReport';

interface Invoice {
  id: string;
  transactionNumber: string;
  type: 'sales' | 'purchase';
  customerName: string;
  date: string;
  dueDate: string | null;
  amount: number;
  status: string;
  hasVat: boolean;
}

const Invoices = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sales, updateSaleStatus } = useSalesData();
  const { purchases, updatePurchaseStatus } = usePurchaseData();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Update status filter when URL changes
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const clearStatusFilter = () => {
    setStatusFilter('all');
    // Remove status from URL
    navigate('/invoices', { replace: true });
  };

  const handleExportSales = () => {
    if (sales.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Tidak ada data penjualan untuk diexport' });
      return;
    }
    exportSalesToExcel(sales);
    toast({ title: 'Berhasil', description: 'Data penjualan berhasil diexport' });
  };

  const handleExportPurchases = () => {
    if (purchases.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Tidak ada data pembelian untuk diexport' });
      return;
    }
    exportPurchasesToExcel(purchases);
    toast({ title: 'Berhasil', description: 'Data pembelian berhasil diexport' });
  };

  const handleExportAll = () => {
    if (sales.length === 0 && purchases.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Tidak ada data untuk diexport' });
      return;
    }
    exportAllToExcel(sales, purchases);
    toast({ title: 'Berhasil', description: 'Semua data berhasil diexport' });
  };

  const handleExportOverduePdf = async () => {
    const overdueCount = allInvoices.filter(i => i.status === 'overdue').length;
    if (overdueCount === 0) {
      toast({ variant: 'destructive', title: 'Tidak ada faktur terlambat', description: 'Tidak ada faktur yang terlambat untuk diexport' });
      return;
    }
    await generateOverdueReport(sales, purchases);
    toast({ title: 'Berhasil', description: 'Laporan faktur terlambat berhasil diexport' });
  };

  // Helper to check if invoice is overdue
  const isOverdue = (dueDate: string | null, status: string): boolean => {
    if (!dueDate || status === 'paid') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Get effective status (auto-detect overdue)
  const getEffectiveStatus = (dueDate: string | null, status: string): string => {
    if (isOverdue(dueDate, status)) return 'overdue';
    return status;
  };

  const allInvoices: Invoice[] = [
    ...sales.map(s => ({
      id: s.id,
      transactionNumber: s.transaction_number,
      type: 'sales' as const,
      customerName: s.customer_name,
      date: s.transaction_date,
      dueDate: s.due_date,
      amount: Number(s.grand_total),
      status: getEffectiveStatus(s.due_date, s.status),
      hasVat: s.apply_vat,
    })),
    ...purchases.map(p => ({
      id: p.id,
      transactionNumber: p.transaction_number,
      type: 'purchase' as const,
      customerName: p.supplier_name,
      date: p.transaction_date,
      dueDate: p.due_date,
      amount: Number(p.grand_total),
      status: getEffectiveStatus(p.due_date, p.status),
      hasVat: p.apply_vat,
    })),
  ];

  const filteredInvoices = allInvoices.filter((invoice) => {
    const matchesSearch = 
      invoice.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || invoice.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Date filter
    const invoiceDate = new Date(invoice.date);
    const matchesStartDate = !startDate || invoiceDate >= startDate;
    const matchesEndDate = !endDate || invoiceDate <= endDate;
    
    return matchesSearch && matchesType && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const invoicesPagination = usePagination({ data: filteredInvoices, itemsPerPage: 10 });

  // Reset pagination when filters change
  useEffect(() => {
    invoicesPagination.resetPage();
  }, [searchQuery, typeFilter, statusFilter, startDate, endDate]);



  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Data <span className="text-gradient">Faktur</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1 text-sm sm:text-base">
            Kelola dan monitor semua transaksi perdagangan
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <MonthlyReportGenerator />
          <Button 
            variant="outline" 
            className="rounded-xl font-bold gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive/30 transition-all"
            onClick={handleExportOverduePdf}
          >
            <AlertTriangle className="w-4 h-4" />
            PDF Terlambat
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl font-bold gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all">
                <Download className="w-4 h-4" />
                Export Excel
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-2">
              <DropdownMenuItem onClick={handleExportSales} className="rounded-lg font-medium">
                Export Penjualan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPurchases} className="rounded-lg font-medium">
                Export Pembelian
              </DropdownMenuItem>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem onClick={handleExportAll} className="rounded-lg font-bold text-primary">
                Export Semua
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor transaksi, pelanggan, atau supplier..."
                className="pl-12 h-12 bg-white/50 border-none rounded-2xl ring-1 ring-border group-focus-within:ring-2 group-focus-within:ring-primary/50 transition-all text-sm font-medium"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {searchParams.get('status') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
                  onClick={clearStatusFilter}
                >
                  <X className="w-4 h-4" />
                  Reset URL
                </Button>
              )}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] h-12 rounded-2xl border-none ring-1 ring-border bg-white/50 font-bold text-xs uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" />
                    <SelectValue placeholder="Tipe" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="sales">Penjualan</SelectItem>
                  <SelectItem value="purchase">Pembelian</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-12 rounded-2xl border-none ring-1 ring-border bg-white/50 font-bold text-xs uppercase tracking-wider">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Terlambat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-white/30 rounded-2xl p-1 inline-block self-start">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClear={clearDateFilter}
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="form-section">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-[hsl(var(--table-header))] z-10">No. Transaksi</th>
                  <th className="hidden sm:table-cell">Tipe</th>
                  <th>Pelanggan/Supplier</th>
                  <th className="hidden md:table-cell">Tanggal</th>
                  <th className="hidden lg:table-cell">Jatuh Tempo</th>
                  <th className="text-right">Jumlah</th>
                  <th className="hidden sm:table-cell">PPN</th>
                  <th>Status</th>
                  <th className="text-center sticky right-0 bg-[hsl(var(--table-header))] z-10">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      Tidak ada faktur yang ditemukan
                    </td>
                  </tr>
                ) : (
                  invoicesPagination.paginatedData.map((invoice) => (
                    <tr key={invoice.id} className={invoice.status === 'overdue' ? 'bg-destructive/10' : ''}>
                      <td className="font-mono text-[10px] sm:text-xs sticky left-0 bg-card z-10">{invoice.transactionNumber}</td>
                      <td className="hidden sm:table-cell">
                        <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                          invoice.type === 'sales' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {invoice.type === 'sales' ? 'Penjualan' : 'Pembelian'}
                        </span>
                      </td>
                      <td className="max-w-[120px] sm:max-w-none truncate">{invoice.customerName}</td>
                      <td className="hidden md:table-cell text-[10px] sm:text-xs">{invoice.date}</td>
                      <td className="hidden lg:table-cell text-[10px] sm:text-xs">{invoice.dueDate || <span className="text-muted-foreground">-</span>}</td>
                      <td className="text-right font-mono text-[10px] sm:text-xs whitespace-nowrap">{formatRupiah(invoice.amount)}</td>
                      <td className="hidden sm:table-cell">
                        {invoice.hasVat ? (
                          <span className="text-[10px] sm:text-xs text-muted-foreground">PPN</span>
                        ) : (
                          <span className="text-[10px] sm:text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td>
                        <Select 
                          value={invoice.status} 
                          onValueChange={(value) => {
                            if (invoice.type === 'sales') {
                              updateSaleStatus(invoice.id, value);
                            } else {
                              updatePurchaseStatus(invoice.id, value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[90px] sm:w-[110px] h-7 sm:h-8 text-[10px] sm:text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-warning"></span>
                                Pending
                              </span>
                            </SelectItem>
                            <SelectItem value="paid">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-success"></span>
                              Lunas
                            </span>
                          </SelectItem>
                          <SelectItem value="overdue">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-destructive"></span>
                              Terlambat
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      </td>
                      <td className="sticky right-0 bg-card z-10">
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={() => navigate(`/invoices/${invoice.id}?type=${invoice.type}`)}
                            title="Lihat Detail"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                title="Cetak"
                              >
                                <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}?type=${invoice.type}&print=invoice`)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}?type=${invoice.type}&print=surat-jalan`)}>
                                <Truck className="w-4 h-4 mr-2" />
                                Surat Jalan
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}?type=${invoice.type}&print=kwitansi`)}>
                                <Receipt className="w-4 h-4 mr-2" />
                                Kwitansi
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          currentPage={invoicesPagination.currentPage}
          totalPages={invoicesPagination.totalPages}
          onPageChange={invoicesPagination.goToPage}
          startIndex={invoicesPagination.startIndex}
          endIndex={invoicesPagination.endIndex}
          totalItems={invoicesPagination.totalItems}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="form-section">
          <p className="text-sm text-muted-foreground">Total Penjualan</p>
          <p className="text-2xl font-bold text-success mt-1">
            {formatRupiah(allInvoices.filter(i => i.type === 'sales').reduce((sum, i) => sum + i.amount, 0))}
          </p>
        </div>
        <div className="form-section">
          <p className="text-sm text-muted-foreground">Total Pembelian</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatRupiah(allInvoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.amount, 0))}
          </p>
        </div>
        <div className="form-section">
          <p className="text-sm text-muted-foreground">Transaksi Pending</p>
          <p className="text-2xl font-bold text-warning mt-1">
            {allInvoices.filter(i => i.status === 'pending').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
