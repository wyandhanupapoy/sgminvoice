import { SalesFormData, PurchaseFormData, TransactionItem } from '@/types/transaction';
import { formatRupiah, formatDate } from '@/utils/formatters';

type InvoiceData = SalesFormData | PurchaseFormData;

interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email?: string;
  npwp?: string;
}

const DEFAULT_COMPANY: CompanyInfo = {
  name: 'PT. SUMBER GANDA MEKAR',
  tagline: 'Trading Baja, Beton, Logam, Tiang Listrik/Telekomunikasi & Pakan Ternak',
  address: 'Alamat Perusahaan',
  phone: '021-XXXXXXX',
  email: 'info@sumbergandam ekar.com',
  npwp: '00.000.000.0-000.000',
};

// Generate modern dot matrix compatible invoice (80 column width)
const generateDotMatrixContent = (
  data: InvoiceData,
  type: 'sales' | 'purchase',
  company: CompanyInfo = DEFAULT_COMPANY
): string => {
  const LINE_WIDTH = 80;
  const lines: string[] = [];

  const centerText = (text: string): string => {
    const padding = Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2));
    return ' '.repeat(padding) + text;
  };

  const leftRight = (left: string, right: string): string => {
    const spaces = LINE_WIDTH - left.length - right.length;
    return left + ' '.repeat(Math.max(1, spaces)) + right;
  };

  const separator = (char: string = '-'): string => char.repeat(LINE_WIDTH);

  const doubleLine = (): string => '═'.repeat(LINE_WIDTH);

  const formatCurrency = (value: number): string => {
    return 'Rp ' + value.toLocaleString('id-ID');
  };

  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const boxTop = (): string => '╔' + '═'.repeat(LINE_WIDTH - 2) + '╗';
  const boxBottom = (): string => '╚' + '═'.repeat(LINE_WIDTH - 2) + '╝';
  const boxMiddle = (): string => '╠' + '═'.repeat(LINE_WIDTH - 2) + '╣';
  const boxLine = (text: string): string => {
    const content = centerText(text);
    const padding = LINE_WIDTH - 2 - content.length;
    return '║' + content + ' '.repeat(Math.max(0, padding)) + '║';
  };

  // ==================== HEADER WITH LOGO ====================
  lines.push(boxTop());
  lines.push(boxLine(''));
  
  // ASCII Art Logo (simplified SGM logo)
  lines.push(boxLine('   ╔═══════════╗'));
  lines.push(boxLine('   ║  ╔═╗ ╔╗╔╗ ║'));
  lines.push(boxLine('   ║  ╚═╗ ║║║║ ║'));
  lines.push(boxLine('   ║  ══╝ ╝╚╝╚ ║'));
  lines.push(boxLine('   ╚═══════════╝'));
  
  lines.push(boxLine(''));
  lines.push(boxLine(company.name));
  lines.push(boxLine(company.tagline));
  lines.push(boxLine(''));
  lines.push(boxMiddle());

  // Company Details
  lines.push('║' + ' '.repeat(LINE_WIDTH - 2) + '║');
  const addressLine = `  Alamat : ${company.address}`;
  const phoneLine = `  Telp   : ${company.phone}`;
  const emailLine = company.email ? `  Email  : ${company.email}` : '';
  const npwpLine = company.npwp ? `  NPWP   : ${company.npwp}` : '';
  
  lines.push('║' + addressLine.padEnd(LINE_WIDTH - 2) + '║');
  lines.push('║' + phoneLine.padEnd(LINE_WIDTH - 2) + '║');
  if (emailLine) lines.push('║' + emailLine.padEnd(LINE_WIDTH - 2) + '║');
  if (npwpLine) lines.push('║' + npwpLine.padEnd(LINE_WIDTH - 2) + '║');
  lines.push('║' + ' '.repeat(LINE_WIDTH - 2) + '║');
  lines.push(boxBottom());

  lines.push('');

  // ==================== INVOICE TITLE ====================
  const invoiceTitle = type === 'sales' ? '[ FAKTUR PENJUALAN ]' : '[ FAKTUR PEMBELIAN ]';
  lines.push(doubleLine());
  lines.push(centerText(invoiceTitle));
  lines.push(doubleLine());
  lines.push('');

  // ==================== TRANSACTION INFO ====================
  lines.push('┌' + '─'.repeat(38) + '┬' + '─'.repeat(39) + '┐');
  lines.push('│  INFORMASI TRANSAKSI' + ' '.repeat(17) + '│  METODE PEMBAYARAN' + ' '.repeat(19) + '│');
  lines.push('├' + '─'.repeat(38) + '┼' + '─'.repeat(39) + '┤');
  
  const transNo = `  No. Transaksi : ${data.transaction.transactionNumber}`;
  const transDate = `  Tanggal       : ${formatDate(data.transaction.date)}`;
  const payMethod = `  Metode Bayar  : ${data.transaction.paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai'}`;
  const vehicleNo = data.transaction.vehicleNumber ? `  No. Kendaraan : ${data.transaction.vehicleNumber}` : '';
  const reference = data.transaction.reference ? `  Referensi     : ${data.transaction.reference}` : '';
  
  lines.push('│' + transNo.padEnd(38) + '│' + payMethod.padEnd(39) + '│');
  lines.push('│' + transDate.padEnd(38) + '│' + (vehicleNo || ' ').padEnd(39) + '│');
  if (reference) {
    lines.push('│' + reference.padEnd(38) + '│' + ' '.repeat(39) + '│');
  }
  lines.push('└' + '─'.repeat(38) + '┴' + '─'.repeat(39) + '┘');
  lines.push('');

  // ==================== CUSTOMER/SUPPLIER INFO ====================
  lines.push('┌' + '─'.repeat(LINE_WIDTH - 2) + '┐');
  
  if (type === 'sales' && 'customer' in data) {
    lines.push('│  ▶ DATA PELANGGAN' + ' '.repeat(LINE_WIDTH - 21) + '│');
    lines.push('├' + '─'.repeat(LINE_WIDTH - 2) + '┤');
    lines.push('│' + `  Nama    : ${data.customer.name}`.padEnd(LINE_WIDTH - 2) + '│');
    if (data.customer.address) {
      lines.push('│' + `  Alamat  : ${truncate(data.customer.address, 64)}`.padEnd(LINE_WIDTH - 2) + '│');
    }
    if (data.customer.phone) {
      lines.push('│' + `  Telepon : ${data.customer.phone}`.padEnd(LINE_WIDTH - 2) + '│');
    }
    if (data.customer.npwp) {
      lines.push('│' + `  NPWP    : ${data.customer.npwp}`.padEnd(LINE_WIDTH - 2) + '│');
    }
  } else if (type === 'purchase' && 'supplier' in data) {
    lines.push('│  ▶ DATA SUPPLIER' + ' '.repeat(LINE_WIDTH - 20) + '│');
    lines.push('├' + '─'.repeat(LINE_WIDTH - 2) + '┤');
    lines.push('│' + `  Nama    : ${data.supplier.name}`.padEnd(LINE_WIDTH - 2) + '│');
    if (data.supplier.address) {
      lines.push('│' + `  Alamat  : ${truncate(data.supplier.address, 64)}`.padEnd(LINE_WIDTH - 2) + '│');
    }
    if (data.supplier.phone) {
      lines.push('│' + `  Telepon : ${data.supplier.phone}`.padEnd(LINE_WIDTH - 2) + '│');
    }
  }
  
  lines.push('└' + '─'.repeat(LINE_WIDTH - 2) + '┘');
  lines.push('');

  // ==================== ITEMS TABLE ====================
  lines.push('╔' + '═'.repeat(LINE_WIDTH - 2) + '╗');
  lines.push('║  ▶ DAFTAR BARANG' + ' '.repeat(LINE_WIDTH - 20) + '║');
  lines.push('╠════╤════════════╤══════════════════════════╤═══════╤════════╤══════════════╣');
  lines.push('║ NO │ KODE       │ NAMA BARANG              │  QTY  │ SATUAN │    HARGA     ║');
  lines.push('╠════╪════════════╪══════════════════════════╪═══════╪════════╪══════════════╣');

  // Items
  let itemsSubtotal = 0;
  data.items.forEach((item: TransactionItem, index: number) => {
    const no = String(index + 1).padStart(2, ' ');
    const code = item.itemCode.substring(0, 10).padEnd(10, ' ');
    const name = truncate(item.itemName, 24).padEnd(24, ' ');
    const qty = String(item.quantity).padStart(5, ' ');
    const unit = item.unit.substring(0, 6).padEnd(6, ' ');
    const price = formatCurrency(item.unitPrice).padStart(12, ' ');
    
    lines.push(`║ ${no} │ ${code} │ ${name} │ ${qty} │ ${unit} │ ${price} ║`);
    
    // Item total on next line
    const totalLabel = `Subtotal: ${formatCurrency(item.total)}`;
    lines.push('║    │            │' + ' '.repeat(26) + '│       │        │' + totalLabel.padStart(14, ' ') + '║');
    
    if (index < data.items.length - 1) {
      lines.push('╟────┼────────────┼──────────────────────────┼───────┼────────┼──────────────╢');
    }
    
    itemsSubtotal += item.total;
  });

  lines.push('╚════╧════════════╧══════════════════════════╧═══════╧════════╧══════════════╝');
  lines.push('');

  // ==================== SUMMARY ====================
  lines.push('┌' + '─'.repeat(LINE_WIDTH - 2) + '┐');
  lines.push('│  ▶ RINGKASAN PEMBAYARAN' + ' '.repeat(LINE_WIDTH - 27) + '│');
  lines.push('├' + '─'.repeat(LINE_WIDTH - 2) + '┤');

  const summaryLine = (label: string, value: string, highlight: boolean = false): string => {
    const prefix = highlight ? '│  ►►  ' : '│      ';
    const suffix = highlight ? '  ◄◄  │' : '      │';
    const content = label.padEnd(30) + ':' + value.padStart(LINE_WIDTH - 42);
    return prefix + content + suffix;
  };

  lines.push(summaryLine('Subtotal', formatCurrency(data.summary.subtotal)));
  
  if (data.summary.discount > 0) {
    lines.push(summaryLine('Diskon', `(${formatCurrency(data.summary.discount)})`));
  }
  
  if (data.summary.shippingCost > 0) {
    lines.push(summaryLine('Ongkos Kirim', formatCurrency(data.summary.shippingCost)));
  }
  
  if (data.applyVat && data.summary.vatAmount > 0) {
    lines.push(summaryLine('PPN 11%', formatCurrency(data.summary.vatAmount)));
  }
  
  if (data.summary.downPayment > 0) {
    lines.push(summaryLine('Uang Muka (DP)', `(${formatCurrency(data.summary.downPayment)})`));
  }

  lines.push('├' + '─'.repeat(LINE_WIDTH - 2) + '┤');
  lines.push(summaryLine('GRAND TOTAL', formatCurrency(data.summary.grandTotal), true));
  lines.push('└' + '─'.repeat(LINE_WIDTH - 2) + '┘');

  // ==================== NOTES ====================
  if (data.notes) {
    lines.push('');
    lines.push('┌' + '─'.repeat(LINE_WIDTH - 2) + '┐');
    lines.push('│  ▶ CATATAN' + ' '.repeat(LINE_WIDTH - 14) + '│');
    lines.push('├' + '─'.repeat(LINE_WIDTH - 2) + '┤');
    
    const noteWords = data.notes.split(' ');
    let currentLine = '  ';
    noteWords.forEach(word => {
      if ((currentLine + ' ' + word).length <= LINE_WIDTH - 4) {
        currentLine = currentLine ? currentLine + ' ' + word : '  ' + word;
      } else {
        lines.push('│' + currentLine.padEnd(LINE_WIDTH - 2) + '│');
        currentLine = '  ' + word;
      }
    });
    if (currentLine.trim()) {
      lines.push('│' + currentLine.padEnd(LINE_WIDTH - 2) + '│');
    }
    
    lines.push('└' + '─'.repeat(LINE_WIDTH - 2) + '┘');
  }

  lines.push('');

  // ==================== SIGNATURE ====================
  lines.push('┌' + '─'.repeat(37) + '┬' + '─'.repeat(40) + '┐');
  lines.push('│' + centerText('Diterima oleh,').substring(0, 37).padEnd(37) + '│' + centerText('Hormat kami,').substring(0, 40).padEnd(40) + '│');
  lines.push('│' + ' '.repeat(37) + '│' + ' '.repeat(40) + '│');
  lines.push('│' + ' '.repeat(37) + '│' + ' '.repeat(40) + '│');
  lines.push('│' + ' '.repeat(37) + '│' + ' '.repeat(40) + '│');
  lines.push('│' + centerText('(________________)').substring(0, 37).padEnd(37) + '│' + centerText('(________________)').substring(0, 40).padEnd(40) + '│');
  lines.push('└' + '─'.repeat(37) + '┴' + '─'.repeat(40) + '┘');

  lines.push('');

  // ==================== FOOTER ====================
  lines.push(doubleLine());
  lines.push(centerText('*** Terima kasih atas kepercayaan Anda ***'));
  lines.push(centerText('Barang yang sudah dibeli tidak dapat dikembalikan'));
  lines.push(doubleLine());
  lines.push('');
  lines.push(centerText(`Dicetak: ${new Date().toLocaleString('id-ID')}`));
  lines.push(centerText('Dokumen ini sah tanpa tanda tangan basah'));

  return lines.join('\n');
};

// Print using browser print dialog (optimized for dot matrix)
export const printDotMatrixInvoice = (
  data: InvoiceData,
  type: 'sales' | 'purchase',
  company?: CompanyInfo
): void => {
  const content = generateDotMatrixContent(data, type, company);
  
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Popup diblokir. Mohon izinkan popup untuk mencetak.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cetak Faktur - ${data.transaction.transactionNumber}</title>
      <style>
        @page {
          size: auto;
          margin: 5mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11pt;
          line-height: 1.3;
          white-space: pre;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .invoice-container {
          background: white;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 800px;
          margin: 0 auto;
        }
        
        @media print {
          body {
            padding: 0;
            background: white;
          }
          .invoice-container {
            box-shadow: none;
            padding: 0;
          }
        }
        
        .no-print {
          margin-bottom: 20px;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 15px;
          max-width: 800px;
          margin: 0 auto 20px;
        }
        
        .no-print button {
          font-size: 14px;
          padding: 10px 20px;
          cursor: pointer;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          transition: all 0.2s;
        }
        
        .no-print button.print-btn {
          background: #10b981;
          color: white;
        }
        
        .no-print button.print-btn:hover {
          background: #059669;
        }
        
        .no-print button.close-btn {
          background: #ef4444;
          color: white;
        }
        
        .no-print button.close-btn:hover {
          background: #dc2626;
        }
        
        .no-print .tips {
          color: white;
          font-size: 13px;
          opacity: 0.9;
        }
        
        @media print {
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Cetak Faktur</button>
        <button class="close-btn" onclick="window.close()">✕ Tutup</button>
        <span class="tips">
          💡 Tips: Untuk printer dot matrix, pilih ukuran kertas Continuous atau sesuaikan di pengaturan printer.
        </span>
      </div>
      <div class="invoice-container">
        <pre>${content}</pre>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
};

// Get raw text content for direct printing or copying
export const getDotMatrixContent = (
  data: InvoiceData,
  type: 'sales' | 'purchase',
  company?: CompanyInfo
): string => {
  return generateDotMatrixContent(data, type, company);
};

export default printDotMatrixInvoice;
