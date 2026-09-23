'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function Combobox({ options, value, onChange, className, placeholder, ...props }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase()) && opt !== value
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          {...props}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink transition-colors',
            'placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:bg-card disabled:text-muted disabled:opacity-50',
            className
          )}
        />
        <div 
          className="absolute right-3 flex h-full cursor-pointer items-center text-muted hover:text-ink"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown size={16} />
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card p-1 shadow-md animate-in fade-in zoom-in-95">
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-white/[0.04] hover:text-ink text-muted"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
