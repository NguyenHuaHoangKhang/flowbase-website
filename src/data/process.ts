export type Step = { index: string; title: string; description: string };

export const steps: Step[] = [
  { index: '01', title: 'Discover', description: 'Hiểu doanh nghiệp đang vận hành như thế nào, ai làm gì và dữ liệu đi qua đâu.' },
  { index: '02', title: 'Map', description: 'Chuyển quy trình thực tế thành workflow và data model có thể triển khai.' },
  { index: '03', title: 'Prototype', description: 'Xây phiên bản trực quan để duyệt trước khi phát triển toàn bộ hệ thống.' },
  { index: '04', title: 'Build', description: 'AI-assisted development kết hợp engineering review ở từng pull request.' },
  { index: '05', title: 'Test', description: 'Kiểm tra business logic, phân quyền, dữ liệu và toàn bộ luồng duyệt.' },
  { index: '06', title: 'Deploy', description: 'Đưa hệ thống vào production, bàn giao tài liệu và hướng dẫn vận hành.' },
];

export const aiTags = [
  'AI-assisted Coding',
  'AI-assisted Testing',
  'Rapid Prototyping',
  'Reusable Components',
  'AI-assisted Documentation',
];

export type PipelineNode = { label: string; meta: string; accent?: boolean; ok?: boolean };

export const aiPipelineTop: PipelineNode[] = [
  { label: 'Business Requirement', meta: 'input' },
  { label: 'Specification', meta: 'scope · data · rules' },
  { label: 'AI Coding Agent', meta: 'generate', accent: true },
];

export const aiOutputs = ['UI', 'API', 'Database', 'Validation', 'Tests'];

export const aiPipelineBottom: PipelineNode[] = [
  { label: 'Human Review', meta: 'engineering' },
  { label: 'Production', meta: 'deployed', ok: true },
];
