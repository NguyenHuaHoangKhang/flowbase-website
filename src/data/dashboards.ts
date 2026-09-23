/**
 * Dữ liệu demo cho các mock dashboard.
 * Đây là dữ liệu mẫu do FLOWBASE tự tạo để minh họa giao diện,
 * không phải dữ liệu của khách hàng.
 */

export type BadgeTone = 'ok' | 'wait' | 'new' | 'off';

export type Cell = string | { badge: string; tone: BadgeTone };

export type MockScreen = {
  windowTitle: string;
  nav: string[];
  activeNav: number;
  title: string;
  meta: string;
  kpis: { value: string; label: string }[];
  columns: string[];
  rows: Cell[][];
  chart?: boolean;
};

export type MockKey =
  | 'lecturer' | 'training' | 'hr' | 'workflow'
  | 'profile' | 'assignment' | 'payment';

export const mockScreens: Record<MockKey, MockScreen> = {
  lecturer: {
    windowTitle: 'flowbase / lecturers',
    nav: ['Dashboard', 'Lecturers', 'Contracts', 'Payments', 'Reports'],
    activeNav: 1,
    title: 'Lecturer Management',
    meta: '2026 · Q1',
    kpis: [
      { value: '1,284', label: 'Lecturers' },
      { value: '126', label: 'Contracts' },
      { value: '38', label: 'Pending' },
      { value: '12', label: 'Approved' },
    ],
    columns: ['Name', 'Department', 'Hours', 'Status'],
    rows: [
      ['Nguyễn T. Minh', 'Medicine', '124', { badge: 'Active', tone: 'ok' }],
      ['Trần V. Hoà', 'Nursing', '86', { badge: 'Pending', tone: 'wait' }],
      ['Lê T. Hương', 'Pharmacy', '112', { badge: 'Active', tone: 'ok' }],
      ['Phạm Q. Dũng', 'Medicine', '64', { badge: 'Review', tone: 'new' }],
    ],
    chart: true,
  },
  training: {
    windowTitle: 'flowbase / training',
    nav: ['Dashboard', 'Students', 'Classes', 'Tuition', 'Attendance'],
    activeNav: 2,
    title: 'Student Management',
    meta: 'Spring intake',
    kpis: [
      { value: '642', label: 'Students' },
      { value: '24', label: 'Classes' },
      { value: '18', label: 'Unpaid' },
      { value: '96%', label: 'Attendance' },
    ],
    columns: ['Student', 'Class', 'Tuition', 'Status'],
    rows: [
      ['Đỗ Minh Anh', 'IE-204', '8.400.000', { badge: 'Paid', tone: 'ok' }],
      ['Vũ Hải Nam', 'IE-204', '8.400.000', { badge: 'Due', tone: 'wait' }],
      ['Bùi Thu Trang', 'DS-101', '11.200.000', { badge: 'Paid', tone: 'ok' }],
      ['Hoàng Gia Bảo', 'DS-101', '11.200.000', { badge: 'Draft', tone: 'off' }],
    ],
  },
  hr: {
    windowTitle: 'flowbase / hr',
    nav: ['Dashboard', 'People', 'Contracts', 'Documents', 'Requests'],
    activeNav: 1,
    title: 'People Directory',
    meta: 'All departments',
    kpis: [
      { value: '318', label: 'Employees' },
      { value: '27', label: 'Contracts due' },
      { value: '9', label: 'Requests' },
      { value: '4', label: 'Onboarding' },
    ],
    columns: ['Employee', 'Department', 'Contract', 'Status'],
    rows: [
      ['Ngô Thanh Sơn', 'Operations', 'HĐ-2026-118', { badge: 'Signed', tone: 'ok' }],
      ['Lý Kim Ngân', 'Finance', 'HĐ-2026-121', { badge: 'Expiring', tone: 'wait' }],
      ['Trịnh Bảo Long', 'Engineering', 'HĐ-2026-127', { badge: 'Signed', tone: 'ok' }],
      ['Đặng Mai Chi', 'Marketing', '—', { badge: 'Onboarding', tone: 'new' }],
    ],
  },
  workflow: {
    windowTitle: 'flowbase / workflow',
    nav: ['Dashboard', 'Requests', 'Approvals', 'Rules', 'Audit'],
    activeNav: 2,
    title: 'Approval Queue',
    meta: 'Assigned to me',
    kpis: [
      { value: '47', label: 'Open' },
      { value: '12', label: 'Waiting me' },
      { value: '3', label: 'Overdue' },
      { value: '2.4d', label: 'Avg cycle' },
    ],
    columns: ['Request', 'Type', 'Step', 'Status'],
    rows: [
      ['REQ-2841', 'Contract', 'Head of Dept', { badge: 'Waiting', tone: 'wait' }],
      ['REQ-2839', 'Payment', 'Finance', { badge: 'In review', tone: 'new' }],
      ['REQ-2830', 'Leave', 'Manager', { badge: 'Approved', tone: 'ok' }],
      ['REQ-2825', 'Document', 'Archive', { badge: 'Closed', tone: 'off' }],
    ],
    chart: true,
  },
  profile: {
    windowTitle: 'flowbase / lecturer-detail',
    nav: ['Dashboard', 'Lecturers', 'Contracts', 'Payments', 'Reports'],
    activeNav: 1,
    title: 'Nguyễn T. Minh · LEC-0142',
    meta: 'Medicine',
    kpis: [
      { value: '124', label: 'Hours' },
      { value: '3', label: 'Contracts' },
      { value: '8', label: 'Documents' },
      { value: 'Active', label: 'Status' },
    ],
    columns: ['Item', 'Reference', 'Updated', 'Status'],
    rows: [
      ['Profile', 'LEC-0142', '12/01', { badge: 'Complete', tone: 'ok' }],
      ['Contract', 'HĐ-2026-044', '10/01', { badge: 'Signed', tone: 'ok' }],
      ['Degree scan', 'DOC-9981', '08/01', { badge: 'Verified', tone: 'ok' }],
      ['Tax profile', 'TAX-0142', '—', { badge: 'Missing', tone: 'wait' }],
    ],
  },
  assignment: {
    windowTitle: 'flowbase / assignments',
    nav: ['Dashboard', 'Lecturers', 'Classes', 'Payments', 'Reports'],
    activeNav: 2,
    title: 'Teaching Assignment',
    meta: 'Semester 2026.1',
    kpis: [
      { value: '42', label: 'Classes' },
      { value: '18', label: 'Lecturers' },
      { value: '1,860', label: 'Hours' },
      { value: '6', label: 'Unassigned' },
    ],
    columns: ['Class', 'Subject', 'Lecturer', 'Hours'],
    rows: [
      ['MED-201', 'Anatomy', 'Nguyễn T. Minh', '45'],
      ['NUR-110', 'Fundamentals', 'Trần V. Hoà', '30'],
      ['PHA-305', 'Pharmacology', 'Lê T. Hương', '38'],
      ['MED-204', 'Physiology', { badge: 'Unassigned', tone: 'wait' }, '—'],
    ],
    chart: true,
  },
  payment: {
    windowTitle: 'flowbase / payments',
    nav: ['Dashboard', 'Lecturers', 'Contracts', 'Payments', 'Reports'],
    activeNav: 3,
    title: 'Payment Batch · PAY-2026-03',
    meta: 'Awaiting approval',
    kpis: [
      { value: '18', label: 'Lecturers' },
      { value: '1,860', label: 'Hours' },
      { value: '412.5M', label: 'Amount' },
      { value: '2', label: 'Adjustments' },
    ],
    columns: ['Lecturer', 'Hours', 'Amount', 'Status'],
    rows: [
      ['Nguyễn T. Minh', '124', '27.900.000', { badge: 'Approved', tone: 'ok' }],
      ['Trần V. Hoà', '86', '19.350.000', { badge: 'Review', tone: 'wait' }],
      ['Lê T. Hương', '112', '25.200.000', { badge: 'Approved', tone: 'ok' }],
      ['Phạm Q. Dũng', '64', '14.400.000', { badge: 'Adjusted', tone: 'new' }],
    ],
  },
};
