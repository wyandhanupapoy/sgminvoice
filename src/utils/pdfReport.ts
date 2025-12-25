import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah } from './formatters';
import { getCompanyInfo } from '@/hooks/useCompanySettings';

interface SalesData {
  id: string;
  transaction_number: string;
  transaction_date: string;
  customer_name: string;
  grand_total: number | null;
  status: string | null;
  due_date?: string | null;
}

interface PurchaseData {
  id: string;
  transaction_number: string;
  transaction_date: string;
  supplier_name: string;
  grand_total: number | null;
  status: string | null;
  due_date?: string | null;
}

interface OverdueInvoice {
  transactionNumber: string;
  type: 'sales' | 'purchase';
  customerName: string;
  transactionDate: string;
  dueDate: string;
  amount: number;
  daysOverdue: number;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const COMPANY_INFO_DEFAULT = {
  name: 'PT. SUMBER GANDA MEKAR',
  tagline: 'Trading Baja, Beton, Logam, Tiang Listrik/Telekomunikasi & Pakan Ternak',
  logoPath: '/company-logo.png'
};

const getStatusLabel = (status: string | null) => {
  switch (status) {
    case 'paid': return 'Lunas';
    case 'overdue': return 'Terlambat';
    default: return 'Pending';
  }
};

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Helper to get company info
const getCompanyData = () => {
  try {
    const info = getCompanyInfo();
    return {
      name: info.name || COMPANY_INFO_DEFAULT.name,
      tagline: info.tagline || COMPANY_INFO_DEFAULT.tagline,
      logoPath: info.logoUrl || COMPANY_INFO_DEFAULT.logoPath
    };
  } catch {
    return COMPANY_INFO_DEFAULT;
  }
};

export const generateMonthlyReport = async (
  sales: SalesData[],
  purchases: PurchaseData[],
  month: number,
  year: number
) => {
  const doc = new jsPDF('p', 'mm', 'a4'); // A4 format
  const monthName = MONTH_NAMES[month];
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Filter data for selected month
  const filteredSales = sales.filter(s => {
    const date = new Date(s.transaction_date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
  
  const filteredPurchases = purchases.filter(p => {
    const date = new Date(p.transaction_date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  // Calculate totals
  const totalSales = filteredSales.reduce((sum, s) => sum + Number(s.grand_total || 0), 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + Number(p.grand_total || 0), 0);
  const profit = totalSales - totalPurchases;

  const companyInfo = getCompanyData();

  // Load and add logo
  try {
    const logoBase64 = await loadImageAsBase64(companyInfo.logoPath);
    doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
  } catch (error) {
    console.warn('Could not load company logo:', error);
  }

  // Company Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 45, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.tagline, 45, 24);

  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 40, pageWidth - 14, 40);

  // Report Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN BULANAN', pageWidth / 2, 52, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${monthName} ${year}`, pageWidth / 2, 60, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 67, { align: 'center' });

  // Summary section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN', 14, 80);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const summaryData = [
    ['Total Penjualan', formatRupiah(totalSales)],
    ['Total Pembelian', formatRupiah(totalPurchases)],
    ['Laba/Rugi Kotor', formatRupiah(profit)],
    ['Jumlah Transaksi Penjualan', String(filteredSales.length)],
    ['Jumlah Transaksi Pembelian', String(filteredPurchases.length)],
  ];

  autoTable(doc, {
    startY: 84,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right' }
    },
    margin: { left: 14 }
  });

  // Sales table
  let currentY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR PENJUALAN', 14, currentY);
  
  if (filteredSales.length > 0) {
    const salesTableData = filteredSales.map((s, idx) => [
      String(idx + 1),
      s.transaction_number,
      s.transaction_date,
      s.customer_name,
      formatRupiah(Number(s.grand_total || 0)),
      getStatusLabel(s.status)
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['No', 'No. Transaksi', 'Tanggal', 'Pelanggan', 'Total', 'Status']],
      body: salesTableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 139, 34], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 45 },
        4: { cellWidth: 35, halign: 'right' },
        5: { cellWidth: 25, halign: 'center' }
      },
      foot: [['', '', '', 'Total Penjualan', formatRupiah(totalSales), '']],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Tidak ada transaksi penjualan pada periode ini.', 14, currentY + 8);
    currentY += 12;
  }

  // Check if need new page for purchases
  currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 15;
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  // Purchases table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR PEMBELIAN', 14, currentY);
  
  if (filteredPurchases.length > 0) {
    const purchasesTableData = filteredPurchases.map((p, idx) => [
      String(idx + 1),
      p.transaction_number,
      p.transaction_date,
      p.supplier_name,
      formatRupiah(Number(p.grand_total || 0)),
      getStatusLabel(p.status)
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['No', 'No. Transaksi', 'Tanggal', 'Supplier', 'Total', 'Status']],
      body: purchasesTableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 45 },
        4: { cellWidth: 35, halign: 'right' },
        5: { cellWidth: 25, halign: 'center' }
      },
      foot: [['', '', '', 'Total Pembelian', formatRupiah(totalPurchases), '']],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Tidak ada transaksi pembelian pada periode ini.', 14, currentY + 8);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`Laporan_Bulanan_${monthName}_${year}.pdf`);
};

// Generate Overdue Invoices Report
export const generateOverdueReport = async (
  sales: SalesData[],
  purchases: PurchaseData[]
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const companyInfo = getCompanyData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper to check if overdue
  const isOverdue = (dueDate: string | null, status: string | null): boolean => {
    if (!dueDate || status === 'paid') return false;
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Get overdue invoices
  const overdueInvoices: OverdueInvoice[] = [];

  sales.forEach((s) => {
    if (isOverdue(s.due_date || null, s.status)) {
      const due = new Date(s.due_date!);
      const daysOverdue = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      overdueInvoices.push({
        transactionNumber: s.transaction_number,
        type: 'sales',
        customerName: s.customer_name,
        transactionDate: s.transaction_date,
        dueDate: s.due_date!,
        amount: Number(s.grand_total || 0),
        daysOverdue,
      });
    }
  });

  purchases.forEach((p) => {
    if (isOverdue(p.due_date || null, p.status)) {
      const due = new Date(p.due_date!);
      const daysOverdue = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      overdueInvoices.push({
        transactionNumber: p.transaction_number,
        type: 'purchase',
        customerName: p.supplier_name,
        transactionDate: p.transaction_date,
        dueDate: p.due_date!,
        amount: Number(p.grand_total || 0),
        daysOverdue,
      });
    }
  });

  // Sort by days overdue (most overdue first)
  overdueInvoices.sort((a, b) => b.daysOverdue - a.daysOverdue);

  // Load and add logo
  try {
    const logoBase64 = await loadImageAsBase64(companyInfo.logoPath);
    doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
  } catch (error) {
    console.warn('Could not load company logo:', error);
  }

  // Company Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 45, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.tagline, 45, 24);

  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 40, pageWidth - 14, 40);

  // Report Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69); // Red color for overdue
  doc.text('LAPORAN FAKTUR TERLAMBAT', pageWidth / 2, 52, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Per tanggal: ${today.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  })}`, pageWidth / 2, 60, { align: 'center' });

  // Summary
  const totalOverdueAmount = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
  const salesOverdue = overdueInvoices.filter(i => i.type === 'sales');
  const purchasesOverdue = overdueInvoices.filter(i => i.type === 'purchase');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN', 14, 75);

  const summaryData = [
    ['Total Faktur Terlambat', `${overdueInvoices.length} faktur`],
    ['Total Nilai Terlambat', formatRupiah(totalOverdueAmount)],
    ['Penjualan Terlambat', `${salesOverdue.length} faktur - ${formatRupiah(salesOverdue.reduce((s, i) => s + i.amount, 0))}`],
    ['Pembelian Terlambat', `${purchasesOverdue.length} faktur - ${formatRupiah(purchasesOverdue.reduce((s, i) => s + i.amount, 0))}`],
  ];

  autoTable(doc, {
    startY: 79,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 80 }
    },
    margin: { left: 14 }
  });

  // Overdue invoices table
  let currentY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR FAKTUR TERLAMBAT', 14, currentY);

  if (overdueInvoices.length > 0) {
    const tableData = overdueInvoices.map((inv, idx) => [
      String(idx + 1),
      inv.transactionNumber,
      inv.type === 'sales' ? 'Penjualan' : 'Pembelian',
      inv.customerName,
      inv.transactionDate,
      inv.dueDate,
      `${inv.daysOverdue} hari`,
      formatRupiah(inv.amount)
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['No', 'No. Transaksi', 'Tipe', 'Pelanggan/Supplier', 'Tgl Transaksi', 'Jatuh Tempo', 'Terlambat', 'Jumlah']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 53, 69], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 35 },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 22, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
        7: { cellWidth: 28, halign: 'right' }
      },
      foot: [['', '', '', '', '', '', 'TOTAL', formatRupiah(totalOverdueAmount)]],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Tidak ada faktur yang terlambat. Selamat!', 14, currentY + 8);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`Laporan_Faktur_Terlambat_${today.toISOString().split('T')[0]}.pdf`);
};
