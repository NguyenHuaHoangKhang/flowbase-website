# FLOWBASE

> From Spreadsheet to Software.

Website portfolio cho FLOWBASE — AI-native software studio chuyên biến Excel, Google Sheets
và quy trình thủ công thành phần mềm quản lý, hệ thống nội bộ và workflow automation.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** (design token khai báo trong `tailwind.config.ts`)
- **Framer Motion** cho animation theo scroll
- **Lucide React** cho icon
- Deploy được trên **Vercel** hoặc **Docker/VPS**

## Khởi động hệ thống (1-Click)

Trên Windows:
- **Nhấp đúp chuột vào file [`run.bat`](file:///d:/0.mo_cong_ty_outsource/flowbase/run.bat)** để mở menu tương tác (Dev, Production, Test, Prisma Studio).
- Hoặc chạy bằng PowerShell: `.\run.ps1`

Hoặc dùng lệnh `npm`:
```bash
npm install
npm run dev      # Khởi động máy chủ dev tại http://localhost:3000
npm run build    # Đóng gói bản dựng production tối ưu
npm run start    # Chạy bản build
npm run test:all # Chạy toàn bộ 9 bộ test tích hợp (298/298 PASS)
npm run db:studio# Mở giao diện xem DB trực tiếp
```

> Lưu ý: `next/font` tải Inter và JetBrains Mono từ Google Fonts trong lúc build,
> nên máy build cần truy cập được `fonts.googleapis.com`.

## Cấu trúc

```
src/
├── app/
│   ├── api/contact/route.ts   # nhận request từ form Contact
│   ├── globals.css            # token + layer component dùng chung
│   ├── layout.tsx             # font, metadata, viewport
│   └── page.tsx               # ghép 10 section
├── components/
│   ├── layout/                # Header, Footer
│   ├── navigation/            # MobileMenu
│   ├── hero/                  # Hero, HeroVisual (pipeline animation)
│   ├── problem/               # 02 The problem
│   ├── solutions/             # 03 What we build
│   ├── process/               # 04 How we build
│   ├── ai-native/             # 05 AI-native development (dark)
│   ├── core/                  # 06 FLOWBASE Core (interactive)
│   ├── work/                  # 07 Work / demos
│   ├── case-study/            # 08 Case study
│   ├── technology/            # 09 Technology
│   ├── contact/               # 10 Contact (dark)
│   └── ui/                    # Button, Card, Chip, Reveal, Counter,
│                              # SectionHeading, MockDashboard
├── data/                      # nội dung tách khỏi UI
└── lib/utils.ts
```

Mọi nội dung (problem cards, solutions, steps, core modules, projects, case study,
tech stack) nằm trong `src/data/`. Sửa nội dung không cần chạm vào component.

## Mock dashboard

`src/components/ui/MockDashboard.tsx` render toàn bộ ảnh giao diện từ
`src/data/dashboards.ts`. Thêm một màn hình mới = thêm một entry vào `mockScreens`
rồi tham chiếu qua `screen` trong `projects.ts` hoặc `case-study.ts`.

## Form Contact

`POST /api/contact` kiểm tra dữ liệu rồi:

- forward sang `CONTACT_WEBHOOK_URL` nếu biến môi trường này được cấu hình
  (Slack incoming webhook, Zapier, n8n, CRM endpoint...) → trả `delivered: true`;
- nếu chưa cấu hình → trả `delivered: false`, giao diện sẽ nói rõ với người dùng và
  mở sẵn nội dung qua `mailto` thay vì báo "đã gửi" trong khi không có gì được gửi đi.

Biến môi trường (xem `.env.example`):

```
NEXT_PUBLIC_CONTACT_EMAIL=hello@flowbase.studio
CONTACT_WEBHOOK_URL=            # tuỳ chọn
```

## Admin

Khu vực quản trị nằm ở `/admin`, chạy được ngay với dữ liệu mẫu mà không cần
database. Gồm 13 trang: dashboard, lead, khách hàng, dự án (board + bảng), demo
và quyền xem riêng, hoá đơn, chi phí, kết nối/webhook, người dùng, nhật ký.

Schema PostgreSQL đầy đủ ràng buộc nằm ở `prisma/schema.prisma` và
`prisma/sql/constraints.sql`. Xem **[ADMIN.md](./ADMIN.md)** để biết data model,
API contract và danh sách việc cần nối.

```bash
npx prisma migrate dev --name init
psql "$DATABASE_URL" -f prisma/sql/constraints.sql
npx prisma generate
```

## Deploy

**Vercel** — import repo, không cần cấu hình thêm. Thêm env ở phần Settings nếu cần.

**Docker**

```bash
docker build -t flowbase .
docker run -p 3000:3000 flowbase
```

## Quy tắc nội dung

Các project trong `src/data/projects.ts` là **demo / concept** do FLOWBASE tự dựng,
được gắn nhãn `CONCEPT` hoặc `DEMO` và có disclaimer dưới section Work.
Không dùng logo khách hàng, testimonial hay số liệu kinh doanh chưa có thật.
Khi có dự án thật, thay entry trong `projects.ts` và đổi nhãn tương ứng.
