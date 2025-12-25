import { InvoiceDetail } from '@/hooks/useInvoiceDetail';
import { getCompanyInfo } from '@/hooks/useCompanySettings';

// Number to words in Indonesian
const numberToWords = (num: number): string => {
  const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  
  if (num < 12) return units[num];
  if (num < 20) return units[num - 10] + ' belas';
  if (num < 100) return units[Math.floor(num / 10)] + ' puluh' + (num % 10 ? ' ' + units[num % 10] : '');
  if (num < 200) return 'seratus' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 1000) return units[Math.floor(num / 100)] + ' ratus' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 2000) return 'seribu' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' ribu' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 1000000000) return numberToWords(Math.floor(num / 1000000)) + ' juta' + (num % 1000000 ? ' ' + numberToWords(num % 1000000) : '');
  if (num < 1000000000000) return numberToWords(Math.floor(num / 1000000000)) + ' milyar' + (num % 1000000000 ? ' ' + numberToWords(num % 1000000000) : '');
  return numberToWords(Math.floor(num / 1000000000000)) + ' triliun' + (num % 1000000000000 ? ' ' + numberToWords(num % 1000000000000) : '');
};

export const terbilang = (amount: number): string => {
  if (amount === 0) return 'nol rupiah';
  return numberToWords(Math.floor(amount)) + ' rupiah';
};

const LINE_WIDTH = 80;

const centerText = (text: string): string => {
  const padding = Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2));
  return ' '.repeat(padding) + text;
};

const leftRight = (left: string, right: string, width: number = LINE_WIDTH): string => {
  const spaces = width - left.length - right.length;
  return left + ' '.repeat(Math.max(1, spaces)) + right;
};

const separator = (char: string = '-'): string => char.repeat(LINE_WIDTH);

const formatCurrency = (value: number): string => {
  return 'Rp ' + value.toLocaleString('id-ID');
};

const formatCurrencyShort = (value: number): string => {
  return value.toLocaleString('id-ID');
};

const truncate = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 2) + '..';
};

const formatDateDot = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// ==================== INVOICE DOT MATRIX ====================
export const printInvoiceDotMatrix = (invoice: InvoiceDetail): void => {
  const COMPANY_INFO = getCompanyInfo();
  const lines: string[] = [];
  const invoiceNumber = invoice.transaction_number.replace('SGM.PJ.', 'SGM.PJF.');
  const isVatExempt = invoice.vat_exempt || (!invoice.apply_vat);
  const phoneInfo = `CP. ${COMPANY_INFO.contactName1}: ${COMPANY_INFO.phone1}, ${COMPANY_INFO.contactName2}: ${COMPANY_INFO.phone2}`;
  const bankInfo = `${COMPANY_INFO.bankName} ${COMPANY_INFO.bankAccount} a.n ${COMPANY_INFO.bankHolder}`;

  // Header
  lines.push(separator('='));
  lines.push(centerText(COMPANY_INFO.name));
  lines.push(centerText(truncate(COMPANY_INFO.tagline, LINE_WIDTH - 4)));
  lines.push(centerText(COMPANY_INFO.address));
  lines.push(centerText(phoneInfo));
  lines.push(separator('='));
  lines.push('');

  // Title
  lines.push(centerText('[ INVOICE PENJUALAN ]'));
  lines.push(separator('-'));
  lines.push('');

  // Info Grid
  lines.push(leftRight(`Kepada Yth : ${truncate(invoice.party_name, 30)}`, `No. Invoice : ${invoiceNumber}`));
  lines.push(leftRight(`Alamat     : ${truncate(invoice.party_address || '-', 30)}`, `Tanggal     : ${formatDateDot(invoice.transaction_date)}`));
  lines.push(leftRight(`NPWP/NIK   : ${invoice.party_npwp || '-'}`, `Pembayaran  : ${invoice.payment_method === 'transfer' ? 'Transfer' : 'Tunai'}`));
  lines.push('');
  lines.push(separator('='));

  // Items Header
  lines.push('No  Nama Barang                   Qty     Satuan    Harga      Jumlah');
  lines.push(separator('-'));

  // Items
  invoice.items.forEach((item, index) => {
    const no = String(index + 1).padEnd(4);
    const name = truncate(item.item_name, 28).padEnd(28);
    const qty = String(item.quantity).padStart(6);
    const unit = item.unit.substring(0, 8).padEnd(10);
    const price = formatCurrencyShort(item.unit_price).padStart(10);
    const total = formatCurrencyShort(item.total).padStart(12);
    
    lines.push(`${no}${name}${qty}  ${unit}${price}${total}`);
  });

  lines.push(separator('='));
  lines.push('');

  // Summary
  const summaryWidth = 40;
  const summaryLine = (label: string, value: string): string => {
    return ' '.repeat(LINE_WIDTH - summaryWidth) + label.padEnd(20) + ':' + value.padStart(18);
  };

  lines.push(summaryLine('Subtotal', formatCurrency(invoice.subtotal)));
  
  if (invoice.discount > 0) {
    lines.push(summaryLine('Diskon', '-' + formatCurrency(invoice.discount)));
  }
  
  if (invoice.apply_vat && invoice.vat_amount > 0) {
    lines.push(summaryLine('PPN 11%', formatCurrency(invoice.vat_amount)));
  } else {
    lines.push(summaryLine('PPN 11%', 'DIBEBASKAN'));
  }
  
  if (invoice.shipping_cost > 0) {
    lines.push(summaryLine('Ongkos Kirim', formatCurrency(invoice.shipping_cost)));
  }

  lines.push(' '.repeat(LINE_WIDTH - summaryWidth) + separator('-').substring(0, summaryWidth));
  lines.push(summaryLine('TOTAL TAGIHAN', formatCurrency(invoice.grand_total)));
  lines.push('');

  // Terbilang
  lines.push(`Terbilang: ${terbilang(invoice.grand_total)}`);
  if (isVatExempt) {
    lines.push('(Transaksi Dibebaskan dari Pengenaan PPN)');
  }
  lines.push('');
  lines.push(separator('-'));

  // Bank Info
  lines.push('');
  lines.push(centerText(`Pembayaran ke: ${bankInfo}`));
  lines.push('');
  lines.push(separator('-'));

  // Signature
  lines.push('');
  lines.push(leftRight('Penerima,', 'Hormat Kami,'));
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push(leftRight('(________________)', `(${COMPANY_INFO.name})`));
  lines.push('');
  lines.push(separator('='));
  lines.push(centerText(`Dicetak: ${new Date().toLocaleString('id-ID')}`));

  openPrintWindow('Invoice', invoice.transaction_number, lines.join('\n'));
};

// ==================== SURAT JALAN DOT MATRIX ====================
export const printSuratJalanDotMatrix = (invoice: InvoiceDetail): void => {
  const COMPANY_INFO = getCompanyInfo();
  const lines: string[] = [];
  const sjNumber = invoice.transaction_number.replace('SGM.PJ.', 'SGM.SJF.');
  const phoneInfo = `CP. ${COMPANY_INFO.contactName1}: ${COMPANY_INFO.phone1}, ${COMPANY_INFO.contactName2}: ${COMPANY_INFO.phone2}`;

  // Header
  lines.push(separator('='));
  lines.push(centerText(COMPANY_INFO.name));
  lines.push(centerText(truncate(COMPANY_INFO.tagline, LINE_WIDTH - 4)));
  lines.push(centerText(COMPANY_INFO.address));
  lines.push(centerText(phoneInfo));
  lines.push(separator('='));
  lines.push('');

  // Title
  lines.push(centerText('[ SURAT JALAN ]'));
  lines.push(separator('-'));
  lines.push('');

  // Info
  lines.push(leftRight(`Kepada Yth : ${truncate(invoice.party_name, 35)}`, `No. Surat Jalan : ${sjNumber}`));
  lines.push(leftRight(`Alamat     : ${truncate(invoice.party_address || '-', 35)}`, `Tanggal         : ${formatDateDot(invoice.transaction_date)}`));
  lines.push('');
  lines.push(separator('='));

  // Items Header
  lines.push('No    Nama Barang                                        Qty      Satuan');
  lines.push(separator('-'));

  // Items
  invoice.items.forEach((item, index) => {
    const no = String(index + 1).padEnd(6);
    const name = truncate(item.item_name, 48).padEnd(48);
    const qty = String(item.quantity).padStart(8);
    const unit = item.unit.substring(0, 10).padStart(12);
    
    lines.push(`${no}${name}${qty}${unit}`);
  });

  lines.push(separator('='));
  lines.push('');
  lines.push('');

  // Signature
  lines.push(leftRight('Pengirim,', 'Penerima,'));
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push(leftRight('(________________)', '(________________)'));
  lines.push('');
  lines.push(separator('='));
  lines.push(centerText(`Dicetak: ${new Date().toLocaleString('id-ID')}`));

  openPrintWindow('Surat Jalan', invoice.transaction_number, lines.join('\n'));
};

// ==================== KWITANSI DOT MATRIX ====================
export const printKwitansiDotMatrix = (invoice: InvoiceDetail): void => {
  const COMPANY_INFO = getCompanyInfo();
  const lines: string[] = [];
  const invoiceNumber = invoice.transaction_number.replace('SGM.PJ.', 'SGM.PJF.');
  const phoneInfo = `CP. ${COMPANY_INFO.contactName1}: ${COMPANY_INFO.phone1}, ${COMPANY_INFO.contactName2}: ${COMPANY_INFO.phone2}`;
  const bankInfo = `${COMPANY_INFO.bankName} ${COMPANY_INFO.bankAccount} a.n ${COMPANY_INFO.bankHolder}`;

  // Header
  lines.push(separator('='));
  lines.push(centerText(COMPANY_INFO.name));
  lines.push(centerText(truncate(COMPANY_INFO.tagline, LINE_WIDTH - 4)));
  lines.push(centerText(COMPANY_INFO.address));
  lines.push(centerText(phoneInfo));
  lines.push(separator('='));
  lines.push('');

  // Title
  lines.push(centerText('[ KWITANSI PEMBAYARAN ]'));
  lines.push(separator('-'));
  lines.push('');

  // Receipt Content
  const labelWidth = 22;
  const receiptLine = (label: string, value: string): string => {
    return label.padEnd(labelWidth) + ': ' + value;
  };

  lines.push(receiptLine('Sudah terima dari', invoice.party_name));
  lines.push(receiptLine('Uang Sejumlah', formatCurrency(invoice.grand_total)));
  lines.push(receiptLine('Terbilang', terbilang(invoice.grand_total)));
  lines.push(receiptLine('Untuk Pembayaran', `Pelunasan Faktur No. ${invoiceNumber}`));
  lines.push(receiptLine('Metode Pembayaran', invoice.payment_method === 'transfer' ? 'Transfer' : 'Tunai'));
  lines.push('');
  lines.push(separator('-'));

  // Bank Info
  lines.push('');
  lines.push(centerText(`Pembayaran ke: ${bankInfo}`));
  lines.push('');
  lines.push(separator('-'));

  // Signature
  lines.push('');
  lines.push(leftRight('Penerima,', 'Hormat Kami,'));
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push(leftRight('(________________)', `(${COMPANY_INFO.name})`));
  lines.push('');
  lines.push(separator('='));
  lines.push(centerText(`Dicetak: ${new Date().toLocaleString('id-ID')}`));

  openPrintWindow('Kwitansi', invoice.transaction_number, lines.join('\n'));
};

// ==================== PRINT WINDOW HELPER ====================
const openPrintWindow = (docType: string, transactionNumber: string, content: string): void => {
  const printWindow = window.open('', '_blank', 'width=850,height=650');
  if (!printWindow) {
    alert('Popup diblokir. Mohon izinkan popup untuk mencetak.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${docType} - ${transactionNumber}</title>
      <style>
        @page { size: auto; margin: 5mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11pt;
          line-height: 1.3;
          white-space: pre;
          background: #f0f0f0;
          padding: 20px;
        }
        .container {
          background: white;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        @media print {
          body { padding: 0; background: white; }
          .container { box-shadow: none; padding: 0; }
        }
        .no-print {
          margin-bottom: 20px;
          padding: 15px;
          background: #333;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 800px;
          margin: 0 auto 20px;
        }
        .no-print button {
          font-size: 13px;
          padding: 10px 20px;
          cursor: pointer;
          border: none;
          border-radius: 6px;
          font-weight: bold;
        }
        .no-print button.print-btn {
          background: #10b981;
          color: white;
        }
        .no-print button.close-btn {
          background: #fff;
          color: #333;
        }
        .no-print .tips {
          color: #ccc;
          font-size: 12px;
          margin-left: auto;
        }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Cetak ${docType}</button>
        <button class="close-btn" onclick="window.close()">✕ Tutup</button>
        <span class="tips">Mode: Dot Matrix | 80 kolom</span>
      </div>
      <div class="container">
        <pre>${content}</pre>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
};
