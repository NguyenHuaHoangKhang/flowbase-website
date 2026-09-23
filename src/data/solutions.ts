import {
  Building2, GitBranch, BarChart3, FileSpreadsheet, Wrench, Bot, type LucideIcon,
} from 'lucide-react';

export type Solution = { title: string; description: string; icon: LucideIcon };

export const solutions: Solution[] = [
  { title: 'Business Management', description: 'HR, đào tạo, vận hành và quản lý hồ sơ trong một hệ thống.', icon: Building2 },
  { title: 'Workflow & Approval', description: 'Submit → Review → Approve → Complete, có lịch sử và phân quyền.', icon: GitBranch },
  { title: 'Data & Dashboard', description: 'Dữ liệu tập trung, báo cáo và phân tích cập nhật theo thời gian thực.', icon: BarChart3 },
  { title: 'Excel Automation', description: 'Import → Validate → Process → Export, giữ lại file quen thuộc khi cần.', icon: FileSpreadsheet },
  { title: 'Internal Tools', description: 'Công cụ nội bộ xây riêng theo quy trình, không ép quy trình theo phần mềm.', icon: Wrench },
  { title: 'AI-assisted Software', description: 'AI-native development giúp rút ngắn vòng đời phát triển và thời gian phản hồi.', icon: Bot },
];
