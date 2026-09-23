import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Thanh lọc phía trên bảng. Dùng form GET để state nằm trên URL —
 * chia sẻ link là chia sẻ luôn bộ lọc, và không cần client state.
 */
export default function Toolbar({
  action,
  placeholder = 'Tìm kiếm…',
  defaultQuery,
  filters,
  children,
}: {
  action: string;
  placeholder?: string;
  defaultQuery?: string;
  filters?: { name: string; value?: string; options: { value: string; label: string }[] }[];
  children?: React.ReactNode;
}) {
  return (
    <form action={action} className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={defaultQuery}
          placeholder={placeholder}
          className="h-10 w-full rounded-[10px] border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      {filters?.map((f) => (
        <select
          key={f.name}
          name={f.name}
          defaultValue={f.value ?? ''}
          className="h-10 rounded-[10px] border border-border bg-card px-3 text-sm outline-none focus:border-primary"
        >
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}

      <button
        type="submit"
        className={cn(
          'h-10 rounded-[10px] border border-border bg-card px-4 text-sm font-semibold',
          'transition-colors hover:border-[#c9cfd8]',
        )}
      >
        Lọc
      </button>

      {children}
    </form>
  );
}
