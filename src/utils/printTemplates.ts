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

const formatCurrency = (value: number): string => {
  return 'Rp ' + value.toLocaleString('id-ID');
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

const getBaseStyles = (): string => `
  @page { 
    size: A4; 
    margin: 15mm; 
  }
  
  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
  }
  
  body {
    font-family: Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000;
    background: #f5f5f5;
    padding: 20px;
  }
  
  .page {
    background: white;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 15mm;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  @media print {
    body { 
      padding: 0; 
      background: white; 
    }
    .page { 
      box-shadow: none; 
      padding: 0;
      width: 100%;
    }
    .no-print { 
      display: none !important; 
    }
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #000;
  }
  
  .header-left {
    flex: 1;
  }
  
  .company-name {
    font-size: 14pt;
    font-weight: bold;
    color: #000;
    margin-bottom: 3px;
  }
  
  .company-tagline {
    font-size: 9pt;
    color: #000;
    font-weight: bold;
    margin-bottom: 3px;
    max-width: 400px;
  }
  
  .company-address {
    font-size: 9pt;
    color: #000;
  }
  
  .company-phone {
    font-size: 9pt;
    color: #000;
  }
  
  .header-logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }
  
  .document-title {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    margin: 20px 0;
    padding: 8px;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 10pt;
  }
  
  .info-row {
    display: flex;
    margin-bottom: 5px;
  }
  
  .info-label {
    width: 100px;
    color: #000;
    font-weight: bold;
  }
  
  .info-separator {
    margin: 0 5px;
  }
  
  .info-value {
    flex: 1;
  }
  
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 10pt;
  }
  
  .items-table th {
    background: #333;
    color: white;
    padding: 8px 5px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #333;
  }
  
  .items-table td {
    padding: 6px 5px;
    border: 1px solid #ddd;
    vertical-align: top;
  }
  
  .items-table .text-right {
    text-align: right;
  }
  
  .items-table .text-center {
    text-align: center;
  }
  
  .summary-section {
    display: flex;
    justify-content: flex-end;
    margin: 20px 0;
  }
  
  .summary-table {
    width: 300px;
    font-size: 10pt;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
    border-bottom: 1px solid #eee;
  }
  
  .summary-row.total {
    font-weight: bold;
    border-top: 2px solid #000;
    border-bottom: none;
    padding-top: 8px;
    margin-top: 5px;
  }
  
  .terbilang {
    margin: 15px 0;
    font-size: 10pt;
  }
  
  .terbilang-label {
    color: #000;
    font-weight: bold;
  }
  
  .terbilang-value {
    font-style: italic;
  }
  
  .vat-exempt {
    color: #000;
    font-style: italic;
    font-size: 10pt;
  }
  
  .bank-info {
    text-align: center;
    margin: 30px 0;
    font-size: 10pt;
    color: #000;
  }
  
  .signature-section {
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
    font-size: 10pt;
  }
  
  .signature-box {
    text-align: center;
    width: 150px;
  }
  
  .signature-line {
    margin-top: 60px;
    border-bottom: 1px solid #000;
    padding-bottom: 5px;
  }
  
  .signature-name {
    margin-top: 5px;
    font-weight: bold;
  }
  
  .no-print {
    margin-bottom: 20px;
    padding: 15px;
    background: linear-gradient(135deg, #333 0%, #111 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 210mm;
    margin: 0 auto 20px;
  }
  
  .no-print button {
    font-size: 12px;
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
  
  .no-print button.close-btn {
    background: #fff;
    color: #333;
  }
  
  .no-print .tips {
    color: white;
    font-size: 12px;
    margin-left: auto;
  }
  
  /* Kwitansi specific styles */
  .receipt-box {
    border: 1px solid #000;
    padding: 20px;
    margin: 20px 0;
  }
  
  .receipt-row {
    display: flex;
    margin-bottom: 15px;
    font-size: 11pt;
  }
  
  .receipt-label {
    width: 140px;
    color: #000;
    font-weight: bold;
  }
  
  .receipt-separator {
    margin: 0 10px;
  }
  
  .receipt-value {
    flex: 1;
  }
  
  .receipt-value.bold {
    font-weight: bold;
  }
  
  .receipt-value.italic {
    font-style: italic;
  }
`;

// Invoice Template
export const printInvoice = (invoice: InvoiceDetail): void => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Popup diblokir. Mohon izinkan popup untuk mencetak.');
    return;
  }

  const COMPANY_INFO = getCompanyInfo();
  const invoiceNumber = invoice.transaction_number.replace('SGM.PJ.', 'SGM.PJF.');
  const isVatExempt = invoice.vat_exempt || (!invoice.apply_vat);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${invoice.transaction_number}</title>
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Cetak Invoice</button>
        <button class="close-btn" onclick="window.close()">✕ Tutup</button>
        <span class="tips">Format: A4 | Dokumen akan dicetak sesuai tampilan</span>
      </div>
      
      <div class="page">
        <div class="header">
          <div class="header-left">
            <div class="company-name">${COMPANY_INFO.name}</div>
            <div class="company-tagline">${COMPANY_INFO.tagline}</div>
            <div class="company-address">${COMPANY_INFO.address}</div>
            <div class="company-phone">CP. ${COMPANY_INFO.contactName1} : ${COMPANY_INFO.phone1}, CP. ${COMPANY_INFO.contactName2} : ${COMPANY_INFO.phone2}</div>
          </div>
          <img src="${COMPANY_INFO.logoUrl}" class="header-logo" alt="Logo" />
        </div>
        
        <div class="document-title">INVOICE PENJUALAN</div>
        
        <div class="info-grid">
          <div>
            <div class="info-row">
              <span class="info-label">Kepada Yth.</span>
              <span class="info-separator">:</span>
              <span class="info-value">${invoice.party_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Alamat</span>
              <span class="info-separator">:</span>
              <span class="info-value">${invoice.party_address || '-'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">NPWP/NIK</span>
              <span class="info-separator">:</span>
              <span class="info-value">${invoice.party_npwp || '-'}</span>
            </div>
          </div>
          <div>
            <div class="info-row">
              <span class="info-label">No. Invoice</span>
              <span class="info-separator">:</span>
              <span class="info-value">${invoiceNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tanggal</span>
              <span class="info-separator">:</span>
              <span class="info-value">${formatDate(invoice.transaction_date)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Metode Pembayaran</span>
              <span class="info-separator">:</span>
              <span class="info-value">${invoice.payment_method === 'transfer' ? 'Transfer' : 'Tunai'}</span>
            </div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px" class="text-center">No</th>
              <th>Nama Barang</th>
              <th style="width: 70px" class="text-right">Qty</th>
              <th style="width: 70px" class="text-center">Satuan</th>
              <th style="width: 100px" class="text-right">Harga Satuan</th>
              <th style="width: 110px" class="text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.item_name} (${item.item_code})</td>
                <td class="text-right">${item.quantity.toLocaleString('id-ID')}</td>
                <td class="text-center">${item.unit}</td>
                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                <td class="text-right">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary-section">
          <div class="summary-table">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            ${invoice.discount > 0 ? `
              <div class="summary-row">
                <span>Diskon</span>
                <span>-${formatCurrency(invoice.discount)}</span>
              </div>
            ` : ''}
            ${invoice.apply_vat && invoice.vat_amount > 0 ? `
              <div class="summary-row">
                <span>PPN 11%</span>
                <span>${formatCurrency(invoice.vat_amount)}</span>
              </div>
            ` : `
              <div class="summary-row">
                <span>PPN 11%</span>
                <span style="font-weight: bold">DIBEBASKAN</span>
              </div>
            `}
            ${invoice.shipping_cost > 0 ? `
              <div class="summary-row">
                <span>Ongkos Kirim</span>
                <span>${formatCurrency(invoice.shipping_cost)}</span>
              </div>
            ` : ''}
            <div class="summary-row total">
              <span>Total Tagihan</span>
              <span>${formatCurrency(invoice.grand_total)}</span>
            </div>
          </div>
        </div>
        
        <div class="terbilang">
          <span class="terbilang-label">Terbilang:</span> 
          <span class="terbilang-value">${terbilang(invoice.grand_total)}</span>
        </div>
        
        ${isVatExempt ? '<div class="vat-exempt">(Transaksi Dibebaskan dari Pengenaan PPN)</div>' : ''}
        
        <div class="bank-info">
          Pembayaran mohon di transfer ke rekening ${COMPANY_INFO.bankName} No. Rek. ${COMPANY_INFO.bankAccount} a.n ${COMPANY_INFO.bankHolder}
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div>Penerima,</div>
            <div class="signature-line"></div>
            <div class="signature-name">(________________)</div>
          </div>
          <div class="signature-box">
            <div>Hormat Kami,</div>
            <div class="signature-line"></div>
            <div class="signature-name">(${COMPANY_INFO.name})</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Surat Jalan Template
export const printSuratJalan = (invoice: InvoiceDetail): void => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Popup diblokir. Mohon izinkan popup untuk mencetak.');
    return;
  }

  const COMPANY_INFO = getCompanyInfo();
  const suratJalanNumber = invoice.transaction_number.replace('SGM.PJ.', 'SGM.SJF.');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Surat Jalan - ${invoice.transaction_number}</title>
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Cetak Surat Jalan</button>
        <button class="close-btn" onclick="window.close()">✕ Tutup</button>
        <span class="tips">Format: A4 | Dokumen akan dicetak sesuai tampilan</span>
      </div>
      
      <div class="page">
        <div class="header">
          <div class="header-left">
            <div class="company-name">${COMPANY_INFO.name}</div>
            <div class="company-tagline">${COMPANY_INFO.tagline}</div>
            <div class="company-address">${COMPANY_INFO.address}</div>
            <div class="company-phone">CP. ${COMPANY_INFO.contactName1} : ${COMPANY_INFO.phone1}, CP. ${COMPANY_INFO.contactName2} : ${COMPANY_INFO.phone2}</div>
          </div>
          <img src="${COMPANY_INFO.logoUrl}" class="header-logo" alt="Logo" />
        </div>
        
        <div class="document-title">SURAT JALAN</div>
        
        <div class="info-grid">
          <div>
            <div class="info-row">
              <span class="info-label">Kepada Yth.</span>
              <span class="info-separator">:</span>
              <span class="info-value">${invoice.party_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Alamat</span>
              <span class="info-separator">:</span>
              <span class="info-value">${invoice.party_address || '-'}</span>
            </div>
          </div>
          <div>
            <div class="info-row">
              <span class="info-label">No. Surat Jalan</span>
              <span class="info-separator">:</span>
              <span class="info-value">${suratJalanNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tanggal</span>
              <span class="info-separator">:</span>
              <span class="info-value">${formatDate(invoice.transaction_date)}</span>
            </div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50px" class="text-center">No</th>
              <th>Nama Barang</th>
              <th style="width: 100px" class="text-right">Qty</th>
              <th style="width: 100px" class="text-center">Satuan</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.item_name} (${item.item_code})</td>
                <td class="text-right">${item.quantity.toLocaleString('id-ID')}</td>
                <td class="text-center">${item.unit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="signature-section" style="margin-top: 80px;">
          <div class="signature-box">
            <div>Pengirim,</div>
            <div class="signature-line"></div>
            <div class="signature-name">(________________)</div>
          </div>
          <div class="signature-box">
            <div>Penerima,</div>
            <div class="signature-line"></div>
            <div class="signature-name">(________________)</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Kwitansi Template
export const printKwitansi = (invoice: InvoiceDetail): void => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Popup diblokir. Mohon izinkan popup untuk mencetak.');
    return;
  }

  const COMPANY_INFO = getCompanyInfo();
  const invoiceNumber = invoice.transaction_number.replace('SGM.PJ.', 'SGM.PJF.');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kwitansi - ${invoice.transaction_number}</title>
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Cetak Kwitansi</button>
        <button class="close-btn" onclick="window.close()">✕ Tutup</button>
        <span class="tips">Format: A4 | Dokumen akan dicetak sesuai tampilan</span>
      </div>
      
      <div class="page">
        <div class="header">
          <div class="header-left">
            <div class="company-name">${COMPANY_INFO.name}</div>
            <div class="company-tagline">${COMPANY_INFO.tagline}</div>
            <div class="company-address">${COMPANY_INFO.address}</div>
            <div class="company-phone">CP. ${COMPANY_INFO.contactName1} : ${COMPANY_INFO.phone1}, CP. ${COMPANY_INFO.contactName2} : ${COMPANY_INFO.phone2}</div>
          </div>
          <img src="${COMPANY_INFO.logoUrl}" class="header-logo" alt="Logo" />
        </div>
        
        <div class="document-title">KWITANSI PEMBAYARAN</div>
        
        <div class="receipt-box">
          <div class="receipt-row">
            <span class="receipt-label">Sudah terima dari</span>
            <span class="receipt-separator">:</span>
            <span class="receipt-value bold">${invoice.party_name}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Uang Sejumlah</span>
            <span class="receipt-separator">:</span>
            <span class="receipt-value bold">${formatCurrency(invoice.grand_total)}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Terbilang</span>
            <span class="receipt-separator">:</span>
            <span class="receipt-value italic">${terbilang(invoice.grand_total)}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Untuk Pembayaran</span>
            <span class="receipt-separator">:</span>
            <span class="receipt-value">Pelunasan Faktur No. ${invoiceNumber}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Metode Pembayaran</span>
            <span class="receipt-separator">:</span>
            <span class="receipt-value">${invoice.payment_method === 'transfer' ? 'Transfer' : 'Tunai'}</span>
          </div>
        </div>
        
        <div class="bank-info">
          Pembayaran mohon di transfer ke rekening ${COMPANY_INFO.bankName} No. Rek. ${COMPANY_INFO.bankAccount} a.n ${COMPANY_INFO.bankHolder}
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div>Penerima,</div>
            <div class="signature-line"></div>
            <div class="signature-name">(________________)</div>
          </div>
          <div class="signature-box">
            <div>Hormat Kami,</div>
            <div class="signature-line"></div>
            <div class="signature-name">(${COMPANY_INFO.name})</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
