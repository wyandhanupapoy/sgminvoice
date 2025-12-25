import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Item } from '@/hooks/useItems';
import { formatRupiah } from '@/utils/formatters';

interface ItemSearchableSelectProps {
  items: Item[];
  loading?: boolean;
  onSelect: (item: Item) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

const ItemSearchableSelect = ({
  items,
  loading = false,
  onSelect,
  placeholder = 'Pilih barang...',
  searchPlaceholder = 'Cari barang...',
  emptyText = 'Barang tidak ditemukan',
  className,
}: ItemSearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) return items;
    const lowerSearch = searchValue.toLowerCase();
    return items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(lowerSearch) ||
        item.item_code.toLowerCase().includes(lowerSearch)
    );
  }, [items, searchValue]);

  const handleSelect = (item: Item) => {
    onSelect(item);
    setOpen(false);
    setSearchValue('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
          disabled={loading}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-popover" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-auto">
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Memuat data...
              </div>
            ) : filteredItems.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer py-3"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Package className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{item.item_name}</span>
                          <span className="text-xs font-mono text-muted-foreground shrink-0">
                            {item.item_code}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          <span>{formatRupiah(item.unit_price)} / {item.unit}</span>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ItemSearchableSelect;