import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Info, 
  CheckCircle2, 
  User, 
  Printer, 
  Download, 
  Users, 
  Package,
  AlertCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Receipt,
  Truck,
  Database,
  Percent,
  Search,
  Plus
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const UserGuideDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-300">
          <HelpCircle className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98vw] sm:w-[95vw] max-w-5xl h-[98vh] sm:h-[90vh] p-0 overflow-hidden border-white/20 glass-card flex flex-col">
        <DialogHeader className="p-4 sm:p-6 border-b border-white/10 bg-primary/5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-2xl shadow-inner">
              <Info className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-3xl font-extrabold tracking-tight">Manual Operasional <span className="text-gradient">Staf</span></DialogTitle>
              <DialogDescription className="sr-only">
                Panduan lengkap penggunaan sistem mekar sales purchase untuk staf operasional.
              </DialogDescription>
              <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                <Badge variant="outline" className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">Versi 1.1.1</Badge>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-widest">PT. Sumber Ganda Mekar</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex flex-col flex-1 min-h-0">
          <div className="px-4 sm:px-6 py-2 border-b border-white/10 bg-white/20 backdrop-blur-md overflow-x-auto sticky top-0 z-20">
            <TabsList className="bg-transparent border-none p-0 h-auto gap-1 sm:gap-2 flex flex-nowrap justify-start min-w-max">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:shadow-xl data-[state=active]:text-white rounded-xl px-4 py-2.5 font-bold text-[10px] sm:text-xs transition-all flex items-center gap-2 group">
                <div className="p-1.5 rounded-lg bg-primary/10 group-data-[state=active]:bg-white/20 transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                </div>
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:shadow-xl data-[state=active]:text-white rounded-xl px-4 py-2.5 font-bold text-[10px] sm:text-xs transition-all flex items-center gap-2 group">
                <div className="p-1.5 rounded-lg bg-success/10 group-data-[state=active]:bg-white/20 transition-colors">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                Transaksi
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-primary data-[state=active]:shadow-xl data-[state=active]:text-white rounded-xl px-4 py-2.5 font-bold text-[10px] sm:text-xs transition-all flex items-center gap-2 group">
                <div className="p-1.5 rounded-lg bg-amber-500/10 group-data-[state=active]:bg-white/20 transition-colors">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                Cetak & Laporan
              </TabsTrigger>
              <TabsTrigger value="master" className="data-[state=active]:bg-primary data-[state=active]:shadow-xl data-[state=active]:text-white rounded-xl px-4 py-2.5 font-bold text-[10px] sm:text-xs transition-all flex items-center gap-2 group">
                <div className="p-1.5 rounded-lg bg-slate-500/10 group-data-[state=active]:bg-white/20 transition-colors">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                Master Data
              </TabsTrigger>
              <TabsTrigger value="backup" className="data-[state=active]:bg-primary data-[state=active]:shadow-xl data-[state=active]:text-white rounded-xl px-4 py-2.5 font-bold text-[10px] sm:text-xs transition-all flex items-center gap-2 group">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 group-data-[state=active]:bg-white/20 transition-colors">
                  <Database className="w-3.5 h-3.5" />
                </div>
                Backup & Pajak
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-10 space-y-12">
            {/* 1. Dashboard & Access */}
            <TabsContent value="overview" className="m-0 space-y-10">
              <div className="animate-entry">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-primary" />
                  Akses & Dashboard
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] glass-card bg-primary/5 border-primary/10">
                      <h4 className="text-lg font-bold mb-3">Cara Masuk (Login)</h4>
                      <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</div>
                          Gunakan email resmi perusahaan dan password yang telah diberikan oleh IT.
                        </li>
                        <li className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</div>
                          Sistem akan menjaga sesi Anda tetap aktif selama 24 jam kecuali Anda menekan tombol "Keluar".
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-6 rounded-[2rem] glass-card bg-amber-500/5 border-amber-500/10">
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Peringatan Penting
                      </h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-white/50 rounded-xl border border-destructive/10">
                          <p className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                            <TrendingDown className="w-3 h-3" /> Faktur Terlambat
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Jika muncul kartu merah di dashboard, segera hubungi pelanggan untuk penagihan atau supplier untuk pelunasan.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      Statistik Utama
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-primary/5 transition-colors">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Analisis Keuangan</p>
                          <p className="text-xs text-muted-foreground mt-1">Grafik perbandingan Penjualan vs Pembelian membantu memantau profitabilitas bulanan.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-purple-500/5 transition-colors">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl">
                          <Eye className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Filter Tanggal</p>
                          <p className="text-xs text-muted-foreground mt-1">Gunakan "Pilih Rentang Tanggal" di dashboard untuk melihat performa pada periode tertentu.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 2. Transactions */}
            <TabsContent value="transactions" className="m-0 space-y-10">
              <div className="animate-entry">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-success" />
                  Alur Penjualan & Pembelian
                </h3>

                <div className="relative border-l-2 border-dashed border-primary/20 ml-2 sm:ml-4 pl-6 sm:pl-10 space-y-12">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[37px] sm:-left-[54px] top-0 p-2 sm:p-3 bg-white rounded-2xl shadow-lg border border-primary/20 z-10 transition-transform hover:scale-110">
                      <Users className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="glass-card p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] group hover:bg-white transition-all hover:shadow-xl">
                      <h4 className="font-bold text-sm sm:text-lg mb-2">Langkah 1: Identitas & Perpajakan</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">Pilih Pelanggan atau Supplier. Tentukan tanggal transaksi dan jatuh tempo.</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] sm:text-[10px] font-bold">Wajib Diisi</Badge>
                        <Badge variant="outline" className="text-[8px] sm:text-[10px] border-success text-success">Opsi Bebas PPN (0%)</Badge>
                        <Badge variant="outline" className="text-[8px] sm:text-[10px] border-amber-500 text-amber-500">Opsi PPN 11%</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-[37px] sm:-left-[54px] top-0 p-2 sm:p-3 bg-white rounded-2xl shadow-lg border border-success/20 z-10 transition-transform hover:scale-110">
                      <Package className="w-4 h-4 sm:w-6 sm:h-6 text-success" />
                    </div>
                    <div className="glass-card p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] group hover:bg-white transition-all hover:shadow-xl">
                      <h4 className="font-bold text-sm sm:text-lg mb-2">Langkah 2: Detail Barang</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">Klik 'Tambah Item'. Cari produk, masukkan QTY dan harga. Jika ada diskon, masukkan langsung di baris item tersebut.</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[8px] sm:text-[10px]">Stok Real-time</Badge>
                        <Badge variant="outline" className="text-[8px] sm:text-[10px]">Harga Fleksibel</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-[37px] sm:-left-[54px] top-0 p-2 sm:p-3 bg-white rounded-2xl shadow-lg border border-amber-500/20 z-10 transition-transform hover:scale-110">
                      <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500" />
                    </div>
                    <div className="glass-card p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] group hover:bg-white transition-all hover:shadow-xl">
                      <h4 className="font-bold text-sm sm:text-lg mb-2">Langkah 3: Finalisasi</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">Tinjau total. Tambahkan catatan jika perlu (misal: "Titip Driver"). Klik Simpan untuk menerbitkan nomor transaksi.</p>
                      <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] sm:text-[10px] font-bold uppercase">Sistem Otomatis No. Urut</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 3. Invoices & Reports */}
            <TabsContent value="invoices" className="m-0 space-y-10">
              <div className="animate-entry">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Printer className="w-6 h-6 text-amber-500" />
                  Manajemen Dokumen & Laporan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 glass-card rounded-3xl border-primary/10">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-bold mb-2">Cetak Faktur</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Digunakan untuk penagihan ke pelanggan. Mencakup detail PPN 11% atau PPN Bebas.</p>
                  </div>
                  <div className="p-6 glass-card rounded-3xl border-success/10">
                    <div className="h-12 w-12 bg-success/10 rounded-2xl flex items-center justify-center mb-4">
                      <Truck className="w-6 h-6 text-success" />
                    </div>
                    <h4 className="font-bold mb-2">Surat Jalan</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Dokumen wajib untuk driver. Hanya mencetak item dan QTY tanpa menampilkan harga.</p>
                  </div>
                  <div className="p-6 glass-card rounded-3xl border-amber-500/10">
                    <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                      <Receipt className="w-6 h-6 text-amber-500" />
                    </div>
                    <h4 className="font-bold mb-2">Kwitansi</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Bukti tanda terima pembayaran setelah transaksi lunas atau DP diterima.</p>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-slate-900 text-white shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-success" />
                      </div>
                      <h4 className="text-lg font-bold">Laporan Bulanan & Excel</h4>
                    </div>
                    <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                      Butuh data transaksi untuk akuntansi? Gunakan fitur <span className="text-primary font-bold">Export Excel</span> di halaman Faktur. Anda bisa filter berdasarkan tanggal atau status (Lunas/Pending/Terlambat).
                    </p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-primary rounded-xl text-xs font-bold hover:bg-primary/80 transition-all flex items-center gap-2">
                        <Download className="w-3.5 h-3.5" /> Bulk Export
                      </button>
                      <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-all">
                        Laporan PPN
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 4. Master Data */}
            <TabsContent value="master" className="m-0 space-y-10">
              <div className="animate-entry">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-slate-500" />
                  Manajemen Data Master
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl glass-card border-slate-200">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Barang & Harga
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Setiap barang memiliki <b>Harga Satuan</b> default. Perubahan harga di sini tidak akan mengubah transaksi lama, tapi akan menjadi harga suggesti untuk transaksi baru.
                      </p>
                      <div className="p-3 bg-muted/50 rounded-xl text-[10px] font-mono leading-tight">
                        Tips: Gunakan sistem kode (contoh: STL-001) agar pencarian di formulir transaksi menjadi lebih cepat.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl glass-card border-slate-200">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Relasi Bisnis
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl">
                          <Plus className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold">Input NPWP Pelanggan untuk Faktur Pajak otomatis.</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl">
                          <Search className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold">Cari Supplier berdasarkan No. HP atau Nama.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 5. Backup & Taxes */}
            <TabsContent value="backup" className="m-0 space-y-10">
              <div className="animate-entry">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Database className="w-6 h-6 text-indigo-500" />
                  Backup Data & Manajemen Pajak
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2rem] glass-card border-indigo-100 bg-indigo-50/10">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-indigo-500" />
                      Konfigurasi PPN
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      Sistem mendukung dual-mode pajak. Di tab <b>Pajak</b> pada pengaturan, Anda dapat melihat tarif PPN (11%) dan PPh (22%) yang berlaku. Saat transaksi, Anda bisa memilih:
                    </p>
                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                        <p className="text-xs font-bold text-indigo-600 mb-1 leading-none">Bebas PPN</p>
                        <p className="text-[10px] text-muted-foreground">Transaksi tidak dikenakan tambahan pajak (untuk pelanggan non-PKP).</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                        <p className="text-xs font-bold text-indigo-600 mb-1 leading-none">Berikat (PPN 11%)</p>
                        <p className="text-[10px] text-muted-foreground">Sistem akan otomatis menghitung 11% dari DPP dan menambahkannya ke Grand Total.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 rounded-[2rem] glass-card bg-emerald-500/5 border-emerald-500/10">
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-emerald-700">
                        <Database className="w-5 h-5" />
                        Amankan Data Anda
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                        Sangat disarankan untuk melakukan <b>Backup Data</b> setiap hari setelah jam kantor berakhir.
                      </p>
                      <ul className="space-y-4">
                        <li className="flex gap-3 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          Download file JSON backup dan simpan di Cloud atau Flashdisk.
                        </li>
                        <li className="flex gap-3 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          Fitur Restore dapat memulihkan seluruh data dalam sekejap jika terjadi kendala teknis.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>

          {/* Footer Info */}
          <div className="p-4 sm:px-8 sm:py-4 border-t border-white/10 bg-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sistem Operasional Berjalan Normal</p>
            </div>
            <div className="flex items-center gap-4 order-1 sm:order-2">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Bantuan Teknis: <span className="font-bold text-primary">sumbergandamekar@gmail.com</span></p>
              <div className="hidden sm:inline w-px h-4 bg-white/40" />
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">Phone: (022) 7536459</p>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserGuideDialog;
