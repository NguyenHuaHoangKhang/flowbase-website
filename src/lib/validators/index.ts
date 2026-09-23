import { z } from 'zod';

/**
 * Validator dùng chung cho API route và form admin.
 * Các ràng buộc ở đây PHẢI khớp với prisma/sql/constraints.sql —
 * database là lớp phòng thủ cuối, zod là lớp báo lỗi thân thiện.
 */

const cuid = z.string().min(1);
const email = z.string().email('Email không hợp lệ');
const money = z.number().nonnegative('Số tiền không được âm');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Ngày không hợp lệ');

export const currencyEnum = z.enum(['VND', 'USD']);

// --- Lead -----------------------------------------------------------------

export const leadStatusEnum = z.enum([
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST', 'SPAM',
]);

export const leadCreateSchema = z.object({
  name: z.string().min(2, 'Tên quá ngắn').max(120),
  email,
  phone: z.string().max(32).optional().nullable(),
  company: z.string().max(160).optional().nullable(),
  message: z.string().min(10, 'Mô tả quy trình cần ít nhất 10 ký tự').max(5000),
  source: z.enum(['WEBSITE_FORM', 'REFERRAL', 'ZALO', 'EMAIL', 'LINKEDIN', 'EVENT', 'OTHER'])
    .default('WEBSITE_FORM'),
  utmSource: z.string().max(120).optional().nullable(),
  utmMedium: z.string().max(120).optional().nullable(),
  utmCampaign: z.string().max(120).optional().nullable(),
});

export const leadUpdateSchema = z
  .object({
    status: leadStatusEnum,
    score: z.number().int().min(0).max(100),
    ownerId: cuid.nullable(),
    clientId: cuid.nullable(),
    lostReason: z.string().max(500).nullable(),
  })
  .partial()
  // khớp chk_lead_outcome_fields
  .refine((v) => v.status !== 'LOST' || !!v.lostReason, {
    message: 'Lead LOST phải có lý do',
    path: ['lostReason'],
  });

// --- Demo -----------------------------------------------------------------

export const demoSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu -'),
    title: z.string().min(2, 'Tiêu đề quá ngắn').max(160),
    category: z.string().min(2, 'Danh mục quá ngắn').max(80),
    summary: z.string().min(10, 'Tóm tắt cần ít nhất 10 ký tự').max(400),
    description: z.string().max(20000).optional().nullable(),
    label: z.enum(['CONCEPT', 'DEMO', 'PROTOTYPE', 'CASE_STUDY']).default('CONCEPT'),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    visibility: z.enum(['PUBLIC', 'UNLISTED', 'PASSWORD', 'GRANT_ONLY']).default('PUBLIC'),
    accessPassword: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự').optional().nullable(),
    liveUrl: z.string().url('URL demo trực tiếp không hợp lệ').optional().nullable().or(z.literal('')),
    repoUrl: z.string().url('URL repository không hợp lệ').optional().nullable().or(z.literal('')),
    techStack: z.array(z.string().max(40)).max(20).default([]),
    sortOrder: z.number().int().min(0).default(0),
  })
  // khớp chk_demo_password_required
  .refine((v) => v.visibility !== 'PASSWORD' || !!v.accessPassword, {
    message: 'Demo dùng mật khẩu thì phải đặt mật khẩu',
    path: ['accessPassword'],
  });

export const demoUpdateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu -').optional(),
  title: z.string().min(2).max(160).optional(),
  category: z.string().min(2).max(80).optional(),
  summary: z.string().min(10).max(400).optional(),
  description: z.string().max(20000).optional().nullable(),
  label: z.enum(['CONCEPT', 'DEMO', 'PROTOTYPE', 'CASE_STUDY']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PASSWORD', 'GRANT_ONLY']).optional(),
  accessPassword: z.string().min(6).optional().nullable(),
  liveUrl: z.string().url().optional().nullable().or(z.literal('')),
  repoUrl: z.string().url().optional().nullable().or(z.literal('')),
  techStack: z.array(z.string().max(40)).max(20).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const demoGrantSchema = z.object({
  demoId: cuid,
  email,
  leadId: cuid.optional().nullable(),
  note: z.string().max(300).optional().nullable(),
  maxViews: z.number().int().positive('Số lượt xem tối đa phải lớn hơn 0').optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export type DemoGrantInput = z.infer<typeof demoGrantSchema>;
export type DemoUpdateInput = z.infer<typeof demoUpdateSchema>;

// --- Project --------------------------------------------------------------

const projectBaseSchema = z.object({
  code: z.string().min(1, 'Mã dự án không được để trống').max(50, 'Mã dự án quá dài'),
  title: z.string().min(2).max(200),
  summary: z.string().max(1000).optional().nullable(),
  clientId: cuid.optional().nullable(),
  leadId: cuid.optional().nullable(),
  ownerId: cuid.optional().nullable(),
  status: z.enum([
    'BACKLOG', 'DISCOVERY', 'PROPOSAL', 'SIGNED', 'IN_PROGRESS',
    'UAT', 'DELIVERED', 'MAINTENANCE', 'ON_HOLD', 'CANCELLED',
  ]).default('BACKLOG'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  billingType: z.enum(['FIXED', 'HOURLY', 'MILESTONE', 'RETAINER']).default('FIXED'),
  budgetAmount: money.default(0),
  currency: currencyEnum.default('VND'),
  hourlyRate: money.optional().nullable(),
  progress: z.number().int().min(0).max(100).default(0),
  startDate: isoDate.optional().nullable(),
  dueDate: isoDate.optional().nullable(),
});

export const projectSchema = projectBaseSchema
  // khớp chk_project_date_order
  .refine((v) => !v.startDate || !v.dueDate || v.dueDate >= v.startDate, {
    message: 'Hạn chót phải sau ngày bắt đầu',
    path: ['dueDate'],
  })
  .refine((v) => v.billingType !== 'HOURLY' || !!v.hourlyRate, {
    message: 'Dự án tính theo giờ phải có đơn giá giờ',
    path: ['hourlyRate'],
  });

export const projectCreateSchema = projectBaseSchema
  .extend({
    code: z.string().max(50, 'Mã dự án quá dài').optional().or(z.literal('')),
  })
  .refine((v) => !v.startDate || !v.dueDate || v.dueDate >= v.startDate, {
    message: 'Hạn chót phải sau ngày bắt đầu',
    path: ['dueDate'],
  })
  .refine((v) => v.billingType !== 'HOURLY' || !!v.hourlyRate, {
    message: 'Dự án tính theo giờ phải có đơn giá giờ',
    path: ['hourlyRate'],
  });

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = z.object({
  status: z.enum([
    'BACKLOG', 'DISCOVERY', 'PROPOSAL', 'SIGNED', 'IN_PROGRESS',
    'UAT', 'DELIVERED', 'MAINTENANCE', 'ON_HOLD', 'CANCELLED',
  ]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  title: z.string().min(2).max(200).optional(),
  summary: z.string().max(1000).optional().nullable(),
  clientId: cuid.optional().nullable(),
  ownerId: cuid.optional().nullable(),
  dueDate: isoDate.optional().nullable(),
  startDate: isoDate.optional().nullable(),
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

// --- Milestone & Task -----------------------------------------------------

export const milestoneCreateSchema = z.object({
  title: z.string().min(2, 'Tên mốc tối thiểu 2 ký tự').max(200),
  detail: z.string().max(1000).optional().nullable(),
  amount: money.default(0),
  dueDate: isoDate.optional().nullable(),
});

export type MilestoneCreateInput = z.infer<typeof milestoneCreateSchema>;

export const taskCreateSchema = z.object({
  title: z.string().min(2, 'Tên công việc tối thiểu 2 ký tự').max(200),
  assigneeId: cuid.optional().nullable(),
  estimateHours: z.number().nonnegative().optional().nullable(),
  dueDate: isoDate.optional().nullable(),
  detail: z.string().max(3000).optional().nullable(),
  subtasks: z.any().optional(),
  attachments: z.any().optional(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = taskCreateSchema.extend({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']).optional(),
});

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

// --- Invoice --------------------------------------------------------------

export const invoiceItemSchema = z.object({
  description: z.string().min(1).max(300),
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  unitPrice: money,
  milestoneId: cuid.optional().nullable(),
});

const invoiceBaseSchema = z.object({
  code: z.string().regex(/^INV-\d{4}-\d{3}$/, 'Mã hoá đơn dạng INV-2026-001'),
  clientId: cuid,
  projectId: cuid.optional().nullable(),
  issueDate: isoDate,
  dueDate: isoDate,
  currency: currencyEnum.default('VND'),
  exchangeRate: z.number().positive().default(1),
  discount: money.default(0),
  taxRate: z.number().min(0).max(100).default(0),
  note: z.string().max(2000).optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'Hoá đơn cần ít nhất một dòng'),
});

export const invoiceSchema = invoiceBaseSchema
  // khớp chk_invoice_dates
  .refine((v) => v.dueDate >= v.issueDate, {
    message: 'Hạn thanh toán phải sau ngày phát hành',
    path: ['dueDate'],
  })
  // khớp chk_invoice_exchange_rate
  .refine((v) => v.currency !== 'VND' || v.exchangeRate === 1, {
    message: 'Hoá đơn VND phải có tỷ giá bằng 1',
    path: ['exchangeRate'],
  })
  // khớp chk_invoice_amounts (discount <= subtotal)
  .refine(
    (v) => v.discount <= v.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
    { message: 'Chiết khấu không được vượt tổng tiền hàng', path: ['discount'] },
  );

export const invoiceCreateSchema = invoiceBaseSchema
  .extend({
    code: z.string().regex(/^INV-\d{4}-\d{3}$/, 'Mã hoá đơn dạng INV-2026-001').optional().or(z.literal('')),
  })
  .refine((v) => v.dueDate >= v.issueDate, {
    message: 'Hạn thanh toán phải sau ngày phát hành',
    path: ['dueDate'],
  })
  .refine((v) => v.currency !== 'VND' || v.exchangeRate === 1, {
    message: 'Hoá đơn VND phải có tỷ giá bằng 1',
    path: ['exchangeRate'],
  })
  .refine(
    (v) => v.discount <= v.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
    { message: 'Chiết khấu không được vượt tổng tiền hàng', path: ['discount'] },
  );

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;

/** Tính lại tổng từ items — dùng chung giữa API và form để không lệch số. */
export function computeInvoiceTotals(input: {
  items: { quantity: number; unitPrice: number }[];
  discount: number;
  taxRate: number;
}) {
  const round = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round(input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0));
  const taxable = round(subtotal - input.discount);
  const taxAmount = round((taxable * input.taxRate) / 100);
  return { subtotal, taxAmount, total: round(taxable + taxAmount) };
}

export const paymentSchema = z.object({
  invoiceId: cuid,
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  currency: currencyEnum.default('VND'),
  method: z.enum(['BANK_TRANSFER', 'CASH', 'CARD', 'E_WALLET', 'OTHER']).default('BANK_TRANSFER'),
  paidAt: isoDate,
  reference: z.string().max(120).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export const paymentRecordSchema = z.object({
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  currency: currencyEnum.default('VND'),
  method: z.enum(['BANK_TRANSFER', 'CASH', 'CARD', 'E_WALLET', 'OTHER']).default('BANK_TRANSFER'),
  paidAt: isoDate,
  reference: z.string().max(120).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export type PaymentRecordInput = z.infer<typeof paymentRecordSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseSchema>;

// --- Expense --------------------------------------------------------------

export const expenseSchema = z.object({
  projectId: cuid.optional().nullable(),
  category: z.enum([
    'INFRASTRUCTURE', 'SOFTWARE', 'CONTRACTOR', 'SALARY',
    'MARKETING', 'EQUIPMENT', 'TAX', 'OTHER',
  ]).default('OTHER'),
  vendor: z.string().min(1).max(160),
  description: z.string().max(500).optional().nullable(),
  amount: z.number().positive('Chi phí phải lớn hơn 0'),
  currency: currencyEnum.default('VND'),
  spentAt: isoDate,
  billable: z.boolean().default(false),
  recurrence: z.enum(['monthly', 'yearly']).optional().nullable(),
});

// --- Integration ----------------------------------------------------------

export const integrationSchema = z.object({
  provider: z.enum([
    'SLACK', 'ZALO_OA', 'GOOGLE_SHEETS', 'GOOGLE_DRIVE', 'GITHUB',
    'VERCEL', 'RESEND', 'SENDGRID', 'STRIPE', 'GENERIC_WEBHOOK',
  ]),
  name: z.string().min(2).max(80),
  config: z.record(z.string(), z.unknown()).optional(),
  /**
   * Chỉ nhận TÊN biến môi trường hoặc vault key, không nhận token thật.
   * Ví dụ hợp lệ: SLACK_BOT_TOKEN, vault://flowbase/slack
   */
  secretRef: z.string().regex(/^[A-Z0-9_]+$|^vault:\/\/[\w/-]+$/, 'Chỉ nhận tên biến môi trường hoặc vault key')
    .optional().nullable(),
  scopes: z.array(z.string().max(60)).max(30).default([]),
});

export const webhookEndpointSchema = z.object({
  integrationId: cuid.optional().nullable(),
  url: z.string().url('URL không hợp lệ'),
  description: z.string().max(200).optional().nullable(),
  events: z.array(z.string()).min(1, 'Chọn ít nhất một sự kiện'),
  active: z.boolean().default(true),
});

/** Danh sách event phát ra từ hệ thống — dùng cho UI chọn và cho worker. */
export const WEBHOOK_EVENTS = [
  'lead.created', 'lead.status_changed', 'lead.won', 'lead.lost',
  'demo.published', 'demo.viewed', 'demo.access_granted',
  'project.created', 'project.status_changed', 'project.delivered',
  'invoice.sent', 'invoice.paid', 'invoice.overdue',
  'expense.created',
] as const;

// --- User -----------------------------------------------------------------

export const userRoleEnum = z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']);
export const userStatusEnum = z.enum(['ACTIVE', 'INVITED', 'SUSPENDED']);

export const userInviteSchema = z.object({
  email,
  name: z.string().min(2, 'Tên người dùng tối thiểu 2 ký tự').max(120),
  role: userRoleEnum.default('VIEWER'),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, 'Tên người dùng tối thiểu 2 ký tự').max(120),
  email,
  role: userRoleEnum.default('VIEWER'),
  status: userStatusEnum.default('ACTIVE'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100).optional().nullable().or(z.literal('')),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Tên người dùng tối thiểu 2 ký tự').max(120).optional(),
  role: userRoleEnum.optional(),
  status: userStatusEnum.optional(),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100).optional().nullable().or(z.literal('')),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// --- Client ---------------------------------------------------------------

export const clientStatusEnum = z.enum(['PROSPECT', 'ACTIVE', 'INACTIVE']);

export const clientCreateSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng tối thiểu 2 ký tự').max(160),
  legalName: z.string().max(200).optional().nullable(),
  taxCode: z.string().max(32).optional().nullable(),
  email: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
  phone: z.string().max(32).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  website: z.string().url('Website không hợp lệ').optional().nullable().or(z.literal('')),
  status: clientStatusEnum.default('PROSPECT'),
  note: z.string().max(2000).optional().nullable(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type DemoInput = z.infer<typeof demoSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
