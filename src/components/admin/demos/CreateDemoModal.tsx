'use client';

import React, { useState } from 'react';
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

interface CreateDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function CreateDemoModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDemoModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [category, setCategory] = useState('Education / Operations');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('CONCEPT');
  const [status, setStatus] = useState('DRAFT');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [accessPassword, setAccessPassword] = useState('');
  const [techStackInput, setTechStackInput] = useState('Next.js, PostgreSQL, TailwindCSS');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setError(null);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    setIsSlugManual(true);
    setError(null);
  };

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
    if (visibility === 'PASSWORD' && (!accessPassword || accessPassword.length < 6)) {
      setError('Mật khẩu xem demo cần ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setError(null);

    const techStack = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim().toLowerCase(),
          category: category.trim(),
          summary: summary.trim(),
          description: description.trim() || null,
          label,
          status,
          visibility,
          accessPassword: visibility === 'PASSWORD' ? accessPassword : null,
          techStack,
          liveUrl: liveUrl.trim() || null,
          repoUrl: repoUrl.trim() || null,
          sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Không thể tạo demo.');
      }

      // Reset form
      setTitle('');
      setSlug('');
      setIsSlugManual(false);
      setSummary('');
      setDescription('');
      setAccessPassword('');
      setLiveUrl('');
      setRepoUrl('');

      onSuccess?.();
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader title="Thêm Bản Demo Mới" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Tên demo" required hint="Ví dụ: Lecturer Management">
              <Input
                placeholder="Nhập tên demo..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                autoFocus
              />
            </FormField>

            <FormField label="Slug (đường dẫn)" required hint="Dạng: lecturer-management">
              <Input
                placeholder="slug-demo..."
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
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
            <FormField label="Chế độ bảo mật (Ai xem được)" required>
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
              <FormField label="Mật khẩu truy cập" required hint="Mật khẩu bảo vệ demo">
                <Input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự..."
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

          <FormField label="Tóm tắt ngắn" required hint="Hiển thị ở danh sách card (10 - 400 ký tự)">
            <Textarea
              rows={2}
              placeholder="Mô tả tóm tắt giải pháp, quy trình và bài toán xử lý..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </FormField>

          <FormField label="Công nghệ sử dụng" hint="Phân tách bằng dấu phẩy">
            <Input
              placeholder="Next.js, PostgreSQL, TailwindCSS, Prisma..."
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="URL Demo trực tiếp (liveUrl)" hint="Tuỳ chọn">
              <Input
                placeholder="https://demo.flowbase.studio/..."
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
              />
            </FormField>

            <FormField label="URL Mã nguồn (repoUrl)" hint="Tuỳ chọn">
              <Input
                placeholder="https://github.com/flowbase/..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </FormField>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Tạo Demo
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
