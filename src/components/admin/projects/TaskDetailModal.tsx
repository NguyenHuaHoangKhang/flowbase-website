'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Link as LinkIcon, CheckCircle2, Circle, Upload } from 'lucide-react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormField,
  Input,
  Textarea,
} from '@/components/admin/ui';
import { Task } from '@/lib/types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task | null; // If null, it's create mode
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  projectId,
  task,
}: TaskDetailModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const isEdit = !!task;

  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    assigneeId: '',
    estimateHours: '',
    dueDate: '',
    status: 'TODO',
    subtasks: [] as { id: string; title: string; isDone: boolean }[],
    attachments: [] as { id: string; url: string; name: string }[],
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/users')
        .then((res) => res.json())
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [isOpen]);

  // Init form data when task changes
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        detail: task.detail || '',
        assigneeId: task.assigneeName ? users.find(u => u.name === task.assigneeName)?.id || '' : '', // Weak mapping just for demo, ideally we have assigneeId in Task type
        estimateHours: task.estimateHours ? task.estimateHours.toString() : '',
        dueDate: task.dueDate || '',
        status: task.status || 'TODO',
        subtasks: task.subtasks || [],
        attachments: task.attachments || [],
      });
    } else if (isOpen && !task) {
      setFormData({
        title: '',
        detail: '',
        assigneeId: '',
        estimateHours: '',
        dueDate: '',
        status: 'TODO',
        subtasks: [],
        attachments: [],
      });
    }
  }, [isOpen, task, users]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleAddSubtask = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: Math.random().toString(), title: '', isDone: false }]
    }));
  };

  const handleUpdateSubtask = (id: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st => st.id === id ? { ...st, ...updates } : st)
    }));
  };

  const handleRemoveSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== id)
    }));
  };

  const handleAddAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, { id: Math.random().toString(), url: '', name: '' }]
    }));
  };

  const handleUpdateAttachment = (id: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.map(att => att.id === id ? { ...att, ...updates } : att)
    }));
  };

  const handleRemoveAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload thất bại');

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, { id: Math.random().toString(), url: data.url, name: data.name }]
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên công việc.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        detail: formData.detail.trim() || null,
        assigneeId: formData.assigneeId || null,
        estimateHours: formData.estimateHours ? parseFloat(formData.estimateHours) : null,
        dueDate: formData.dueDate || null,
        status: formData.status,
        subtasks: formData.subtasks.filter(st => st.title.trim()), // filter empty
        attachments: formData.attachments.filter(att => att.url.trim()), // filter empty
      };

      const url = isEdit 
        ? `/api/admin/projects/${projectId}/tasks/${task.id}` 
        : `/api/admin/projects/${projectId}/tasks`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra.');
        setLoading(false);
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" // Make it larger for details
      draggable={true} // Allow dragging
      noBackdrop={true} // Do not dim background
    >
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title={isEdit ? "Chi Tiết Công Việc" : "Giao Việc Mới"}
          description={isEdit ? "Cập nhật tiến độ, nội dung và đính kèm" : "Phân bổ công việc cho thành viên"}
          onClose={onClose}
          className="cursor-move" // Hint that header is draggable
        />

        <ModalBody className="space-y-5">
          {error && (
            <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <FormField label="Tên công việc" required>
                <Input
                  placeholder="VD: Thiết kế trang chủ..."
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </FormField>
            </div>
            {isEdit && (
              <div>
                <FormField label="Trạng thái">
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    disabled={loading}
                  >
                    <option value="TODO">Việc cần làm</option>
                    <option value="IN_PROGRESS">Đang làm</option>
                    <option value="REVIEW">Chờ duyệt</option>
                    <option value="DONE">Hoàn thành</option>
                  </select>
                </FormField>
              </div>
            )}
          </div>

          <FormField label="Nội dung nghiệp vụ (Description)">
            <Textarea
              placeholder="Mô tả chi tiết, thông tin khách hàng, yêu cầu cụ thể..."
              rows={3}
              value={formData.detail}
              onChange={(e) => handleChange('detail', e.target.value)}
              disabled={loading}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Người phụ trách">
              <select
                className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.assigneeId}
                onChange={(e) => handleChange('assigneeId', e.target.value)}
                disabled={loading}
              >
                <option value="">-- Chọn thành viên --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Thời gian dự kiến (Giờ)">
              <Input
                type="number"
                placeholder="VD: 8"
                step="0.5"
                min="0"
                value={formData.estimateHours}
                onChange={(e) => handleChange('estimateHours', e.target.value)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Hạn chót">
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          {/* Subtasks Section */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <b className="text-sm">Việc cần làm (Subtasks)</b>
              <Button type="button" variant="ghost" size="sm" onClick={handleAddSubtask} disabled={loading}>
                <Plus className="w-4 h-4 mr-1" /> Thêm
              </Button>
            </div>
            {formData.subtasks.length === 0 && (
              <div className="text-xs text-muted">Chưa có công việc nhỏ nào.</div>
            )}
            <div className="space-y-2">
              {formData.subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleUpdateSubtask(st.id, { isDone: !st.isDone })}
                    className="text-muted hover:text-primary transition-colors"
                  >
                    {st.isDone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <Input 
                    value={st.title} 
                    onChange={e => handleUpdateSubtask(st.id, { title: e.target.value })}
                    placeholder="Mô tả công việc..."
                    className={st.isDone ? "line-through text-muted h-8" : "h-8"}
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-muted hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <b className="text-sm">Tài liệu đính kèm</b>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading || uploading}>
                  <Upload className="w-4 h-4 mr-1" /> {uploading ? 'Đang tải...' : 'Tải lên'}
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <Button type="button" variant="ghost" size="sm" onClick={handleAddAttachment} disabled={loading || uploading}>
                  <Plus className="w-4 h-4 mr-1" /> Thêm Link
                </Button>
              </div>
            </div>
            {formData.attachments.length === 0 && (
              <div className="text-xs text-muted">Chưa có tài liệu nào.</div>
            )}
            <div className="space-y-2">
              {formData.attachments.map((att) => (
                <div key={att.id} className="flex gap-2">
                  <div className="flex-none p-1.5 bg-muted/50 rounded flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input 
                      value={att.name} 
                      onChange={e => handleUpdateAttachment(att.id, { name: e.target.value })}
                      placeholder="Tên tài liệu (VD: Design Figma, Video Demo...)"
                      className="h-8"
                    />
                    <Input 
                      value={att.url} 
                      onChange={e => handleUpdateAttachment(att.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="h-8 text-xs text-blue-600"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="p-1 h-8 flex-none text-muted hover:text-destructive transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Lưu cập nhật' : 'Giao việc'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
