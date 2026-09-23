'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Edit2, Play, Trash, Check } from 'lucide-react';

export default function PromptRowActions({ prompt }: { prompt: any }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = () => {
    // Copy gộp cả system prompt và user prompt
    const textToCopy = `[System]\n${prompt.systemPrompt || 'None'}\n\n[User]\n${prompt.userPrompt || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa prompt "${prompt.name}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/prompts/${prompt.id}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      alert('Có lỗi xảy ra khi xóa');
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={handleCopy}
        title="Copy nội dung Prompt"
        className="flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:bg-white/10 hover:text-white"
      >
        {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
      </button>

      <Link
        href={`/admin/prompts/${prompt.id}`}
        title="Chỉnh sửa"
        className="flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:bg-white/10 hover:text-white"
      >
        <Edit2 size={15} />
      </Link>

      <Link
        href={`/admin/prompts/${prompt.id}/run`}
        title="Chạy AI"
        className="flex h-8 w-8 items-center justify-center rounded text-[#10B981] transition-colors hover:bg-[#10B981]/20 hover:text-[#10B981]"
      >
        <Play size={15} />
      </Link>

      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Xóa"
        className="flex h-8 w-8 items-center justify-center rounded text-danger transition-colors hover:bg-danger/20 hover:text-danger disabled:opacity-50"
      >
        <Trash size={15} />
      </button>
    </div>
  );
}
