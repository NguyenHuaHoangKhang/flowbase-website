'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from '@/components/admin/ui';
import type { Demo } from '@/lib/types';

interface EditDemoModalProps {
  isOpen: boolean;
  demo: Demo | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditDemoModal({
  isOpen,
  demo,
  onClose,
  onSuccess,
}: EditDemoModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('CONCEPT');
  const [status, setStatus] = useState('DRAFT');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [accessPassword, setAccessPassword] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  useEffect(() => {
    if (demo) {
      setTitle(demo.title);
      setSlug(demo.slug);
      setCategory(demo.category);
      setSummary(demo.summary);
      setDescription('');
      setLabel(demo.label);
      setStatus(demo.status);
      setVisibility(demo.visibility);
      setAccessPassword('');
      setTechStackInput(demo.techStack.join(', '));
      setLiveUrl(demo.liveUrl || '');
      setRepoUrl('');
      setSortOrder(String(demo.sortOrder));
      setError(null);
    }
  }, [demo]);

  if (!demo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên demo.');
      return;
    }
    if (!slug.trim()) {
      setError('Vui lòng nhập slug hợp lệ.');
      return;
    }
    if (summary.trim().length < 10) {
      setError('Tóm tắt cần ít nhất 10 ký tự.');
      return;
    }

    setLoading(true);
    setError(null);

    const techStack = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const payload: any = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        category: category.trim(),
        summary: summary.trim(),
        label,
        status,
        visibility,
        techStack,
        liveUrl: liveUrl.trim() || null,
        sortOrder: parseInt(sortOrder, 10) || 0,
      };

      if (visibility === 'PASSWORD' && accessPassword.trim()) {
        payload.accessPassword = accessPassword.trim();
      }

      const res = await fetch(`/api/admin/demos/${demo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Không thể cập nhật demo.');
      }

      onSuccess?.();
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader title={`Chỉnh sửa Demo: ${demo.title}`} onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Tên demo" required>
              <Input
                placeholder="Nhập tên demo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormField>

            <FormField label="Slug (đường dẫn)" required>
              <Input
                placeholder="slug-demo..."
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Danh mục" required>
              <Input
                placeholder="Ví dụ: Education / CRM"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </FormField>

            <FormField label="Nhãn hiển thị" required>
              <Select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                options={[
                  { value: 'CONCEPT', label: 'CONCEPT (Khái niệm)' },
                  { value: 'DEMO', label: 'DEMO (Chạy mẫu)' },
                  { value: 'PROTOTYPE', label: 'PROTOTYPE (Nguyên mẫu)' },
                  { value: 'CASE_STUDY', label: 'CASE STUDY (Dự án thật)' },
                ]}
              />
            </FormField>

            <FormField label="Trạng thái" required>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'DRAFT', label: 'DRAFT (Bản nháp)' },
                  { value: 'PUBLISHED', label: 'PUBLISHED (Xuất bản)' },
                  { value: 'ARCHIVED', label: 'ARCHIVED (Lưu trữ)' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Chế độ bảo mật" required>
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                options={[
                  { value: 'PUBLIC', label: 'PUBLIC — Công khai trên website' },
                  { value: 'UNLISTED', label: 'UNLISTED — Chỉ ai có link trực tiếp' },
                  { value: 'PASSWORD', label: 'PASSWORD — Cần nhập mật khẩu' },
                  { value: 'GRANT_ONLY', label: 'GRANT_ONLY — Chỉ link có token riêng' },
                ]}
              />
            </FormField>

            {visibility === 'PASSWORD' ? (
              <FormField label="Đổi mật khẩu mới" hint="Bỏ trống nếu giữ nguyên mật khẩu cũ">
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu mới nếu muốn đổi..."
                  value={accessPassword}
                  onChange={(e) => setAccessPassword(e.target.value)}
                />
              </FormField>
            ) : (
              <FormField label="Thứ tự sắp xếp" hint="Số nhỏ đứng trước">
                <Input
                  type="number"
                  placeholder="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </FormField>
            )}
          </div>

          <FormField label="Tóm tắt ngắn" required>
            <Textarea
              rows={2}
              placeholder="Mô tả tóm tắt giải pháp..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </FormField>

          <FormField label="Công nghệ sử dụng" hint="Phân tách bằng dấu phẩy">
            <Input
              placeholder="Next.js, PostgreSQL, TailwindCSS..."
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
            />
          </FormField>

          <FormField label="URL Demo trực tiếp (liveUrl)" hint="Tuỳ chọn">
            <Input
              placeholder="https://demo.flowbase.studio/..."
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Lưu Thay Đổi
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
