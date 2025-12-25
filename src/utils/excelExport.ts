import * as XLSX from 'xlsx';

interface SalesExportData {
  transaction_number: string;
  customer_name: string;
  transaction_date: string;
  grand_total: number;
  status: string;
  apply_vat: boolean;
}

interface PurchaseExportData {
  transaction_number: string;
  supplier_name: string;
  transaction_date: string;
  grand_total: number;
  status: string;
  apply_vat: boolean;
}

export const exportSalesToExcel = (sales: SalesExportData[]) => {
  const data = sales.map((sale, index) => ({
    'No': index + 1,
    'No. Transaksi': sale.transaction_number,
    'Pelanggan': sale.customer_name,
    'Tanggal': sale.transaction_date,
    'Total': sale.grand_total,
    'Status': sale.status === 'paid' ? 'Lunas' : sale.status === 'pending' ? 'Pending' : sale.status,
    'PPN': sale.apply_vat ? 'Ya' : 'Tidak',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Penjualan');

  // Auto-width columns
  const colWidths = [
    { wch: 5 },  // No
    { wch: 20 }, // No. Transaksi
    { wch: 25 }, // Pelanggan
    { wch: 12 }, // Tanggal
    { wch: 15 }, // Total
    { wch: 10 }, // Status
    { wch: 8 },  // PPN
  ];
  worksheet['!cols'] = colWidths;

  const fileName = `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportPurchasesToExcel = (purchases: PurchaseExportData[]) => {
  const data = purchases.map((purchase, index) => ({
    'No': index + 1,
    'No. Transaksi': purchase.transaction_number,
    'Supplier': purchase.supplier_name,
    'Tanggal': purchase.transaction_date,
    'Total': purchase.grand_total,
    'Status': purchase.status === 'paid' ? 'Lunas' : purchase.status === 'pending' ? 'Pending' : purchase.status,
    'PPN': purchase.apply_vat ? 'Ya' : 'Tidak',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pembelian');

  // Auto-width columns
  const colWidths = [
    { wch: 5 },  // No
    { wch: 20 }, // No. Transaksi
    { wch: 25 }, // Supplier
    { wch: 12 }, // Tanggal
    { wch: 15 }, // Total
    { wch: 10 }, // Status
    { wch: 8 },  // PPN
  ];
  worksheet['!cols'] = colWidths;

  const fileName = `Laporan_Pembelian_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportAllToExcel = (
  sales: SalesExportData[],
  purchases: PurchaseExportData[]
) => {
  const workbook = XLSX.utils.book_new();

  // Sales sheet
  const salesData = sales.map((sale, index) => ({
    'No': index + 1,
    'No. Transaksi': sale.transaction_number,
    'Pelanggan': sale.customer_name,
    'Tanggal': sale.transaction_date,
    'Total': sale.grand_total,
    'Status': sale.status === 'paid' ? 'Lunas' : sale.status === 'pending' ? 'Pending' : sale.status,
    'PPN': sale.apply_vat ? 'Ya' : 'Tidak',
  }));
  const salesSheet = XLSX.utils.json_to_sheet(salesData);
  salesSheet['!cols'] = [
    { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Penjualan');

  // Purchases sheet
  const purchasesData = purchases.map((purchase, index) => ({
    'No': index + 1,
    'No. Transaksi': purchase.transaction_number,
    'Supplier': purchase.supplier_name,
    'Tanggal': purchase.transaction_date,
    'Total': purchase.grand_total,
    'Status': purchase.status === 'paid' ? 'Lunas' : purchase.status === 'pending' ? 'Pending' : purchase.status,
    'PPN': purchase.apply_vat ? 'Ya' : 'Tidak',
  }));
  const purchasesSheet = XLSX.utils.json_to_sheet(purchasesData);
  purchasesSheet['!cols'] = [
    { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(workbook, purchasesSheet, 'Pembelian');

  const fileName = `Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
