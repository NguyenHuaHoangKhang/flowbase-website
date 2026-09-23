'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Edit2, Trash, Check } from 'lucide-react';
import { useToast, ConfirmDialog } from '@/components/admin/ui';

export default function MessageTemplateRowActions({ template }: { template: any }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [copied, setCopied] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content);
    setCopied(true);
    toast.success('Đã copy nội dung mẫu!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/admin/message-templates/${itemToDelete.id}`, { method: 'DELETE' });
      toast.success('Đã xóa mẫu tin nhắn');
      setItemToDelete(null);
      router.refresh();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={handleCopy}
        title="Copy nội dung"
        className="flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:bg-white/10 hover:text-white"
      >
        {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
      </button>

      <Link
        href={`/admin/message-templates/${template.id}`}
        title="Chỉnh sửa"
        className="flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:bg-white/10 hover:text-white"
      >
        <Edit2 size={15} />
      </Link>

      <button
        onClick={() => setItemToDelete(template)}
        disabled={deleting}
        title="Xóa"
        className="flex h-8 w-8 items-center justify-center rounded text-danger transition-colors hover:bg-danger/20 hover:text-danger disabled:opacity-50"
      >
        <Trash size={15} />
      </button>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Xóa mẫu tin nhắn"
        description={`Bạn có chắc chắn muốn xóa mẫu "${template.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        loading={deleting}
      />
    </div>
  );
}
