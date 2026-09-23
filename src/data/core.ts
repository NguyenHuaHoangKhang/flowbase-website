export const coreModules = [
  'Authentication', 'RBAC', 'Users', 'Organizations', 'Departments',
  'Workflow', 'Approval', 'File Management', 'Excel Import', 'Excel Export',
  'Dashboard', 'Notifications', 'Audit Log', 'Search', 'Reporting',
];

export const infrastructure = ['PostgreSQL', 'Storage', 'API'];

export type DomainKey = 'hr' | 'edu' | 'lec' | 'pay';

export type Domain = {
  key: DomainKey;
  label: string;
  caption: string;
  application: string;
  modules: string[];
  uses: string[];
};

export const domains: Domain[] = [
  {
    key: 'hr', label: 'HR', caption: 'Nhân sự & hợp đồng',
    application: 'HR Management System',
    modules: ['Employee', 'Contract', 'Leave', 'Payroll Input', 'Onboarding'],
    uses: ['Users', 'Departments', 'Workflow', 'Approval', 'File Management', 'Audit Log'],
  },
  {
    key: 'edu', label: 'Education', caption: 'Học viên & lớp học',
    application: 'Training Center System',
    modules: ['Student', 'Course', 'Class', 'Tuition', 'Attendance'],
    uses: ['Users', 'Organizations', 'Excel Import', 'Dashboard', 'Notifications', 'Reporting'],
  },
  {
    key: 'lec', label: 'Lecturer', caption: 'Giảng viên & số tiết',
    application: 'Lecturer Management System',
    modules: ['Lecturer', 'Teaching Assignment', 'Teaching Hours', 'Contract', 'Documents'],
    uses: ['Users', 'Workflow', 'Approval', 'File Management', 'Excel Export', 'Reporting'],
  },
  {
    key: 'pay', label: 'Payment', caption: 'Thanh toán & đối soát',
    application: 'Payment & Settlement System',
    modules: ['Payment Batch', 'Rate Table', 'Settlement', 'Invoice', 'Adjustment'],
    uses: ['RBAC', 'Workflow', 'Approval', 'Excel Export', 'Audit Log', 'Dashboard'],
  },
];
