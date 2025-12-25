import { useState, useRef } from 'react';
import { Upload, Database, AlertTriangle, History, CheckCircle2 } from 'lucide-react';
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
import {
  LegacyBackupData,
  isLegacyBackup,
  analyzeLegacyBackup,
  restoreLegacyData,
} from '@/utils/legacyBackupRestore';

const LegacyRestoreSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState({ message: '', percentage: 0 });
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [backupData, setBackupData] = useState<LegacyBackupData | null>(null);
  const [analysis, setAnalysis] = useState<{
    salesCount: number;
    purchasesCount: number;
    itemsCount: number;
    customersCount: number;
    suppliersCount: number;
  } | null>(null);

  // Restore options
  const [restoreItems, setRestoreItems] = useState(true);
  const [restoreCustomers, setRestoreCustomers] = useState(true);
  const [restoreSuppliers, setRestoreSuppliers] = useState(true);
  const [restoreSales, setRestoreSales] = useState(true);
  const [restorePurchases, setRestorePurchases] = useState(true);
  const [clearExisting, setClearExisting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (!isLegacyBackup(data)) {
          toast({
            variant: 'destructive',
            title: 'Format tidak sesuai',
            description: 'File ini bukan backup dari sistem lama. Gunakan fitur Restore Data biasa.',
          });
          return;
        }

        setBackupData(data);
        const analysisResult = analyzeLegacyBackup(data);
        setAnalysis(analysisResult);
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
      const restoreOptions = {
        restoreItems,
        restoreCustomers,
        restoreSuppliers,
        restoreSales,
        restorePurchases,
        clearExisting,
      };

      const result = await restoreLegacyData(
        user.id,
        backupData,
        restoreOptions,
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
      setAnalysis(null);
      setProgress({ message: '', percentage: 0 });
    }
  };

  return (
    <div className="form-section border-2 border-dashed border-primary/30 bg-primary/5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        Restore dari Sistem Lama
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Import data dari backup sistem akuntansi lama (format dengan penjualan, pembelian, barang, dll). 
        Semua data termasuk transaksi dan master data akan dikonversi ke format sistem baru.
      </p>
      
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Data yang akan diimport:
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1 ml-6">
          <li>• <strong>Barang</strong> - Kode, nama, satuan, dan harga</li>
          <li>• <strong>Pelanggan</strong> - Dari data penjualan dan partyDetails</li>
          <li>• <strong>Supplier</strong> - Dari data pembelian dan partyDetails</li>
          <li>• <strong>Penjualan</strong> - Semua transaksi penjualan dengan item-itemnya</li>
          <li>• <strong>Pembelian</strong> - Semua transaksi pembelian dengan item-itemnya</li>
        </ul>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button 
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
        variant="default"
      >
        <Upload className="w-4 h-4" />
        Pilih File Backup Lama
      </Button>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Restore dari Sistem Lama
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-left space-y-4">
                {analysis && (
                  <>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Ringkasan Data:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-muted-foreground" />
                          Barang: <strong>{analysis.itemsCount}</strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-muted-foreground" />
                          Pelanggan: <strong>{analysis.customersCount}</strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-muted-foreground" />
                          Supplier: <strong>{analysis.suppliersCount}</strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-muted-foreground" />
                          Penjualan: <strong>{analysis.salesCount}</strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-muted-foreground" />
                          Pembelian: <strong>{analysis.purchasesCount}</strong>
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2 border-t">
                      <p className="font-medium">Pilih data yang akan direstore:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="restoreItemsLegacy" 
                            checked={restoreItems} 
                            onCheckedChange={(c) => setRestoreItems(!!c)} 
                          />
                          <Label htmlFor="restoreItemsLegacy">Barang ({analysis.itemsCount})</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="restoreCustomersLegacy" 
                            checked={restoreCustomers} 
                            onCheckedChange={(c) => setRestoreCustomers(!!c)} 
                          />
                          <Label htmlFor="restoreCustomersLegacy">Pelanggan ({analysis.customersCount})</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="restoreSuppliersLegacy" 
                            checked={restoreSuppliers} 
                            onCheckedChange={(c) => setRestoreSuppliers(!!c)} 
                          />
                          <Label htmlFor="restoreSuppliersLegacy">Supplier ({analysis.suppliersCount})</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="restoreSalesLegacy" 
                            checked={restoreSales} 
                            onCheckedChange={(c) => setRestoreSales(!!c)} 
                          />
                          <Label htmlFor="restoreSalesLegacy">Penjualan ({analysis.salesCount})</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="restorePurchasesLegacy" 
                            checked={restorePurchases} 
                            onCheckedChange={(c) => setRestorePurchases(!!c)} 
                          />
                          <Label htmlFor="restorePurchasesLegacy">Pembelian ({analysis.purchasesCount})</Label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Checkbox 
                          id="clearExistingLegacy" 
                          checked={clearExisting} 
                          onCheckedChange={(c) => setClearExisting(!!c)} 
                        />
                        <Label htmlFor="clearExistingLegacy" className="text-destructive">
                          Hapus data yang ada sebelum restore
                        </Label>
                      </div>
                    </div>

                    {isRestoring && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <p className="text-muted-foreground">{progress.message}</p>
                          <p className="font-medium">{progress.percentage}%</p>
                        </div>
                        <Progress value={progress.percentage} className="h-2" />
                      </div>
                    )}
                  </>
                )}
              </div>
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

export default LegacyRestoreSection;
