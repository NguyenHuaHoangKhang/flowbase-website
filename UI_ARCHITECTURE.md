# FLOWBASE Admin — Bản Đặc Tả Kiến Trúc UX/UI & Quy Chuẩn Thiết Kế

Tài liệu này là **kim chỉ nam quy chuẩn** cho toàn bộ hệ thống quản trị FLOWBASE Admin. Bất kỳ lập trình viên hay AI nào khi phát triển tính năng mới **BẮT BUỘC** phải tuân thủ nghiêm ngặt kiến trúc này để đảm bảo tính đồng bộ 100% về giao diện, trải nghiệm và mã nguồn.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

1. **Điểm xuất Component duy nhất (Single Import Source)**:
   Mọi trang hay component con trong `/admin` chỉ được phép import UI từ:
   ```tsx
   import { 
     Button, Input, FormField, Select, Textarea, MoneyInput,
     Modal, Drawer, ConfirmDialog, StatusBadge, DataTable, 
     KpiCard, PageHeader, Toolbar, EmptyState 
   } from '@/components/admin/ui';
   ```
   ❌ **Tuyệt đối KHÔNG**: Tạo mới các button, input, dialog rải rác hay tự viết CSS style ad-hoc lặp lại.

2. **Phân tách trạng thái rõ ràng (State Architecture)**:
   * **Tìm kiếm, Lọc, Phân trang** ➔ **100% dùng URL SearchParams (GET Form)**:
     Giúp trạng thái lọc có thể bookmark, refresh không mất, và chia sẻ link nguyên vẹn cho đồng nghiệp.
   * **Thao tác Thêm / Sửa nhanh** ➔ **Dùng `Modal`** (hộp thoại giữa màn hình).
   * **Xem chi tiết / Form nhập liệu dài (Nhiều trường)** ➔ **Dùng `Drawer`** (trượt từ mép phải).
   * **Xóa / Hủy bỏ / Thao tác nguy hiểm** ➔ **Dùng `ConfirmDialog`** (có tone `danger` hoặc `warning`).

3. **Bảo mật & Phân quyền 2 tầng (Two-Tier RBAC)**:
   * **Tầng 1 - Giao diện (UI)**: Dùng `canAccess(role, resource)` từ `@/lib/rbac` để tự động ẩn menu, ẩn nút thao tác.
   * **Tầng 2 - Máy chủ & API**: Bắt buộc mọi Server Action / API Route đều phải gọi `guard(resource, action)`. Ẩn menu chỉ là trải nghiệm, máy chủ mới là chốt chặn bảo mật cuối cùng.

---

## 2. Design Tokens & Bảng Màu Chuẩn (Color System)

Tất cả màu sắc đã được cấu hình trong `tailwind.config.ts`:

| Token | Giá trị HEX | Mô tả & Cách sử dụng |
| :--- | :--- | :--- |
| `bg` | `#F8F9FB` | Màu nền chính của toàn bộ trang Admin |
| `card` | `#FFFFFF` | Nền của các thẻ Card, Table, Modal, Toolbar |
| `border` | `#E5E7EB` | Viền chuẩn của Card, Input, Table Border |
| `ink` | `#111318` | Màu chữ chính (Heading, Tiêu đề cột, Nội dung đậm) |
| `muted` | `#6B7280` | Màu chữ phụ (Hint, Timestamp, Label phụ, Icon mờ) |
| `primary` | `#2563EB` | Màu thương hiệu chủ đạo (Nút chính, Link, Active tab) |
| `primary-hover` | `#1D4ED8` | Trạng thái hover của nút chính |
| `success` | `#22C55E` | Màu báo thành công, trạng thái Hoàn thành / Đã thanh toán |
| `dark` | `#111318` | Nền của Sidebar Desktop & Drawer Mobile |
| `dark-border` | `#262A33` | Viền ngăn cách trong Sidebar |
| `dark-muted` | `#8A909C` | Chữ mờ trong Sidebar |

---

## 3. Quy Chuẩn Thành Phần Giao Diện (Components Usage)

### 3.1. Nút bấm (`Button`)
```tsx
import { Button } from '@/components/admin/ui';

// Các biến thể:
<Button variant="primary">Lưu thay đổi</Button>
<Button variant="secondary">Hủy</Button>
<Button variant="danger">Xoá dữ liệu</Button>
<Button variant="ghost">Tuỳ chọn</Button>
<Button variant="outline">Xuất file</Button>

// Kèm loading và icon:
<Button variant="primary" loading={isSubmitting}>Đang xử lý</Button>
<Button variant="secondary" icon={<Plus size={16} />} href="/admin/leads/new">Tạo mới</Button>
```

### 3.2. Form Nhập Liệu (`FormField`, `Input`, `Select`, `MoneyInput`)
```tsx
import { FormField, Input, Select, MoneyInput } from '@/components/admin/ui';

<FormField label="Tên khách hàng" required hint="Tên pháp nhân trên hợp đồng" error={errors.name}>
  <Input 
    placeholder="Công ty TNHH..." 
    hasError={!!errors.name} 
    value={name} 
    onChange={e => setName(e.target.value)} 
  />
</FormField>

<FormField label="Ngân sách dự kiến" required>
  <MoneyInput 
    currency="VND" 
    value={budget} 
    onChange={val => setBudget(val)} 
  />
</FormField>
```

### 3.3. Hộp Thoại (`Modal`)
```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/components/admin/ui';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
  <ModalHeader title="Thêm Khách Hàng Mới" onClose={() => setIsOpen(false)} />
  <ModalBody>
    {/* Form nhập liệu */}
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>Đóng</Button>
    <Button variant="primary" onClick={handleSubmit}>Tạo mới</Button>
  </ModalFooter>
</Modal>
```

### 3.4. Bảng Trượt Xem Chi Tiết (`Drawer`)
```tsx
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter, Button } from '@/components/admin/ui';

<Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} size="lg">
  <DrawerHeader title={`Chi tiết Lead: ${lead.name}`} onClose={() => setDrawerOpen(false)} />
  <DrawerBody>
    {/* Chi tiết nội dung */}
  </DrawerBody>
  <DrawerFooter>
    <Button variant="primary" onClick={handleConvert}>Chuyển đổi thành Client</Button>
  </DrawerFooter>
</Drawer>
```

### 3.5. Hộp Thoại Xác Nhận Nguy Hiểm (`ConfirmDialog`)
```tsx
import { ConfirmDialog } from '@/components/admin/ui';

<ConfirmDialog 
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  title="Xác nhận xoá dự án"
  description="Dự án này sẽ được chuyển vào thùng rác (soft-delete). Bạn có chắc chắn muốn tiếp tục?"
  confirmText="Xoá vĩnh viễn"
  tone="danger"
  loading={isDeleting}
/>
```

---

## 4. Ma Trận Phân Quyền (RBAC System)

Hệ thống có 4 vai trò:
1. **`OWNER`**: Toàn quyền trên mọi phân hệ, bao gồm Quản lý User, Cài đặt Hệ thống và Xoá dữ liệu.
2. **`ADMIN`**: Toàn quyền vận hành CRM, Projects, Finance, Demos; không được sửa cấu hình User và Billing settings.
3. **`EDITOR`**: Quản lý Lead, Client, Project, Demo. **Ẩn hoàn toàn menu Tài chính (`invoices`, `expenses`)** và menu Hệ thống.
4. **`VIEWER`**: Chỉ xem dữ liệu, không có quyền Thêm, Sửa hoặc Xoá.

---

## 5. Checklist Khi Xây Dựng Màn Hình Mới

Mọi trang mới trong `/admin` phải tuân theo cấu trúc mẫu sau:
- [ ] Sử dụng `PageHeader` với `title`, `description` và `actions` (nếu có).
- [ ] Thống kê chỉ số quan trọng trên hàng đầu bằng `KpiCard`.
- [ ] Dùng `Toolbar` cho ô tìm kiếm và các dropdown lọc trạng thái (kết nối URL `searchParams`).
- [ ] Dùng `DataTable` để hiển thị danh sách dòng dữ liệu có phân trang.
- [ ] Hiển thị trạng thái bằng `StatusBadge`.
- [ ] Sử dụng `Modal` hoặc `Drawer` khi mở form tạo mới.
- [ ] Kiểm tra quyền `assertCan()` hoặc `canAccess()` trước khi render chức năng thao tác.
