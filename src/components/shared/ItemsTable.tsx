import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionItem } from '@/types/transaction';
import { formatRupiah } from '@/utils/formatters';

interface ItemsTableProps {
  items: TransactionItem[];
  onRemoveItem: (id: string) => void;
}

const ItemsTable = ({ items, onRemoveItem }: ItemsTableProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">
          Belum ada item ditambahkan. Silakan tambahkan item terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="data-table">
        <colgroup>
          <col className="w-[6%]" />
          <col className="w-[14%]" />
          <col className="w-[26%]" />
          <col className="w-[8%]" />
          <col className="w-[10%]" />
          <col className="w-[16%]" />
          <col className="w-[14%]" />
          <col className="w-[6%]" />
        </colgroup>
        <thead>
          <tr>
            <th>No</th>
            <th>Kode Barang</th>
            <th>Nama Barang</th>
            <th className="text-right">Qty</th>
            <th>Satuan</th>
            <th className="text-right">Harga Satuan</th>
            <th className="text-right">Total</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="text-center">{index + 1}</td>
              <td className="font-mono text-sm truncate">{item.itemCode}</td>
              <td className="truncate">{item.itemName}</td>
              <td className="text-right font-mono">{item.quantity}</td>
              <td>{item.unit}</td>
              <td className="text-right font-mono">{formatRupiah(item.unitPrice)}</td>
              <td className="text-right font-mono font-medium">{formatRupiah(item.total)}</td>
              <td>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
