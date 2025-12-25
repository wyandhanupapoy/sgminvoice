import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCompanySettings } from '@/hooks/useCompanySettings';

const CompanySettingsSection = () => {
  const { toast } = useToast();
  const { companyInfo, updateCompanyInfo, resetToDefault } = useCompanySettings();

  const handleSave = () => {
    toast({
      title: 'Berhasil',
      description: 'Informasi perusahaan berhasil disimpan.',
    });
  };

  const handleReset = () => {
    resetToDefault();
    toast({
      title: 'Berhasil',
      description: 'Informasi perusahaan dikembalikan ke default.',
    });
  };

  return (
    <div className="form-section space-y-6">
      <h3 className="text-lg font-semibold">Informasi Perusahaan</h3>
      
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyName">Nama Perusahaan</Label>
          <Input
            id="companyName"
            value={companyInfo.name}
            onChange={(e) => updateCompanyInfo({ name: e.target.value })}
            placeholder="PT. Nama Perusahaan"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyTagline">Tagline / Bidang Usaha</Label>
          <Textarea
            id="companyTagline"
            value={companyInfo.tagline}
            onChange={(e) => updateCompanyInfo({ tagline: e.target.value })}
            placeholder="Deskripsi bidang usaha perusahaan"
            rows={2}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyAddress">Alamat</Label>
          <Textarea
            id="companyAddress"
            value={companyInfo.address}
            onChange={(e) => updateCompanyInfo({ address: e.target.value })}
            placeholder="Alamat lengkap perusahaan"
            rows={2}
          />
        </div>
      </div>

      {/* Contact Persons */}
      <div>
        <h4 className="font-medium mb-3">Contact Person</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactName1">Nama CP 1</Label>
            <Input
              id="contactName1"
              value={companyInfo.contactName1}
              onChange={(e) => updateCompanyInfo({ contactName1: e.target.value })}
              placeholder="Nama"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone1">Telepon CP 1</Label>
            <Input
              id="phone1"
              value={companyInfo.phone1}
              onChange={(e) => updateCompanyInfo({ phone1: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName2">Nama CP 2</Label>
            <Input
              id="contactName2"
              value={companyInfo.contactName2}
              onChange={(e) => updateCompanyInfo({ contactName2: e.target.value })}
              placeholder="Nama"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone2">Telepon CP 2</Label>
            <Input
              id="phone2"
              value={companyInfo.phone2}
              onChange={(e) => updateCompanyInfo({ phone2: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>
      </div>

      {/* Bank Info */}
      <div>
        <h4 className="font-medium mb-3">Informasi Rekening Bank</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Nama Bank</Label>
            <Input
              id="bankName"
              value={companyInfo.bankName}
              onChange={(e) => updateCompanyInfo({ bankName: e.target.value })}
              placeholder="BANK BCA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Nomor Rekening</Label>
            <Input
              id="bankAccount"
              value={companyInfo.bankAccount}
              onChange={(e) => updateCompanyInfo({ bankAccount: e.target.value })}
              placeholder="1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankHolder">Atas Nama</Label>
            <Input
              id="bankHolder"
              value={companyInfo.bankHolder}
              onChange={(e) => updateCompanyInfo({ bankHolder: e.target.value })}
              placeholder="Nama pemilik rekening"
            />
          </div>
        </div>
      </div>

      {/* Other Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyEmail">Email</Label>
          <Input
            id="companyEmail"
            type="email"
            value={companyInfo.email}
            onChange={(e) => updateCompanyInfo({ email: e.target.value })}
            placeholder="info@perusahaan.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyNpwp">NPWP</Label>
          <Input
            id="companyNpwp"
            value={companyInfo.npwp}
            onChange={(e) => updateCompanyInfo({ npwp: e.target.value })}
            placeholder="00.000.000.0-000.000"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Simpan Pengaturan
        </Button>
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset ke Default
        </Button>
      </div>
    </div>
  );
};

export default CompanySettingsSection;
