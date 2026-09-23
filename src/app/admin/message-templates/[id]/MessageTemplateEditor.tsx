'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, FormField, Textarea, Combobox, useToast } from '@/components/admin/ui';
import { Save } from 'lucide-react';

export default function MessageTemplateEditor({
  template,
  channelOptions,
  categoryOptions,
}: {
  template: any;
  channelOptions: string[];
  categoryOptions: string[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [data, setData] = useState({
    name: template.name,
    category: template.category,
    channel: template.channel,
    content: template.content,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/message-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi lưu');
      }

      toast.success('Đã lưu mẫu tin nhắn thành công!');
      router.refresh();
      router.push('/admin/message-templates');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột trái: Cấu hình cơ bản */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">Thông tin chung</h3>
          
          <div className="space-y-4">
            <FormField label="Tên Mẫu">
              <Input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Lĩnh vực">
              <Combobox
                options={categoryOptions}
                value={data.category}
                onChange={(val) => setData({ ...data, category: val })}
                placeholder="Ví dụ: Thiết kế Web, CV..."
                required
              />
            </FormField>

            <FormField label="Kênh liên hệ">
              <Combobox
                options={channelOptions}
                value={data.channel}
                onChange={(val) => setData({ ...data, channel: val })}
                placeholder="Ví dụ: Zalo, Email, Facebook..."
                required
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Cột phải: Nội dung */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">Nội dung (Content)</h3>
          
          <Textarea
            value={data.content}
            onChange={(e) => setData({ ...data, content: e.target.value })}
            className="flex-1 font-mono text-sm leading-relaxed min-h-[300px]"
            required
          />

          <div className="mt-4 flex justify-end">
            <Button type="submit" loading={saving} variant="primary" icon={<Save size={16} />}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
