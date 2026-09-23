import { Table2, Copy, Workflow, Database, Clock, type LucideIcon } from 'lucide-react';

export type Problem = { title: string; description: string; icon: LucideIcon };

export const problems: Problem[] = [
  {
    title: 'Too many spreadsheets',
    description: 'Dữ liệu nằm rải rác trong nhiều file, mỗi phòng ban giữ một bản khác nhau.',
    icon: Table2,
  },
  {
    title: 'Repeated data entry',
    description: 'Một thông tin phải nhập lại nhiều lần ở nhiều nơi khác nhau.',
    icon: Copy,
  },
  {
    title: 'Manual workflows',
    description: 'Quy trình phụ thuộc vào con người và vào vài nhân sự nắm việc.',
    icon: Workflow,
  },
  {
    title: 'No single source of truth',
    description: 'Không có một nơi tập trung để theo dõi dữ liệu và trạng thái xử lý.',
    icon: Database,
  },
  {
    title: 'Slow reporting',
    description: 'Tổng hợp báo cáo mất nhiều thời gian và thường trễ so với nhu cầu ra quyết định.',
    icon: Clock,
  },
];
