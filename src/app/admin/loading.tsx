import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-3 text-[13px] font-medium text-muted">Đang tải dữ liệu...</p>
    </div>
  );
}
