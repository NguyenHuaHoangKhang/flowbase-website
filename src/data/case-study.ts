import type { MockKey } from './dashboards';

export const caseFlow = [
  { index: '01', title: 'Problem', description: 'Thông tin giảng viên nằm rải rác ở nhiều bảng tính và tài liệu riêng biệt.' },
  { index: '02', title: 'Existing workflow', description: 'Excel, hợp đồng giấy, bảng số tiết và file thanh toán tách rời nhau.' },
  { index: '03', title: 'FLOWBASE solution', description: 'Một hồ sơ giảng viên duy nhất, mọi dữ liệu gắn vào hồ sơ đó.' },
  { index: '04', title: 'System', description: 'Dashboard, hồ sơ, phân công giảng dạy và thanh toán trong cùng hệ thống.' },
  { index: '05', title: 'Result', description: 'Mục tiêu thiết kế: nhập một lần, duyệt theo luồng, báo cáo tự động.' },
];

export const existingSources = [
  'Excel giảng viên', 'Hợp đồng', 'Bảng số tiết', 'Excel thanh toán', 'Hồ sơ scan',
];

export const solutionTree = [
  'Profile', 'Contract', 'Teaching Assignment', 'Teaching Hours', 'Payment', 'Documents',
];

export type Shot = { screen: MockKey; title: string; caption: string };

export const shots: Shot[] = [
  { screen: 'lecturer', title: 'Dashboard', caption: 'Tổng quan số giảng viên, hợp đồng và hồ sơ đang chờ duyệt.' },
  { screen: 'profile', title: 'Lecturer profile', caption: 'Một hồ sơ duy nhất chứa thông tin, hợp đồng và tài liệu đính kèm.' },
  { screen: 'assignment', title: 'Teaching assignment', caption: 'Phân công theo lớp và học kỳ, tự động cộng dồn số tiết.' },
  { screen: 'payment', title: 'Payment', caption: 'Tính thanh toán từ số tiết đã duyệt, xuất bảng đối soát ra Excel.' },
];
