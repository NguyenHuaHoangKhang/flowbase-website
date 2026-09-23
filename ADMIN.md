# FLOWBASE Admin — sườn hệ thống

Tài liệu này mô tả phần admin: data model, ràng buộc, các trang đã dựng, API
contract và danh sách việc cần nối. Mục tiêu là để một AI (hoặc người) đọc xong
có thể ráp thành hệ thống hoàn chỉnh mà không phải đoán ý đồ thiết kế.

---

## 1. Tình trạng hiện tại

| Lớp | Đã có | Chưa có |
|---|---|---|
| Data model | Schema Prisma đầy đủ 25 bảng, enum, index, quan hệ | Chưa chạy migrate |
| Ràng buộc | 20+ CHECK, partial unique index, 2 trigger trong `prisma/sql/constraints.sql` | — |
| Validate | Zod schema cho mọi entity, khớp 1-1 với CHECK ở DB | — |
| Phân quyền | Ma trận RBAC 4 vai trò × 10 tài nguyên | Chưa nối với auth thật |
| Giao diện | 13 trang admin chạy được với dữ liệu mẫu | Form tạo/sửa mới ở mức nút bấm |
| API | 9 route handler có validate + phân quyền + audit hook | Thân hàm còn TODO, chưa gọi Prisma |
| Auth | Middleware chặn route, session stub | Chưa có đăng nhập thật |

Admin **chạy được ngay** bằng `npm run dev` → `/admin`, đọc dữ liệu mẫu từ
`src/server/fixtures.ts`. Không cần database để xem giao diện.

---

## 2. Data model

`prisma/schema.prisma` — 7 nhóm bảng:

**Người dùng** `users`, `sessions`
**Demo** `demos`, `demo_assets`, `tags`, `demo_tags`, `demo_views`, `demo_access_grants`
**CRM** `leads`, `clients`, `client_contacts`, `activities`
**Công việc** `projects`, `milestones`, `tasks`, `time_entries`
**Tài chính** `contracts`, `invoices`, `invoice_items`, `payments`, `expenses`
**Kết nối** `integrations`, `webhook_endpoints`, `webhook_deliveries`, `sync_runs`, `api_keys`
**Hệ thống** `site_settings`, `audit_logs`

### Quyết định thiết kế đáng lưu ý

**Tiền dùng `Decimal(18,2)`, không dùng Float.** Float làm tròn sai và tiền
lệch vài đồng trong báo cáo là lỗi rất khó truy.

**`lead` và `client` tách riêng.** Hoá đơn gắn vào `client`, không gắn vào
`lead`. Một lead có thể không bao giờ thành khách; một khách có thể đến từ
nhiều lead khác nhau.

**`invoices.amount_paid` là cache, được trigger cập nhật.** Không để application
code tự cộng trừ — chỉ cần một đường ghi quên cập nhật là số công nợ sai. Trigger
`sync_invoice_payment_state` tính lại từ bảng `payments` mỗi lần có thay đổi, và
tự đổi status sang PARTIAL / PAID / OVERDUE.

**`integrations.secretRef` chỉ lưu *tên* biến môi trường,** không lưu token.
Validator chặn việc dán token thật vào ô này. Server đọc
`process.env[secretRef]` khi cần gọi API. Nếu DB bị lộ, token vẫn an toàn.

**Soft delete** (`deleted_at`) cho các bảng nghiệp vụ, kèm partial unique index
để slug/mã số thuế vẫn unique trên bản còn sống.

**`demo_views.ip_hash`** thay vì IP thô — vẫn đếm được unique mà không giữ dữ
liệu cá nhân.

---

## 3. Ràng buộc

`prisma/sql/constraints.sql` chạy sau `prisma migrate`:

```bash
npx prisma migrate dev
psql "$DATABASE_URL" -f prisma/sql/constraints.sql
```

Nhóm chính:

- **Số không âm** — budget, amount, minutes, score
- **Số học hoá đơn khớp nhau** — `amount = quantity × unit_price`,
  `total = subtotal - discount + tax_amount`, `amount_paid <= total`
- **Trạng thái nhất quán** — PAID phải thu đủ, VOID không có tiền thu,
  LOST phải có lý do, WON phải có ngày chuyển đổi, demo PUBLISHED phải có
  ngày xuất bản, demo PASSWORD phải có hash
- **Ngày hợp lệ** — `due_date >= issue_date`, `end_date >= start_date`
- **Partial unique** — chặn lead trùng email trong cùng ngày, mỗi client chỉ
  một contact chính
- **Trigger** — đồng bộ trạng thái hoá đơn theo payments; hàm
  `mark_overdue_invoices()` gọi bằng cron hằng ngày

Mỗi CHECK đều có một `.refine()` tương ứng trong `src/lib/validators/index.ts`
để người dùng nhận thông báo tiếng Việt thay vì lỗi Postgres. Hai lớp này phải
sửa cùng nhau.

---

## 4. Phân quyền

`src/lib/rbac.ts` — ma trận `role × resource → actions`.

| | dashboard | demo | lead | client | project | invoice | expense | integration | user | audit |
|---|---|---|---|---|---|---|---|---|---|---|
| OWNER | RCUD | RCUD | RCUD | RCUD | RCUD | RCUD | RCUD | RCUD | RCUD | RCUD |
| ADMIN | R | RCUD | RCUD | RCUD | RCUD | RCU | RCU | RCU | — | R |
| EDITOR | R | RCU | RCU | R | RCU | — | — | — | — | — |
| VIEWER | R | R | R | R | R | — | — | — | — | — |

EDITOR **không thấy** menu tài chính — sidebar tự ẩn theo `canAccess()`.
API kiểm tra lại bằng `guard()` vì ẩn menu không phải là bảo mật.

---

## 5. Các trang đã dựng

```
/admin                     Dashboard: KPI, biểu đồ 6 tháng, lead mới, dự án đến hạn
/admin/leads               Danh sách + lọc theo trạng thái, KPI theo phễu
/admin/leads/[id]          Chi tiết, nội dung gửi, demo đã chia sẻ
/admin/clients             Khách hàng, công nợ từng bên
/admin/projects            Board pipeline 7 cột + chế độ bảng
/admin/projects/[id]       Mốc thanh toán, task, hoá đơn, lãi gộp tạm tính
/admin/demos               Danh sách demo + quản lý quyền xem riêng
/admin/invoices            Danh sách + KPI công nợ
/admin/invoices/[id]       Chi tiết số học, lịch sử thanh toán
/admin/expenses            Chi phí, lọc theo nhóm, chi phí cố định hằng tháng
/admin/integrations        Kết nối, cảnh báo lỗi, webhook, danh sách event
/admin/users               Người dùng + bảng ma trận phân quyền sinh từ code
/admin/audit               Nhật ký hệ thống
/demo/[slug]               Trang public xem demo, có kiểm tra quyền
```

Bộ lọc dùng form GET → state nằm trên URL, chia sẻ link là chia sẻ luôn bộ lọc.

---

## 6. API contract

Mọi route admin đi qua `guard(resource, action)` trong `src/app/api/_lib.ts`.

```
GET    /api/admin/leads?q=&status=&page=     → Paginated<Lead>
POST   /api/admin/leads                      → 201 Lead
GET    /api/admin/leads/[id]                 → Lead | 404
PATCH  /api/admin/leads/[id]                 → Lead
DELETE /api/admin/leads/[id]                 → 204 (soft delete)

GET    /api/admin/demos                      → Paginated<Demo>
POST   /api/admin/demos                      → 201 Demo
GET    /api/admin/demos/grants?demoId=       → DemoAccessGrant[]
POST   /api/admin/demos/grants               → 201 { ...grant, shareUrl }

GET    /api/admin/projects                   → Paginated<Project>
POST   /api/admin/projects                   → 201 Project

GET    /api/admin/invoices                   → Paginated<Invoice>
POST   /api/admin/invoices                   → 201 Invoice (tổng tính lại ở server)

GET    /api/admin/expenses                   → Paginated<Expense>
POST   /api/admin/expenses                   → 201 Expense

POST   /api/admin/integrations/[id]/test     → { ok, status, message? }

POST   /api/contact                          → { delivered: boolean }  (public)
```

Mã lỗi: `401` chưa đăng nhập · `403` không đủ quyền · `404` không tìm thấy ·
`422` validate fail (kèm `fields`) · `409` vi phạm unique.

---

## 7. Việc cần nối

Theo thứ tự nên làm:

**1. Dựng database**
```bash
npx prisma migrate dev --name init
psql "$DATABASE_URL" -f prisma/sql/constraints.sql
npx prisma generate
npx prisma db seed
```

**2. Thay repository** — `src/server/repositories.ts`. Giữ nguyên chữ ký hàm và
kiểu trả về, chỉ đổi thân hàm sang truy vấn Prisma. Mỗi hàm đã có comment ví dụ.
Xong bước này thì xoá `src/server/fixtures.ts`.

**3. Đổi type import** — `src/lib/types.ts` viết tay để chạy được khi chưa có DB.
Sau `prisma generate`, đổi sang `import type { Lead } from '@prisma/client'`.
Tên field đã khớp sẵn nên component không phải sửa.

**4. Auth** — `src/lib/session.ts` đang trả user giả. Nối NextAuth / Lucia / tự
viết, đọc cookie → bảng `sessions`. Bỏ nhánh `isDev` trong `src/middleware.ts`.
Tạo trang `/admin/login`.

**5. Thân các API route** — mỗi route đã có validate, phân quyền, audit hook và
comment TODO chỉ rõ cần làm gì. Đặc biệt:
- `POST /api/admin/demos` phải hash `accessPassword` bằng bcrypt
- `POST /api/admin/projects` nên sinh `code` bằng sequence trong DB, không để
  client gửi lên (tránh race condition)
- `POST /api/contact` bắt lỗi P2002 từ `uniq_lead_email_per_day` và trả 200 êm

**6. Form tạo/sửa** — các nút "Thêm", "Tạo", "Cấu hình" hiện chưa mở modal. Dùng
lại zod schema đã có để validate phía client, gọi API tương ứng.

**7. Worker webhook** — `emitEvent()` mới chỉ log. Cần: ghi `webhook_deliveries`,
gửi HTTP, retry theo `next_retry_at` với backoff.

**8. Cron** — gọi `SELECT mark_overdue_invoices();` hằng ngày.

**9. Upload file** — `demo_assets.url` và `invoices.file_url` giả định object
storage (S3/R2). Cần route ký URL upload.

---

## 8. Nguyên tắc giữ khi mở rộng

- Không tin số client gửi lên với bất cứ thứ gì liên quan tiền — tính lại ở
  server, và để DB kiểm lần nữa.
- Không thêm đường ghi dữ liệu nào bỏ qua `recordAudit()`.
- Không lưu secret trong bảng — chỉ lưu tên biến môi trường.
- Thêm một CHECK mới thì thêm luôn `.refine()` tương ứng trong zod.
- Dữ liệu mẫu chỉ nằm trong fixtures, không seed vào DB thật. Số liệu tài chính
  giả trong production rất dễ bị đọc nhầm thành số thật.
