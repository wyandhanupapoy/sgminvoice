import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCompanyInfo } from '@/hooks/useCompanySettings';
import { formatRupiah } from '@/utils/formatters';

interface DueInvoice {
  id: string;
  transactionNumber: string;
  type: 'sales' | 'purchase';
  customerName: string;
  customerEmail: string;
  dueDate: string;
  amount: number;
  daysUntilDue: number;
}

interface EmailReminderDialogProps {
  invoices: DueInvoice[];
}

export const EmailReminderDialog = ({ invoices }: EmailReminderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const invoicesWithEmail = invoices.filter(inv => inv.customerEmail);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoicesWithEmail.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, id]);
    } else {
      setSelectedInvoices(prev => prev.filter(i => i !== id));
    }
  };

  const handleSendReminders = async () => {
    if (selectedInvoices.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Pilih faktur',
        description: 'Pilih minimal satu faktur untuk dikirim reminder.',
      });
      return;
    }

    setSending(true);
    try {
      const companyInfo = getCompanyInfo();
      const selectedData = invoices
        .filter(inv => selectedInvoices.includes(inv.id))
        .map(inv => ({
          transactionNumber: inv.transactionNumber,
          customerName: inv.customerName,
          customerEmail: inv.customerEmail,
          dueDate: inv.dueDate,
          amount: inv.amount,
          type: inv.type,
        }));

      const { data, error } = await supabase.functions.invoke('send-invoice-reminder', {
        body: {
          invoices: selectedData,
          companyName: companyInfo.name,
          companyEmail: companyInfo.email,
        },
      });

      if (error) throw error;

      toast({
        title: 'Email Terkirim',
        description: `Berhasil mengirim ${data.sent} email reminder. ${data.failed > 0 ? `Gagal: ${data.failed}` : ''}`,
      });

      setOpen(false);
      setSelectedInvoices([]);
    } catch (error: any) {
      console.error('Error sending reminders:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim',
        description: error.message || 'Terjadi kesalahan saat mengirim email.',
      });
    } finally {
      setSending(false);
    }
  };

  const getDueBadge = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Terlambat {Math.abs(daysUntilDue)} hari</span>;
    } else if (daysUntilDue === 0) {
      return <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">Hari ini</span>;
    } else {
      return <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{daysUntilDue} hari lagi</span>;
    }
  };

  if (invoices.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail className="w-4 h-4" />
          Kirim Email Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Kirim Email Reminder</DialogTitle>
          <DialogDescription>
            Pilih faktur yang ingin dikirimkan email pengingat. Hanya faktur dengan email pelanggan yang dapat dikirim.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {invoicesWithEmail.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ada faktur dengan alamat email pelanggan.</p>
              <p className="text-sm">Tambahkan email pelanggan di data master untuk menggunakan fitur ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  checked={selectedInvoices.length === invoicesWithEmail.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">Pilih Semua ({invoicesWithEmail.length} faktur)</span>
              </div>
              
              {invoicesWithEmail.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                    selectedInvoices.includes(invoice.id) ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <Checkbox
                    checked={selectedInvoices.includes(invoice.id)}
                    onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-medium">{invoice.transactionNumber}</span>
                      {getDueBadge(invoice.daysUntilDue)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{invoice.customerName}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium">{formatRupiah(invoice.amount)}</p>
                    <p className="text-xs text-muted-foreground">Jatuh tempo: {invoice.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSendReminders}
            disabled={sending || selectedInvoices.length === 0}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Kirim ({selectedInvoices.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
