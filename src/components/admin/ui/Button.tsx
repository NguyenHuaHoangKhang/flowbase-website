'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:scale-[0.99]',
  secondary: 'border border-border bg-card text-ink hover:border-[#c9cfd8] hover:bg-[#F9FAFB] active:scale-[0.99]',
  danger: 'border border-[#EF4444]/30 bg-[#EF4444]/[0.08] text-[#B91C1C] hover:bg-[#EF4444]/15 active:scale-[0.99]',
  ghost: 'text-muted hover:bg-[#F3F4F6] hover:text-ink active:scale-[0.99]',
  outline: 'border border-border bg-transparent text-ink hover:bg-card hover:border-primary/50 active:scale-[0.99]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12.5px] rounded-[8px]',
  md: 'h-10 px-4 text-sm rounded-[10px]',
  lg: 'h-11 px-5 text-[15px] rounded-[12px]',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'secondary',
      size = 'md',
      href,
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const combinedClasses = cn(
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      variantClasses[variant],
      sizeClasses[size],
      (disabled || loading) && 'opacity-60 cursor-not-allowed pointer-events-none',
      className,
    );

    const content = (
      <>
        {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin text-current" />}
        {!loading && icon && iconPosition === 'left' && <span className="flex-none">{icon}</span>}
        <span>{children}</span>
        {!loading && icon && iconPosition === 'right' && <span className="flex-none">{icon}</span>}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={combinedClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={combinedClasses}
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';
