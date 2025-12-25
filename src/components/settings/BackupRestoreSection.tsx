import { useState, useRef } from 'react';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { exportAllData, downloadBackup, restoreData, BackupData } from '@/utils/backupRestore';
import LegacyRestoreSection from './LegacyRestoreSection';

const BackupRestoreSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState({ message: '', percentage: 0 });
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);

  // Restore options
  const [restoreItems, setRestoreItems] = useState(true);
  const [restoreCustomers, setRestoreCustomers] = useState(true);
  const [restoreSuppliers, setRestoreSuppliers] = useState(true);
  const [restoreSales, setRestoreSales] = useState(true);
  const [restorePurchases, setRestorePurchases] = useState(true);
  const [clearExisting, setClearExisting] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const data = await exportAllData(user.id);
      downloadBackup(data);
      toast({
        title: 'Berhasil',
        description: 'Data berhasil diexport ke file JSON',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengexport data',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.version || !data.exportedAt) {
          throw new Error('Format file tidak valid');
        }
        setBackupData(data);
        setShowRestoreDialog(true);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'File backup tidak valid atau rusak',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestore = async () => {
    if (!user || !backupData) return;

    setIsRestoring(true);
    setProgress({ message: 'Initializing...', percentage: 0 });
    
    try {
      const result = await restoreData(
        user.id, 
        backupData, 
        {
          restoreItems,
          restoreCustomers,
          restoreSuppliers,
          restoreSales,
          restorePurchases,
          clearExisting,
        },
        (p) => setProgress(p)
      );

      if (result.success) {
        toast({
          title: "Restore Berhasil",
          description: result.message,
        });
        // Reload page to refresh data
        window.location.reload();
      } else {
        toast({
          title: "Restore Gagal",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during restoration",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
      setShowRestoreDialog(false);
      setBackupData(null);
      setProgress({ message: '', percentage: 0 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Backup Data
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Export semua data (barang, pelanggan, supplier, penjualan, dan pembelian) ke file JSON.
        </p>
        <Button onClick={handleExport} disabled={isExporting} className="gap-2">
          <Download className="w-4 h-4" />
          {isExporting ? 'Mengexport...' : 'Download Backup'}
        </Button>
      </div>

      {/* Import Section */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Restore Data
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Import data dari file backup JSON. Pilih data mana yang ingin direstore.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Pilih File Backup
        </Button>
      </div>

      {/* Legacy Restore Section */}
      <LegacyRestoreSection />

      {/* Info Section */}
      <div className="form-section bg-muted/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Informasi Backup
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• File backup berisi semua data master dan transaksi Anda</li>
          <li>• Format file adalah JSON yang dapat dibaca manusia</li>
          <li>• Backup tidak termasuk pengaturan perusahaan dan pajak</li>
          <li>• Simpan file backup di tempat yang aman</li>
        </ul>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Restore Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              {backupData && (
                <div className="text-left space-y-4">
                  <p>
                    File backup dari: <strong>{new Date(backupData.exportedAt).toLocaleString('id-ID')}</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Barang: {backupData.items.length}</span>
                    <span>Pelanggan: {backupData.customers.length}</span>
                    <span>Supplier: {backupData.suppliers.length}</span>
                    <span>Penjualan: {backupData.sales.length}</span>
                    <span>Pembelian: {backupData.purchases.length}</span>
                  </div>
                  
                  <div className="space-y-3 pt-2 border-t">
                    <p className="font-medium">Pilih data yang akan direstore:</p>
                    {isRestoring && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <p className="text-muted-foreground">{progress.message}</p>
                          <p className="font-medium">{progress.percentage}%</p>
                        </div>
                        <Progress value={progress.percentage} className="h-2" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="restoreItems" 
                          checked={restoreItems} 
                          onCheckedChange={(c) => setRestoreItems(!!c)} 
                        />
                        <Label htmlFor="restoreItems">Barang ({backupData.items.length})</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="restoreCustomers" 
                          checked={restoreCustomers} 
                          onCheckedChange={(c) => setRestoreCustomers(!!c)} 
                        />
                        <Label htmlFor="restoreCustomers">Pelanggan ({backupData.customers.length})</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="restoreSuppliers" 
                          checked={restoreSuppliers} 
                          onCheckedChange={(c) => setRestoreSuppliers(!!c)} 
                        />
                        <Label htmlFor="restoreSuppliers">Supplier ({backupData.suppliers.length})</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="restoreSales" 
                          checked={restoreSales} 
                          onCheckedChange={(c) => setRestoreSales(!!c)} 
                        />
                        <Label htmlFor="restoreSales">Penjualan ({backupData.sales.length})</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="restorePurchases" 
                          checked={restorePurchases} 
                          onCheckedChange={(c) => setRestorePurchases(!!c)} 
                        />
                        <Label htmlFor="restorePurchases">Pembelian ({backupData.purchases.length})</Label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Checkbox 
                        id="clearExisting" 
                        checked={clearExisting} 
                        onCheckedChange={(c) => setClearExisting(!!c)} 
                      />
                      <Label htmlFor="clearExisting" className="text-destructive">
                        Hapus data yang ada sebelum restore
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? 'Merestore...' : 'Restore Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BackupRestoreSection;
