'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// 1. FormField Wrapper (Label + Input container + Error/Hint message)
// ---------------------------------------------------------------------------
export interface FormFieldProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  id?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  hint,
  error,
  className,
  id,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="flex items-center gap-1 text-[13px] font-semibold text-ink">
          <span>{label}</span>
          {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}

      {children}

      {hint && !error && <span className="text-[12px] text-muted">{hint}</span>}

      {error && (
        <span className="flex items-center gap-1 text-[12px] font-medium text-[#DC2626]">
          <AlertCircle size={13} className="flex-none" />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Input Component
// ---------------------------------------------------------------------------
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'h-10 w-full rounded-[10px] border border-border bg-card px-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-all duration-150',
            'focus:border-primary focus:ring-2 focus:ring-primary/10',
            Boolean(leftIcon) && 'pl-9',
            Boolean(rightIcon) && 'pr-9',
            hasError && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/10 bg-[#EF4444]/[0.02]',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 flex items-center text-muted">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ---------------------------------------------------------------------------
// 3. Select Component
// ---------------------------------------------------------------------------
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, options, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-10 w-full rounded-[10px] border border-border bg-card px-3 text-sm text-ink outline-none transition-all duration-150',
          'focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer',
          hasError && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/10',
          className,
        )}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    );
  },
);
Select.displayName = 'Select';

// ---------------------------------------------------------------------------
// 4. Textarea Component
// ---------------------------------------------------------------------------
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full rounded-[10px] border border-border bg-card p-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-all duration-150 resize-y',
          'focus:border-primary focus:ring-2 focus:ring-primary/10',
          hasError && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/10 bg-[#EF4444]/[0.02]',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

// ---------------------------------------------------------------------------
// 5. MoneyInput Component (Tiền tệ VND / USD)
// ---------------------------------------------------------------------------
export interface MoneyInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: 'VND' | 'USD';
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value = 0, onChange, currency = 'VND', className, ...props }, ref) => {
    const formatValue = (num: number) => {
      if (isNaN(num)) return '0';
      return num.toLocaleString('vi-VN');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      const parsed = raw ? parseInt(raw, 10) : 0;
      onChange?.(parsed);
    };

    return (
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-xs font-semibold text-muted">
          {currency === 'VND' ? '₫' : '$'}
        </span>
        <input
          ref={ref}
          type="text"
          value={formatValue(value)}
          onChange={handleChange}
          className={cn(
            'h-10 w-full rounded-[10px] border border-border bg-card pl-8 pr-3 font-mono text-sm text-ink outline-none transition-all duration-150',
            'focus:border-primary focus:ring-2 focus:ring-primary/10',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
MoneyInput.displayName = 'MoneyInput';
