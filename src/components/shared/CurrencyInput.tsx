import { forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder = '0', className, disabled, id }, ref) => {
    const [displayValue, setDisplayValue] = useState(value ? formatNumber(value) : '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Allow only numbers and dots for thousand separators
      const cleanedValue = inputValue.replace(/[^\d]/g, '');
      const numericValue = Number.parseInt(cleanedValue, 10) || 0;
      
      setDisplayValue(numericValue ? formatNumber(numericValue) : '');
      onChange(numericValue);
    };

    const handleBlur = () => {
      if (value) {
        setDisplayValue(formatNumber(value));
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          Rp
        </span>
        <Input
          id={id}
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn('pl-10 text-right font-mono', className)}
          disabled={disabled}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
