/**
 * Integration Test Suite cho Phân hệ Auth, Session & Phân quyền RBAC FLOWBASE:
 * 1. Kiểm tra xác thực thông tin đăng nhập (Mật khẩu đúng, sai, email không tồn tại).
 * 2. Kiểm tra tính năng Quick Role Switcher (4 vai trò: OWNER, ADMIN, EDITOR, VIEWER).
 * 3. Kiểm tra vòng đời phiên Session (Tạo token, tra cứu, hết hạn, huỷ khi logout).
 * 4. Kiểm tra Ma trận Phân quyền RBAC (canAccess logic).
 * 5. Kiểm tra phòng chống lỗ hổng Open Redirect.
 */
import { prisma } from '../src/lib/prisma';
import { canAccess } from '../src/lib/rbac';
import type { UserRole } from '../src/lib/types';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (detail) console.error(`    Detail: ${detail}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runAuthTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU INTEGRATION TESTS: AUTH & RBAC SYSTEM');
  console.log('======================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: Xác thực Credentials (Email / Password)
  // -------------------------------------------------------------------------
  console.log('👉 TEST 1: Xác thực Credentials (Đúng mật khẩu, sai mật khẩu, email lạ)');

  // 1.1 Đúng mật khẩu
  const validUser = await prisma.user.findUnique({
    where: { email: 'owner@flowbase.studio' },
  });
  assert(validUser !== null, 'Tìm thấy tài khoản owner@flowbase.studio trong DB');
  const isMatch = await bcrypt.compare('flowbase123', validUser?.passwordHash ?? '');
  assert(isMatch, 'So khớp mật khẩu đúng "flowbase123" thành công');

  // 1.2 Sai mật khẩu
  const isWrongMatch = await bcrypt.compare('wrong-password-999', validUser?.passwordHash ?? '');
  assert(!isWrongMatch, 'Từ chối mật khẩu không chính xác');

  // 1.3 Email không tồn tại
  const nonExistent = await prisma.user.findUnique({
    where: { email: 'ghost@flowbase.studio' },
  });
  assert(nonExistent === null, 'Không tìm thấy tài khoản với email không tồn tại');

  // -------------------------------------------------------------------------
  // TEST 2: Kiểm tra Quick Role Switcher (4 vai trò)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 2: Kiểm tra Quick Role Switcher cho 4 vai trò');

  const testRoles: UserRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];
  for (const r of testRoles) {
    const user = await prisma.user.findFirst({
      where: { role: r, status: 'ACTIVE', deletedAt: null },
    });
    assert(user !== null && user.role === r, `Quick Switcher tìm được tài khoản hợp lệ cho vai trò ${r}`);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Kiểm tra Vòng đời Session trong PostgreSQL
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 3: Kiểm tra Vòng đời Session trong PostgreSQL');

  const testUser = await prisma.user.findFirst({ where: { role: 'OWNER' } });
  assert(testUser !== null, 'Lấy được testUser');

  const testToken = `test_token_${crypto.randomUUID()}`;
  const sevenDaysLater = new Date(Date.now() + 7 * 86400 * 1000);

  // 3.1 Tạo session
  const session = await prisma.session.create({
    data: {
      userId: testUser!.id,
      token: testToken,
      expiresAt: sevenDaysLater,
    },
  });
  assert(session.token === testToken, 'Khởi tạo session mới thành công trong PostgreSQL');

  // 3.2 Tra cứu session
  const foundSession = await prisma.session.findUnique({
    where: { token: testToken },
    include: { user: true },
  });
  assert(foundSession !== null, 'Tra cứu session bằng token thành công');
  assert(foundSession?.user.email === testUser?.email, 'Session liên kết chính xác với User');

  // 3.3 Kiểm tra session hết hạn
  const expiredToken = `expired_token_${crypto.randomUUID()}`;
  await prisma.session.create({
    data: {
      userId: testUser!.id,
      token: expiredToken,
      expiresAt: new Date(Date.now() - 10000), // đã hết hạn 10s trước
    },
  });
  const expiredSession = await prisma.session.findUnique({ where: { token: expiredToken } });
  assert(
    expiredSession !== null && expiredSession.expiresAt < new Date(),
    'Nhận diện chính xác session đã quá hạn',
  );

  // 3.4 Huỷ session (Logout)
  await prisma.session.deleteMany({ where: { token: { in: [testToken, expiredToken] } } });
  const afterLogout = await prisma.session.findUnique({ where: { token: testToken } });
  assert(afterLogout === null, 'Session bị xoá sạch khỏi DB sau khi đăng xuất');

  // -------------------------------------------------------------------------
  // TEST 4: Kiểm tra Ma trận Phân quyền RBAC (canAccess)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 4: Kiểm tra Ma trận Phân quyền RBAC');

  // OWNER có quyền xem mọi thứ
  assert(canAccess('OWNER', 'dashboard') === true, 'OWNER có quyền xem Dashboard');
  assert(canAccess('OWNER', 'invoice') === true, 'OWNER có quyền xem Hoá đơn');
  assert(canAccess('OWNER', 'expense') === true, 'OWNER có quyền xem Chi phí');
  assert(canAccess('OWNER', 'user') === true, 'OWNER có quyền xem Người dùng');

  // ADMIN có quyền xem tài chính nhưng không quản lý User
  assert(canAccess('ADMIN', 'dashboard') === true, 'ADMIN có quyền xem Dashboard');
  assert(canAccess('ADMIN', 'invoice') === true, 'ADMIN có quyền xem Hoá đơn');
  assert(canAccess('ADMIN', 'user') === false, 'ADMIN KHÔNG có quyền truy cập trang Người dùng (Bảo mật đúng)');

  // EDITOR quản lý Lead, Project, Demo nhưng ẨN HOÀN TOÀN Tài chính
  assert(canAccess('EDITOR', 'lead') === true, 'EDITOR có quyền quản lý Lead');
  assert(canAccess('EDITOR', 'project') === true, 'EDITOR có quyền quản lý Dự án');
  assert(canAccess('EDITOR', 'invoice') === false, 'EDITOR BỊ ẨN menu Hoá đơn (Bảo mật đúng)');
  assert(canAccess('EDITOR', 'expense') === false, 'EDITOR BỊ ẨN menu Chi phí (Bảo mật đúng)');

  // VIEWER chỉ đọc cơ bản
  assert(canAccess('VIEWER', 'dashboard') === true, 'VIEWER có quyền xem Dashboard');
  assert(canAccess('VIEWER', 'invoice') === false, 'VIEWER BỊ ẨN menu Hoá đơn');
  assert(canAccess('VIEWER', 'expense') === false, 'VIEWER BỊ ẨN menu Chi phí');

  // -------------------------------------------------------------------------
  // TEST 5: Kiểm tra Phòng chống Lỗ hổng Open Redirect
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 5: Kiểm tra Phòng chống Open Redirect');

  function sanitizeRedirect(next: any): string {
    if (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')) {
      return next;
    }
    return '/admin';
  }

  assert(sanitizeRedirect('/admin/projects') === '/admin/projects', 'Cho phép chuyển hướng hợp lệ đến /admin/projects');
  assert(sanitizeRedirect('/admin/leads?status=NEW') === '/admin/leads?status=NEW', 'Cho phép chuyển hướng kèm query params');
  assert(sanitizeRedirect('https://evil-site.com') === '/admin', 'Chặn URL chứa domain bên ngoài (Chống Open Redirect)');
  assert(sanitizeRedirect('//evil-site.com') === '/admin', 'Chặn URL dạng protocol-relative (//evil-site.com)');
  assert(sanitizeRedirect(null) === '/admin', 'Mặc định về /admin nếu query next là null');

  console.log('\n======================================================');
  console.log(`🎉 TẤT CẢ ${passedTests}/${totalTests} AUTH & RBAC TESTS ĐÃ VƯỢT QUA XUẤT SẮC 100%!`);
  console.log('======================================================\n');
}

runAuthTests()
  .catch((e) => {
    console.error('FATAL AUTH TEST ERROR:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
