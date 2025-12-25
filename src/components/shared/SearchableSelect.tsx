import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
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

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  data?: any;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onSelect: (value: string, option?: SelectOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  allowCreate?: boolean;
  onCreateNew?: () => void;
  createLabel?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

const SearchableSelect = ({
  options,
  value,
  onSelect,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  emptyText = 'Tidak ditemukan',
  loading = false,
  allowCreate = false,
  onCreateNew,
  createLabel = 'Tambah baru',
  className,
  disabled = false,
  id,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerSearch) ||
        opt.sublabel?.toLowerCase().includes(lowerSearch)
    );
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
          disabled={disabled || loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat...
            </span>
          ) : (
            <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-2 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onSelect(option.value, option);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex flex-col items-start gap-0.5"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                  {option.sublabel && (
                    <span className="text-xs text-muted-foreground truncate max-w-full">
                      {option.sublabel}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate && onCreateNew && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onCreateNew();
                    setOpen(false);
                    setSearch('');
                  }}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createLabel}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
