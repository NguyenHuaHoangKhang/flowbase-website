/**
 * Seed dữ liệu khởi tạo.
 *
 *   npm run db:seed
 *
 * Seed này tạo dữ liệu nền tối thiểu:
 * - 4 tài khoản người dùng tương ứng 4 vai trò RBAC (mật khẩu mặc định: flowbase123)
 * - Site settings
 * - Danh mục tag
 * - Integrations mẫu (trạng thái DISCONNECTED)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultPasswordHash = await bcrypt.hash('flowbase123', 10);

  const users = [
    {
      email: 'owner@flowbase.studio',
      name: 'Trần Quốc Việt',
      role: 'OWNER' as const,
      status: 'ACTIVE' as const,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'admin@flowbase.studio',
      name: 'Nguyễn Minh Huy',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'editor@flowbase.studio',
      name: 'Lê Hoàng Nam',
      role: 'EDITOR' as const,
      status: 'ACTIVE' as const,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'viewer@flowbase.studio',
      name: 'Phạm Thu Hà',
      role: 'VIEWER' as const,
      status: 'ACTIVE' as const,
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        status: u.status,
        passwordHash: u.passwordHash,
      },
      create: u,
    });
  }
  console.log(`✓ Đã seed 4 tài khoản test (OWNER, ADMIN, EDITOR, VIEWER) - Mật khẩu: flowbase123`);

  const tags = ['education', 'hr', 'workflow', 'crm', 'payment', 'operations'];
  await Promise.all(
    tags.map((slug) =>
      prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { slug, label: slug.toUpperCase() },
      }),
    ),
  );
  console.log(`✓ Đã seed ${tags.length} danh mục thẻ tags`);

  await prisma.siteSetting.upsert({
    where: { key: 'site' },
    update: {},
    create: {
      key: 'site',
      value: {
        title: 'FLOWBASE — From Spreadsheet to Software',
        contactEmail: 'hello@flowbase.studio',
        zalo: 'FLOWBASE Studio',
        responseTime: '1–2 ngày làm việc',
      },
    },
  });
  console.log(`✓ Đã seed cấu hình site_settings`);

  // Khai báo sẵn các kết nối, chưa bật — chỉ ghi tên biến môi trường.
  const integrations = [
    { provider: 'SLACK' as const, name: 'Thông báo lead mới', secretRef: 'SLACK_BOT_TOKEN' },
    { provider: 'GOOGLE_SHEETS' as const, name: 'Sao lưu lead', secretRef: 'GOOGLE_SA_KEY' },
    { provider: 'RESEND' as const, name: 'Email giao dịch', secretRef: 'RESEND_API_KEY' },
  ];

  for (const i of integrations) {
    await prisma.integration.upsert({
      where: { provider_name: { provider: i.provider, name: i.name } },
      update: {},
      create: { ...i, status: 'DISCONNECTED' },
    });
  }
  console.log(`✓ Đã seed ${integrations.length} tích hợp mẫu`);

  console.log(`\n🎉 Seed hoàn tất thành công!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
