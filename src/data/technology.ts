export type TechGroup = { label: string; items: string[] };

export const techGroups: TechGroup[] = [
  { label: 'FRONTEND', items: ['Next.js', 'React', 'TypeScript'] },
  { label: 'UI', items: ['Tailwind CSS', 'shadcn/ui'] },
  { label: 'BACKEND', items: ['NestJS', 'Node.js'] },
  { label: 'DATABASE', items: ['PostgreSQL', 'Prisma'] },
  { label: 'INFRASTRUCTURE', items: ['Docker', 'Linux', 'Nginx'] },
  { label: 'DEVOPS', items: ['GitHub', 'CI/CD'] },
];

export const architecture = [
  { label: 'Client', meta: 'browser' },
  { label: 'Next.js', meta: 'app router', accent: true },
  { label: 'API', meta: 'REST' },
  { label: 'NestJS', meta: 'business logic', accent: true },
];

export const dataLayer = [
  { label: 'PostgreSQL', meta: 'data' },
  { label: 'Storage', meta: 'files' },
];
