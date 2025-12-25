import { Printer } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePrintSettings } from '@/hooks/usePrintSettings';

const PrintSettingsSection = () => {
  const { settings, toggleDotMatrix } = usePrintSettings();

  return (
    <div className="space-y-6">
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Pengaturan Cetak
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="space-y-1">
              <Label htmlFor="dot-matrix" className="text-base font-medium">
                Mode Dot Matrix
              </Label>
              <p className="text-sm text-muted-foreground">
                Aktifkan untuk menggunakan format cetak dot matrix (teks monospace 80 kolom) 
                yang cocok untuk printer dot matrix atau thermal.
              </p>
            </div>
            <Switch
              id="dot-matrix"
              checked={settings.useDotMatrix}
              onCheckedChange={toggleDotMatrix}
            />
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Informasi Mode Cetak:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Mode Standard (Default):</strong> Format cetak A4 dengan layout grafis, 
                logo, dan tabel yang rapi. Cocok untuk printer inkjet/laser.
              </li>
              <li>
                <strong>Mode Dot Matrix:</strong> Format teks monospace dengan lebar 80 kolom. 
                Cocok untuk printer dot matrix, thermal, atau POS.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSettingsSection;
