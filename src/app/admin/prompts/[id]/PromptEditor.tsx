'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Trash, Play } from 'lucide-react';

export default function PromptEditor({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isNew = !initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    tags: initialData?.tags?.join(', ') || '',
    systemPrompt: initialData?.systemPrompt || '',
    userPrompt: initialData?.userPrompt || '',
  });

  const extractVariables = (text: string) => {
    const matches = text.match(/{{([^}]+)}}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.replace(/{{|}}/g, '').trim())));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên Prompt');
      return;
    }

    setSaving(true);
    const variables = extractVariables(formData.userPrompt);

    try {
      const res = await fetch(`/api/admin/prompts${isNew ? '' : `/${initialData.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
          variables,
        }),
      });

      if (!res.ok) throw new Error('Lỗi khi lưu prompt');

      alert(isNew ? 'Đã tạo prompt thành công' : 'Đã cập nhật prompt');
      router.push('/admin/prompts');
      router.refresh();
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa prompt này?')) return;
    try {
      await fetch(`/api/admin/prompts/${initialData.id}`, { method: 'DELETE' });
      alert('Đã xoá prompt');
      router.push('/admin/prompts');
      router.refresh();
    } catch {
      alert('Lỗi khi xóa');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[14px] text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="flex items-center gap-3">
          {!isNew && (
            <>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 text-[13.5px] font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
              >
                <Trash size={16} /> Xóa
              </button>
              <button
                type="button"
                onClick={() => router.push(`/admin/prompts/${initialData.id}/run`)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#10B981] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#059669]"
              >
                <Play size={16} /> Chạy AI
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Thông tin chung</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-muted">Tên Prompt</label>
              <input
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[14px] outline-none focus:border-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Khảo sát khách hàng mới"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-muted">Mô tả ngắn</label>
              <input
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[14px] outline-none focus:border-primary"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-muted">Tags (cách nhau bởi dấu phẩy)</label>
              <input
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[14px] outline-none focus:border-primary"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="sales, workflow, form"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Cấu hình AI Prompt</h2>
          <div className="grid gap-6">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-muted">
                System Prompt (Vai trò của AI)
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[14px] outline-none focus:border-primary"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="You are an expert system architect and workflow consultant..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-muted">
                User Prompt (Sử dụng {'{{tên_biến}}'} để chèn dữ liệu động)
              </label>
              <textarea
                rows={10}
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[14px] font-mono outline-none focus:border-primary"
                value={formData.userPrompt}
                onChange={(e) => setFormData({ ...formData, userPrompt: e.target.value })}
                placeholder={`Dựa trên câu trả lời của khách hàng sau đây:\n\n{{customer_answers}}\n\nHãy tạo cho tôi một quy trình...`}
              />
              <div className="mt-2 text-[12px] text-muted">
                Các biến tự động nhận diện:{' '}
                {extractVariables(formData.userPrompt).length > 0 ? (
                  extractVariables(formData.userPrompt).map((v) => (
                    <span key={v} className="ml-1 rounded bg-primary/10 px-1 py-0.5 text-primary">
                      {v}
                    </span>
                  ))
                ) : (
                  <span className="italic">Chưa có biến nào</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
