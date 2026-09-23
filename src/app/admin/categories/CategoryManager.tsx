'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, DataTable, ConfirmDialog, useToast } from '@/components/admin/ui';
import { Trash, Edit2 } from 'lucide-react';

export default function CategoryManager({ initialCategories, canEdit }: { initialCategories: any[], canEdit: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [type, setType] = useState('CATEGORY');
  const [value, setValue] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);

  // Delete dialog state
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setType('CATEGORY');
    setValue('');
    setEditId(null);
  };

  const handleEditClick = (item: any) => {
    setEditId(item.id);
    setType(item.type);
    setValue(item.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    try {
      const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value: value.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi');
      }
      toast.success(editId ? 'Cập nhật danh mục thành công' : 'Thêm danh mục mới thành công');
      resetForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/categories/${itemToDelete.id}`, { method: 'DELETE' });
      toast.success('Đã xóa danh mục');
      setItemToDelete(null);
      if (editId === itemToDelete.id) resetForm();
      router.refresh();
    } catch {
      toast.error('Lỗi khi xóa danh mục');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'type', header: 'Loại', cell: (c: any) => <span className="font-mono text-xs">{c.type === 'CHANNEL' ? 'Kênh liên hệ' : 'Lĩnh vực'}</span> },
    { key: 'value', header: 'Giá trị', cell: (c: any) => <span className="font-semibold text-ink">{c.value}</span> },
    { 
      key: 'actions', 
      header: '', 
      align: 'right' as const, 
      cell: (c: any) => canEdit ? (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleEditClick(c)} className="text-muted hover:bg-white/10 hover:text-ink p-1.5 rounded transition-colors" title="Sửa">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setItemToDelete(c)} className="text-danger hover:bg-danger/20 p-1.5 rounded transition-colors" title="Xóa">
            <Trash size={14} />
          </button>
        </div>
      ) : null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Form thêm/sửa */}
      <div className="md:col-span-1 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="font-semibold text-ink mb-4">{editId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Loại danh mục</label>
              <Select value={type} onChange={(e) => setType(e.target.value)} disabled={loading}>
                <option value="CATEGORY">Lĩnh vực (Category)</option>
                <option value="CHANNEL">Kênh liên hệ (Channel)</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Giá trị</label>
              <Input 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                placeholder="Ví dụ: Zalo, Portfolio..." 
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              {editId && (
                <Button type="button" variant="ghost" onClick={resetForm} disabled={loading} className="flex-1">
                  Hủy
                </Button>
              )}
              <Button type="submit" variant="primary" loading={loading} disabled={!value.trim() || !canEdit} className="flex-1">
                {editId ? 'Lưu cập nhật' : 'Thêm danh mục'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Danh sách */}
      <div className="md:col-span-2">
        <DataTable
          columns={columns}
          rows={initialCategories}
          empty={{ title: 'Chưa có danh mục nào' }}
        />
      </div>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${itemToDelete?.value}" không? Các dữ liệu đã sử dụng danh mục này sẽ vẫn giữ nguyên text của nó.`}
        confirmText="Xóa danh mục"
        loading={deleting}
      />
    </div>
  );
}
