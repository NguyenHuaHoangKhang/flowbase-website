/**
 * Dữ liệu mẫu để admin chạy được khi chưa nối database.
 * Đây là dữ liệu do FLOWBASE tự tạo để dựng giao diện — không phải
 * dữ liệu khách hàng thật. Khi nối Prisma, xoá file này và sửa
 * src/server/repositories.ts.
 */
import type {
  AuditLog, Client, Demo, DemoAccessGrant, Expense, Integration, Invoice,
  Lead, Milestone, Payment, Project, Task, User, WebhookEndpoint,
} from '@/lib/types';

const iso = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();
const day = (daysFromNow: number) =>
  new Date(Date.now() + daysFromNow * 86_400_000).toISOString().slice(0, 10);

export const users: User[] = [
  { id: 'usr_1', email: 'owner@flowbase.studio', name: 'Trần Quốc Việt', avatarUrl: null, role: 'OWNER', status: 'ACTIVE', lastLoginAt: iso(0), createdAt: iso(300) },
  { id: 'usr_2', email: 'admin@flowbase.studio', name: 'Nguyễn Hải Yến', avatarUrl: null, role: 'ADMIN', status: 'ACTIVE', lastLoginAt: iso(1), createdAt: iso(180) },
  { id: 'usr_3', email: 'dev@flowbase.studio', name: 'Lê Anh Khoa', avatarUrl: null, role: 'EDITOR', status: 'ACTIVE', lastLoginAt: iso(3), createdAt: iso(90) },
  { id: 'usr_4', email: 'ketoan@flowbase.studio', name: 'Phạm Thu Hà', avatarUrl: null, role: 'VIEWER', status: 'INVITED', lastLoginAt: null, createdAt: iso(5) },
];

export const demos: Demo[] = [
  { id: 'dem_1', slug: 'lecturer-management', title: 'Lecturer Management', category: 'Education / Operations', summary: 'Quản lý hồ sơ, hợp đồng, phân công, số tiết và thanh toán giảng viên.', label: 'CONCEPT', status: 'PUBLISHED', visibility: 'PUBLIC', coverUrl: null, liveUrl: 'https://demo.flowbase.studio/lecturer', techStack: ['Next.js', 'NestJS', 'PostgreSQL'], sortOrder: 1, viewCount: 412, publishedAt: iso(40), updatedAt: iso(3) },
  { id: 'dem_2', slug: 'training-center', title: 'Training Center', category: 'Education / CRM', summary: 'Quản lý học viên, lớp học, khóa học, học phí và điểm danh.', label: 'CONCEPT', status: 'PUBLISHED', visibility: 'PUBLIC', coverUrl: null, liveUrl: null, techStack: ['Next.js', 'Prisma'], sortOrder: 2, viewCount: 268, publishedAt: iso(32), updatedAt: iso(6) },
  { id: 'dem_3', slug: 'hr-management', title: 'HR Management', category: 'Human Resources', summary: 'Quản lý nhân sự, hợp đồng, hồ sơ và quy trình nội bộ.', label: 'DEMO', status: 'PUBLISHED', visibility: 'UNLISTED', coverUrl: null, liveUrl: null, techStack: ['Next.js'], sortOrder: 3, viewCount: 96, publishedAt: iso(20), updatedAt: iso(2) },
  { id: 'dem_4', slug: 'workflow-management', title: 'Workflow Management', category: 'Operations', summary: 'Quản lý quy trình xử lý và phê duyệt với lịch sử đầy đủ.', label: 'DEMO', status: 'PUBLISHED', visibility: 'GRANT_ONLY', coverUrl: null, liveUrl: null, techStack: ['NestJS'], sortOrder: 4, viewCount: 34, publishedAt: iso(14), updatedAt: iso(1) },
  { id: 'dem_5', slug: 'inventory-lite', title: 'Inventory Lite', category: 'Operations', summary: 'Theo dõi tồn kho và phiếu nhập xuất cho SME.', label: 'PROTOTYPE', status: 'DRAFT', visibility: 'GRANT_ONLY', coverUrl: null, liveUrl: null, techStack: [], sortOrder: 5, viewCount: 0, publishedAt: null, updatedAt: iso(0) },
];

export const grants: DemoAccessGrant[] = [
  { id: 'grt_1', demoId: 'dem_4', demoTitle: 'Workflow Management', leadId: 'led_1', email: 'chi.nguyen@trungtamabc.vn', token: 'gr_8fk2n9x', maxViews: 20, viewCount: 6, expiresAt: iso(-14), revokedAt: null, lastViewAt: iso(2), createdAt: iso(9) },
  { id: 'grt_2', demoId: 'dem_3', demoTitle: 'HR Management', leadId: 'led_3', email: 'hr@congtyxyz.com', token: 'gr_2ld05va', maxViews: null, viewCount: 3, expiresAt: null, revokedAt: null, lastViewAt: iso(5), createdAt: iso(12) },
  { id: 'grt_3', demoId: 'dem_4', demoTitle: 'Workflow Management', leadId: null, email: 'partner@agency.vn', token: 'gr_zq71m4p', maxViews: 5, viewCount: 5, expiresAt: iso(-2), revokedAt: iso(1), lastViewAt: iso(4), createdAt: iso(20) },
];

export const leads: Lead[] = [
  { id: 'led_1', name: 'Nguyễn Thị Chi', email: 'chi.nguyen@trungtamabc.vn', phone: '0903 112 445', company: 'Trung tâm đào tạo ABC', message: 'Bên em đang quản lý giảng viên bằng 4 file Excel, mỗi kỳ tổng hợp số tiết mất gần một tuần.', status: 'PROPOSAL', source: 'WEBSITE_FORM', score: 82, ownerId: 'usr_1', ownerName: 'Trần Quốc Việt', utmSource: 'google', lostReason: null, contactedAt: iso(8), convertedAt: null, createdAt: iso(10) },
  { id: 'led_2', name: 'Trần Văn Bình', email: 'binh@nhaphanphoi.vn', phone: null, company: 'Nhà phân phối Bình Minh', message: 'Cần hệ thống theo dõi đơn hàng và công nợ thay cho Google Sheets.', status: 'NEW', source: 'WEBSITE_FORM', score: 40, ownerId: null, ownerName: null, utmSource: null, lostReason: null, contactedAt: null, convertedAt: null, createdAt: iso(1) },
  { id: 'led_3', name: 'Đỗ Minh Hằng', email: 'hr@congtyxyz.com', phone: '0912 887 330', company: 'Công ty XYZ', message: 'Muốn số hoá quy trình duyệt nghỉ phép và hồ sơ nhân sự.', status: 'WON', source: 'REFERRAL', score: 90, ownerId: 'usr_2', ownerName: 'Nguyễn Hải Yến', utmSource: null, lostReason: null, contactedAt: iso(30), convertedAt: iso(18), createdAt: iso(34) },
  { id: 'led_4', name: 'Lý Thanh Sơn', email: 'son.ly@startupdef.io', phone: null, company: 'Startup DEF', message: 'Cần MVP nội bộ trong 6 tuần, ngân sách hạn chế.', status: 'LOST', source: 'LINKEDIN', score: 35, ownerId: 'usr_1', ownerName: 'Trần Quốc Việt', utmSource: null, lostReason: 'Ngân sách thấp hơn mức tối thiểu', contactedAt: iso(25), convertedAt: null, createdAt: iso(28) },
  { id: 'led_5', name: 'Vũ Gia Khánh', email: 'khanh@agencyghi.vn', phone: '0988 231 004', company: 'Agency GHI', message: 'Tìm đội white-label làm internal tool cho khách của bên mình.', status: 'QUALIFIED', source: 'ZALO', score: 68, ownerId: 'usr_2', ownerName: 'Nguyễn Hải Yến', utmSource: null, lostReason: null, contactedAt: iso(4), convertedAt: null, createdAt: iso(6) },
  { id: 'led_6', name: 'Marketing Bot', email: 'promo@spamdomain.top', phone: null, company: null, message: 'Increase your traffic now with our SEO service!!!', status: 'SPAM', source: 'WEBSITE_FORM', score: 0, ownerId: null, ownerName: null, utmSource: null, lostReason: null, contactedAt: null, convertedAt: null, createdAt: iso(2) },
];

export const clients: Client[] = [
  { id: 'cli_1', name: 'Công ty XYZ', taxCode: '0312345678', status: 'ACTIVE', email: 'ketoan@congtyxyz.com', phone: '028 3822 1100', projectCount: 2, totalBilled: 385_000_000, outstanding: 90_000_000, createdAt: iso(18) },
  { id: 'cli_2', name: 'Trung tâm đào tạo ABC', taxCode: '0398765432', status: 'PROSPECT', email: 'chi.nguyen@trungtamabc.vn', phone: '0903 112 445', projectCount: 1, totalBilled: 0, outstanding: 0, createdAt: iso(9) },
  { id: 'cli_3', name: 'Agency GHI', taxCode: null, status: 'PROSPECT', email: 'khanh@agencyghi.vn', phone: null, projectCount: 0, totalBilled: 0, outstanding: 0, createdAt: iso(5) },
];

export const projects: Project[] = [
  { id: 'prj_1', code: 'FB-2026-001', title: 'HR & quy trình duyệt nội bộ', clientId: 'cli_1', clientName: 'Công ty XYZ', ownerId: 'usr_2', ownerName: 'Nguyễn Hải Yến', status: 'IN_PROGRESS', priority: 'HIGH', billingType: 'MILESTONE', budgetAmount: 285_000_000, currency: 'VND', progress: 62, startDate: day(-45), dueDate: day(25), invoicedAmount: 185_000_000, paidAmount: 95_000_000, summary: '' },
  { id: 'prj_2', code: 'FB-2026-002', title: 'Cổng báo cáo vận hành', clientId: 'cli_1', clientName: 'Công ty XYZ', ownerId: 'usr_3', ownerName: 'Lê Anh Khoa', status: 'UAT', priority: 'NORMAL', billingType: 'FIXED', budgetAmount: 100_000_000, currency: 'VND', progress: 88, startDate: day(-70), dueDate: day(6), invoicedAmount: 100_000_000, paidAmount: 100_000_000, summary: '' },
  { id: 'prj_3', code: 'FB-2026-003', title: 'Lecturer Management — giai đoạn 1', clientId: 'cli_2', clientName: 'Trung tâm đào tạo ABC', ownerId: 'usr_1', ownerName: 'Trần Quốc Việt', status: 'PROPOSAL', priority: 'HIGH', billingType: 'FIXED', budgetAmount: 220_000_000, currency: 'VND', progress: 0, startDate: null, dueDate: day(60), invoicedAmount: 0, paidAmount: 0, summary: '' },
  { id: 'prj_4', code: 'FB-2026-004', title: 'Internal tool white-label', clientId: 'cli_3', clientName: 'Agency GHI', ownerId: null, ownerName: null, status: 'DISCOVERY', priority: 'NORMAL', billingType: 'HOURLY', budgetAmount: 0, currency: 'VND', progress: 0, startDate: null, dueDate: null, invoicedAmount: 0, paidAmount: 0, summary: '' },
  { id: 'prj_5', code: 'FB-2025-018', title: 'Hệ thống chấm công thử nghiệm', clientId: 'cli_1', clientName: 'Công ty XYZ', ownerId: 'usr_3', ownerName: 'Lê Anh Khoa', status: 'DELIVERED', priority: 'LOW', billingType: 'FIXED', budgetAmount: 60_000_000, currency: 'VND', progress: 100, startDate: day(-160), dueDate: day(-95), invoicedAmount: 60_000_000, paidAmount: 60_000_000, summary: '' },
];

export const milestones: Milestone[] = [
  { id: 'mil_1', projectId: 'prj_1', title: 'Khảo sát & data model', amount: 60_000_000, status: 'PAID', dueDate: day(-30), sortOrder: 1 },
  { id: 'mil_2', projectId: 'prj_1', title: 'Module hồ sơ nhân sự', amount: 95_000_000, status: 'INVOICED', dueDate: day(-5), sortOrder: 2 },
  { id: 'mil_3', projectId: 'prj_1', title: 'Luồng duyệt & phân quyền', amount: 90_000_000, status: 'IN_PROGRESS', dueDate: day(20), sortOrder: 3 },
  { id: 'mil_4', projectId: 'prj_1', title: 'Bàn giao & đào tạo', amount: 40_000_000, status: 'PLANNED', dueDate: day(25), sortOrder: 4 },
];

export const tasks: Task[] = [
  { id: 'tsk_1', projectId: 'prj_1', title: 'Thiết kế bảng permission theo phòng ban', status: 'IN_PROGRESS', assigneeName: 'Lê Anh Khoa', estimateHours: 12, dueDate: day(3), detail: null, subtasks: [], attachments: [] },
  { id: 'tsk_2', projectId: 'prj_1', title: 'API duyệt nghỉ phép nhiều cấp', status: 'REVIEW', assigneeName: 'Lê Anh Khoa', estimateHours: 20, dueDate: day(1), detail: null, subtasks: [], attachments: [] },
  { id: 'tsk_3', projectId: 'prj_1', title: 'Import dữ liệu nhân sự từ Excel cũ', status: 'TODO', assigneeName: null, estimateHours: 8, dueDate: day(10), detail: null, subtasks: [], attachments: [] },
  { id: 'tsk_4', projectId: 'prj_1', title: 'Chờ khách xác nhận danh sách phòng ban', status: 'BLOCKED', assigneeName: 'Nguyễn Hải Yến', estimateHours: null, dueDate: null, detail: null, subtasks: [], attachments: [] },
];

export const invoices: Invoice[] = [
  { id: 'inv_1', code: 'INV-2026-001', clientId: 'cli_1', clientName: 'Công ty XYZ', projectId: 'prj_1', projectCode: 'FB-2026-001', status: 'PAID', issueDate: day(-40), dueDate: day(-25), currency: 'VND', subtotal: 60_000_000, discount: 0, taxRate: 8, taxAmount: 4_800_000, total: 64_800_000, amountPaid: 64_800_000 },
  { id: 'inv_2', code: 'INV-2026-002', clientId: 'cli_1', clientName: 'Công ty XYZ', projectId: 'prj_2', projectCode: 'FB-2026-002', status: 'PAID', issueDate: day(-30), dueDate: day(-15), currency: 'VND', subtotal: 100_000_000, discount: 5_000_000, taxRate: 8, taxAmount: 7_600_000, total: 102_600_000, amountPaid: 102_600_000 },
  { id: 'inv_3', code: 'INV-2026-003', clientId: 'cli_1', clientName: 'Công ty XYZ', projectId: 'prj_1', projectCode: 'FB-2026-001', status: 'PARTIAL', issueDate: day(-12), dueDate: day(3), currency: 'VND', subtotal: 95_000_000, discount: 0, taxRate: 8, taxAmount: 7_600_000, total: 102_600_000, amountPaid: 30_000_000 },
  { id: 'inv_4', code: 'INV-2026-004', clientId: 'cli_1', clientName: 'Công ty XYZ', projectId: 'prj_1', projectCode: 'FB-2026-001', status: 'OVERDUE', issueDate: day(-45), dueDate: day(-8), currency: 'VND', subtotal: 30_000_000, discount: 0, taxRate: 8, taxAmount: 2_400_000, total: 32_400_000, amountPaid: 0 },
  { id: 'inv_5', code: 'INV-2026-005', clientId: 'cli_2', clientName: 'Trung tâm đào tạo ABC', projectId: 'prj_3', projectCode: 'FB-2026-003', status: 'DRAFT', issueDate: day(0), dueDate: day(15), currency: 'VND', subtotal: 66_000_000, discount: 0, taxRate: 8, taxAmount: 5_280_000, total: 71_280_000, amountPaid: 0 },
];

export const payments: Payment[] = [
  { id: 'pay_1', invoiceId: 'inv_1', invoiceCode: 'INV-2026-001', amount: 64_800_000, currency: 'VND', method: 'BANK_TRANSFER', paidAt: day(-26), reference: 'FT26031200912' },
  { id: 'pay_2', invoiceId: 'inv_2', invoiceCode: 'INV-2026-002', amount: 102_600_000, currency: 'VND', method: 'BANK_TRANSFER', paidAt: day(-16), reference: 'FT26032104417' },
  { id: 'pay_3', invoiceId: 'inv_3', invoiceCode: 'INV-2026-003', amount: 30_000_000, currency: 'VND', method: 'BANK_TRANSFER', paidAt: day(-4), reference: 'FT26040200338' },
];

export const expenses: Expense[] = [
  { id: 'exp_1', projectId: null, projectCode: null, category: 'INFRASTRUCTURE', vendor: 'VPS Hosting', description: 'Server staging + production', amount: 2_400_000, currency: 'VND', spentAt: day(-5), billable: false, recurrence: 'monthly' },
  { id: 'exp_2', projectId: null, projectCode: null, category: 'SOFTWARE', vendor: 'GitHub Team', description: 'License 5 chỗ', amount: 1_100_000, currency: 'VND', spentAt: day(-5), billable: false, recurrence: 'monthly' },
  { id: 'exp_3', projectId: 'prj_1', projectCode: 'FB-2026-001', category: 'CONTRACTOR', vendor: 'Designer freelance', description: 'Thiết kế màn hình hồ sơ nhân sự', amount: 18_000_000, currency: 'VND', spentAt: day(-20), billable: true, recurrence: null },
  { id: 'exp_4', projectId: null, projectCode: null, category: 'SALARY', vendor: 'Nội bộ', description: 'Lương tháng', amount: 145_000_000, currency: 'VND', spentAt: day(-8), billable: false, recurrence: 'monthly' },
  { id: 'exp_5', projectId: 'prj_2', projectCode: 'FB-2026-002', category: 'INFRASTRUCTURE', vendor: 'Object storage', description: 'Lưu file khách hàng', amount: 850_000, currency: 'VND', spentAt: day(-12), billable: true, recurrence: 'monthly' },
];

export const integrations: Integration[] = [
  { id: 'int_1', provider: 'SLACK', name: 'Thông báo lead mới', status: 'CONNECTED', scopes: ['chat:write'], secretRef: 'SLACK_BOT_TOKEN', lastSyncAt: iso(0), lastError: null },
  { id: 'int_2', provider: 'GOOGLE_SHEETS', name: 'Sao lưu lead hằng ngày', status: 'CONNECTED', scopes: ['spreadsheets'], secretRef: 'GOOGLE_SA_KEY', lastSyncAt: iso(1), lastError: null },
  { id: 'int_3', provider: 'ZALO_OA', name: 'Zalo OA FLOWBASE', status: 'EXPIRED', scopes: ['send_message'], secretRef: 'ZALO_OA_TOKEN', lastSyncAt: iso(20), lastError: 'Access token hết hạn, cần cấp lại' },
  { id: 'int_4', provider: 'GITHUB', name: 'Đồng bộ repo dự án', status: 'CONNECTED', scopes: ['repo:read'], secretRef: 'GITHUB_TOKEN', lastSyncAt: iso(2), lastError: null },
  { id: 'int_5', provider: 'RESEND', name: 'Gửi email giao dịch', status: 'DISCONNECTED', scopes: [], secretRef: null, lastSyncAt: null, lastError: null },
  { id: 'int_6', provider: 'VERCEL', name: 'Deploy hook', status: 'ERROR', scopes: ['deployments'], secretRef: 'VERCEL_TOKEN', lastSyncAt: iso(6), lastError: 'Build hook trả về 401' },
];

export const webhooks: WebhookEndpoint[] = [
  { id: 'whk_1', integrationId: 'int_1', url: 'https://hooks.slack.com/services/…', events: ['lead.created', 'lead.won'], active: true, lastDeliveryStatus: 'SUCCESS', createdAt: iso(60) },
  { id: 'whk_2', integrationId: null, url: 'https://n8n.flowbase.studio/webhook/invoice', events: ['invoice.paid', 'invoice.overdue'], active: true, lastDeliveryStatus: 'SUCCESS', createdAt: iso(30) },
  { id: 'whk_3', integrationId: 'int_6', url: 'https://api.vercel.com/v1/integrations/deploy/…', events: ['demo.published'], active: false, lastDeliveryStatus: 'FAILED', createdAt: iso(12) },
];

export const auditLogs: AuditLog[] = [
  { id: 'aud_1', userName: 'Nguyễn Hải Yến', action: 'UPDATE', entityType: 'Lead', entityId: 'led_1', summary: 'Đổi trạng thái QUALIFIED → PROPOSAL', ip: '113.161.x.x', createdAt: iso(0) },
  { id: 'aud_2', userName: 'Trần Quốc Việt', action: 'CREATE', entityType: 'Invoice', entityId: 'inv_5', summary: 'Tạo nháp INV-2026-005', ip: '113.161.x.x', createdAt: iso(0) },
  { id: 'aud_3', userName: 'Lê Anh Khoa', action: 'GRANT_ACCESS', entityType: 'Demo', entityId: 'dem_4', summary: 'Cấp quyền xem cho chi.nguyen@trungtamabc.vn', ip: '27.72.x.x', createdAt: iso(1) },
  { id: 'aud_4', userName: 'Hệ thống', action: 'UPDATE', entityType: 'Invoice', entityId: 'inv_4', summary: 'Tự động đánh dấu OVERDUE', ip: null, createdAt: iso(1) },
  { id: 'aud_5', userName: 'Trần Quốc Việt', action: 'LOGIN', entityType: 'User', entityId: 'usr_1', summary: 'Đăng nhập thành công', ip: '113.161.x.x', createdAt: iso(2) },
];
