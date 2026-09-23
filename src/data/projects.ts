import type { MockKey } from './dashboards';

export type Project = {
  id: string;
  title: string;
  category: string;
  label: 'CONCEPT' | 'DEMO';
  description: string;
  tags: string[];
  screen: MockKey;
};

/**
 * Các project dưới đây là demo / concept do FLOWBASE tự xây dựng.
 * Không trình bày như dự án khách hàng đã triển khai.
 */
export const projects: Project[] = [
  {
    id: '01',
    title: 'Lecturer Management',
    category: 'Education / Operations',
    label: 'CONCEPT',
    description: 'Quản lý hồ sơ, hợp đồng, phân công, số tiết và thanh toán giảng viên trong một hệ thống.',
    tags: ['Education', 'Management', 'Workflow', 'Payment'],
    screen: 'lecturer',
  },
  {
    id: '02',
    title: 'Training Center',
    category: 'Education / CRM',
    label: 'CONCEPT',
    description: 'Quản lý học viên, lớp học, khóa học, học phí và điểm danh.',
    tags: ['Education', 'CRM', 'Management'],
    screen: 'training',
  },
  {
    id: '03',
    title: 'HR Management',
    category: 'Human Resources',
    label: 'DEMO',
    description: 'Quản lý nhân sự, hợp đồng, hồ sơ và quy trình nội bộ.',
    tags: ['HR', 'Documents', 'Workflow'],
    screen: 'hr',
  },
  {
    id: '04',
    title: 'Workflow Management',
    category: 'Operations',
    label: 'DEMO',
    description: 'Quản lý quy trình xử lý và phê duyệt với lịch sử đầy đủ.',
    tags: ['Workflow', 'Approval', 'Operations'],
    screen: 'workflow',
  },
];
