/**
 * Domain types — phản chiếu prisma/schema.prisma.
 *
 * Viết tay thay vì import từ @prisma/client để project chạy được
 * ngay cả khi chưa có database. Sau khi chạy `npx prisma generate`,
 * có thể đổi sang `import type { Lead } from '@prisma/client'`
 * — tên field giữ nguyên nên không phải sửa component.
 */

export type UserRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';

export type DemoLabel = 'CONCEPT' | 'DEMO' | 'PROTOTYPE' | 'CASE_STUDY';
export type DemoStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type DemoVisibility = 'PUBLIC' | 'UNLISTED' | 'PASSWORD' | 'GRANT_ONLY';

export type LeadStatus =
  | 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST' | 'SPAM';
export type LeadSource =
  | 'WEBSITE_FORM' | 'REFERRAL' | 'ZALO' | 'EMAIL' | 'LINKEDIN' | 'EVENT' | 'OTHER';

export type ClientStatus = 'PROSPECT' | 'ACTIVE' | 'INACTIVE';

export type ProjectStatus =
  | 'BACKLOG' | 'DISCOVERY' | 'PROPOSAL' | 'SIGNED' | 'IN_PROGRESS'
  | 'UAT' | 'DELIVERED' | 'MAINTENANCE' | 'ON_HOLD' | 'CANCELLED';
export type ProjectPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type BillingType = 'FIXED' | 'HOURLY' | 'MILESTONE' | 'RETAINER';
export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'INVOICED' | 'PAID';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';

export type Currency = 'VND' | 'USD';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID';
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CARD' | 'E_WALLET' | 'OTHER';
export type ExpenseCategory =
  | 'INFRASTRUCTURE' | 'SOFTWARE' | 'CONTRACTOR' | 'SALARY'
  | 'MARKETING' | 'EQUIPMENT' | 'TAX' | 'OTHER';
export type ContractStatus = 'DRAFT' | 'SENT' | 'SIGNED' | 'EXPIRED' | 'TERMINATED';

export type IntegrationProvider =
  | 'SLACK' | 'ZALO_OA' | 'GOOGLE_SHEETS' | 'GOOGLE_DRIVE' | 'GITHUB'
  | 'VERCEL' | 'RESEND' | 'SENDGRID' | 'STRIPE' | 'GENERIC_WEBHOOK';
export type IntegrationStatus = 'DISCONNECTED' | 'CONNECTED' | 'ERROR' | 'EXPIRED';
export type DeliveryStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING';

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
  | 'EXPORT' | 'GRANT_ACCESS' | 'REVOKE_ACCESS';

// --- Entities -------------------------------------------------------------

export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
};

export type Demo = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  label: DemoLabel;
  status: DemoStatus;
  visibility: DemoVisibility;
  coverUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  sortOrder: number;
  viewCount: number;
  publishedAt: string | null;
  updatedAt: string;
};

export type DemoAccessGrant = {
  id: string;
  demoId: string;
  demoTitle: string;
  leadId: string | null;
  email: string;
  token: string;
  maxViews: number | null;
  viewCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
  lastViewAt: string | null;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: LeadStatus;
  source: LeadSource;
  score: number;
  ownerId: string | null;
  ownerName: string | null;
  utmSource: string | null;
  lostReason: string | null;
  contactedAt: string | null;
  convertedAt: string | null;
  createdAt: string;
};

export type Client = {
  id: string;
  name: string;
  taxCode: string | null;
  status: ClientStatus;
  email: string | null;
  phone: string | null;
  projectCount: number;
  totalBilled: number;
  outstanding: number;
  createdAt: string;
};

export type Project = {
  id: string;
  code: string;
  title: string;
  summary: string | null;
  clientId: string | null;
  clientName: string | null;
  ownerId: string | null;
  ownerName: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  billingType: BillingType;
  budgetAmount: number;
  currency: Currency;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  invoicedAmount: number;
  paidAmount: number;
};

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  status: MilestoneStatus;
  dueDate: string | null;
  sortOrder: number;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  detail: string | null;
  status: TaskStatus;
  assigneeName: string | null;
  estimateHours: number | null;
  dueDate: string | null;
  subtasks: any | null;
  attachments: any | null;
};

export type Invoice = {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  projectId: string | null;
  projectCode: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type Payment = {
  id: string;
  invoiceId: string;
  invoiceCode: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  paidAt: string;
  reference: string | null;
};

export type Expense = {
  id: string;
  projectId: string | null;
  projectCode: string | null;
  category: ExpenseCategory;
  vendor: string;
  description: string | null;
  amount: number;
  currency: Currency;
  spentAt: string;
  billable: boolean;
  recurrence: string | null;
};

export type Integration = {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  scopes: string[];
  secretRef: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
};

export type WebhookEndpoint = {
  id: string;
  integrationId: string | null;
  url: string;
  events: string[];
  active: boolean;
  lastDeliveryStatus: DeliveryStatus | null;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  userName: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  ip: string | null;
  createdAt: string;
};

// --- Shared API shapes ----------------------------------------------------

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ApiError = {
  error: string;
  fields?: Record<string, string[]>;
};
