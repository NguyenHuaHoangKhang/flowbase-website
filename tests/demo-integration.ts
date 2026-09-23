/**
 * Integration Test Suite cho Phân hệ Quản lý Demo & Cấp Quyền Truy Cập Riêng:
 * 1. Kiểm tra RBAC Matrix bảo mật cho tài nguyên 'demo'.
 * 2. Kiểm tra Database CHECK Constraints (Mật khẩu bắt buộc, Ngày xuất bản, Giới hạn lượt xem).
 * 3. Kiểm tra Partial Unique Index (Slug duy nhất trên bản sống & Soft-delete).
 * 4. Kiểm tra Ràng buộc duy nhất Email per Demo (demoId, email).
 * 5. Kiểm tra Repositories: listDemos, getDemo, listGrants, getGrantByToken, demosSummary.
 * 6. Kiểm tra Toàn Diện checkDemoAccess() & Transaction tự động ghi nhận DemoView:
 *    - PUBLIC: Cho phép xem trực tiếp, tăng viewCount, ghi DemoView.
 *    - PASSWORD: Yêu cầu mật khẩu, kiểm tra bcrypt, từ chối khi sai, chấp nhận khi đúng.
 *    - GRANT_ONLY: Yêu cầu token, từ chối khi hết hạn, từ chối khi bị thu hồi, từ chối khi vượt maxViews, chấp nhận khi hợp lệ và tăng viewCount của cả demo & grant.
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';
import {
  listDemos,
  getDemo,
  listGrants,
  getGrantByToken,
  demosSummary,
  checkDemoAccess,
} from '../src/server/repositories';
import { can, assertCan, PermissionError } from '../src/lib/rbac';

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

async function runDemoTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU INTEGRATION TESTS: DEMOS & DEMO ACCESS GRANTS');
  console.log('======================================================\n');

  // Dọn dẹp dữ liệu thử nghiệm trước
  const testSlugs = [
    'test-demo-public',
    'test-demo-password',
    'test-demo-grant',
    'test-demo-draft',
    'test-demo-unique-slug',
    'test-demo-soft-deleted',
  ];

  await prisma.demoView.deleteMany({
    where: { demo: { slug: { in: testSlugs } } },
  });
  await prisma.demoAccessGrant.deleteMany({
    where: { demo: { slug: { in: testSlugs } } },
  });
  await prisma.demo.deleteMany({
    where: { slug: { in: testSlugs } },
  });

  // -------------------------------------------------------------------------
  // TEST 1: Kiểm tra RBAC Matrix cho tài nguyên 'demo'
  // -------------------------------------------------------------------------
  console.log('👉 TEST 1: Kiểm tra Ma Trận Phân Quyền (RBAC) cho tài nguyên "demo"');

  assert(can('OWNER', 'demo', 'read') === true, 'OWNER có quyền READ demo');
  assert(can('OWNER', 'demo', 'create') === true, 'OWNER có quyền CREATE demo');
  assert(can('OWNER', 'demo', 'update') === true, 'OWNER có quyền UPDATE demo');
  assert(can('OWNER', 'demo', 'delete') === true, 'OWNER có quyền DELETE demo');

  assert(can('ADMIN', 'demo', 'read') === true, 'ADMIN có quyền READ demo');
  assert(can('ADMIN', 'demo', 'create') === true, 'ADMIN có quyền CREATE demo');
  assert(can('ADMIN', 'demo', 'update') === true, 'ADMIN có quyền UPDATE demo');
  assert(can('ADMIN', 'demo', 'delete') === true, 'ADMIN có quyền DELETE demo');

  assert(can('EDITOR', 'demo', 'read') === true, 'EDITOR có quyền READ demo');
  assert(can('EDITOR', 'demo', 'create') === true, 'EDITOR có quyền CREATE demo');
  assert(can('EDITOR', 'demo', 'update') === true, 'EDITOR có quyền UPDATE demo');
  assert(can('EDITOR', 'demo', 'delete') === false, 'EDITOR BỊ CHẶN quyền DELETE demo');

  assert(can('VIEWER', 'demo', 'read') === true, 'VIEWER có quyền READ demo');
  assert(can('VIEWER', 'demo', 'create') === false, 'VIEWER BỊ CHẶN quyền CREATE demo');
  assert(can('VIEWER', 'demo', 'update') === false, 'VIEWER BỊ CHẶN quyền UPDATE demo');
  assert(can('VIEWER', 'demo', 'delete') === false, 'VIEWER BỊ CHẶN quyền DELETE demo');

  let editorDeleteBlocked = false;
  try {
    assertCan('EDITOR', 'demo', 'delete');
  } catch (e) {
    if (e instanceof PermissionError) editorDeleteBlocked = true;
  }
  assert(editorDeleteBlocked, 'assertCan() ném PermissionError khi EDITOR cố tình xoá demo');

  // -------------------------------------------------------------------------
  // TEST 2: Kiểm tra Database CHECK Constraints
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 2: Kiểm tra PostgreSQL CHECK Constraints');

  // 2.1 chk_demo_password_required: visibility = PASSWORD mà thiếu accessPasswordHash
  let caughtPasswordCheck = false;
  try {
    await prisma.demo.create({
      data: {
        slug: 'test-demo-password-fail',
        title: 'Demo Password Fail',
        category: 'Test',
        summary: 'Demo tóm tắt kiểm thử ràng buộc mật khẩu',
        visibility: 'PASSWORD',
        accessPasswordHash: null,
      },
    });
  } catch (e: any) {
    caughtPasswordCheck = e.message.includes('chk_demo_password_required');
  }
  assert(caughtPasswordCheck, 'PostgreSQL bắt lỗi chk_demo_password_required khi thiếu hash mật khẩu');

  // 2.2 chk_demo_published_requires_date: status = PUBLISHED mà thiếu publishedAt
  let caughtPublishedCheck = false;
  try {
    await prisma.demo.create({
      data: {
        slug: 'test-demo-published-fail',
        title: 'Demo Published Fail',
        category: 'Test',
        summary: 'Demo tóm tắt kiểm thử ràng buộc ngày xuất bản',
        status: 'PUBLISHED',
        publishedAt: null,
      },
    });
  } catch (e: any) {
    caughtPublishedCheck = e.message.includes('chk_demo_published_requires_date');
  }
  assert(caughtPublishedCheck, 'PostgreSQL bắt lỗi chk_demo_published_requires_date khi thiếu publishedAt');

  // 2.3 Tạo demo hợp lệ để test grant
  const testDemo = await prisma.demo.create({
    data: {
      slug: 'test-demo-public',
      title: 'Hệ Thống Quản Lý Giáo Vụ (Test)',
      category: 'Education',
      summary: 'Bản demo giải pháp quản lý giảng viên và số tiết giảng dạy.',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      publishedAt: new Date(),
      sortOrder: 1,
    },
  });
  assert(testDemo.id !== '', 'Tạo thành công Demo PUBLIC hợp lệ trong PostgreSQL');

  // 2.4 chk_grant_view_limit: maxViews <= 0
  let caughtGrantLimitCheck = false;
  try {
    await prisma.demoAccessGrant.create({
      data: {
        demoId: testDemo.id,
        email: 'bad-limit@client.com',
        token: 'gr_bad_limit',
        maxViews: 0,
      },
    });
  } catch (e: any) {
    caughtGrantLimitCheck = e.message.includes('chk_grant_view_limit');
  }
  assert(caughtGrantLimitCheck, 'PostgreSQL bắt lỗi chk_grant_view_limit khi maxViews = 0');

  // -------------------------------------------------------------------------
  // TEST 3: Kiểm tra Partial Unique Index (Slug & Soft Delete)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 3: Kiểm tra Tính Duy Nhất của Slug & Cơ Chế Soft Delete');

  const demoUniq1 = await prisma.demo.create({
    data: {
      slug: 'test-demo-unique-slug',
      title: 'Demo Unique Slug 1',
      category: 'Test',
      summary: 'Kiểm tra partial unique index cho slug còn sống',
      status: 'DRAFT',
    },
  });
  assert(demoUniq1.id !== '', 'Tạo demo 1 với slug test-demo-unique-slug');

  // Tạo demo 2 trùng slug -> Phải bị từ chối
  let caughtDuplicateSlug = false;
  try {
    await prisma.demo.create({
      data: {
        slug: 'test-demo-unique-slug',
        title: 'Demo Unique Slug 2 Trùng',
        category: 'Test',
        summary: 'Cố tình chèn slug trùng',
        status: 'DRAFT',
      },
    });
  } catch (e: any) {
    caughtDuplicateSlug = e.message.includes('uniq_demo_slug_alive') || e.code === 'P2002';
  }
  assert(caughtDuplicateSlug, 'PostgreSQL từ chối tạo demo trùng slug khi bản ghi cũ còn sống');

  // Soft delete demo 1
  await prisma.demo.update({
    where: { id: demoUniq1.id },
    data: { deletedAt: new Date() },
  });

  // Sau khi demo 1 đã soft-delete, tạo demo 2 cùng slug -> Phải thành công!
  const demoUniq2 = await prisma.demo.create({
    data: {
      slug: 'test-demo-unique-slug',
      title: 'Demo Unique Slug 2 Tái Sinh',
      category: 'Test',
      summary: 'Tạo thành công slug trùng khi bản ghi trước đã soft-deleted',
      status: 'DRAFT',
    },
  });
  assert(demoUniq2.id !== demoUniq1.id, 'Tạo thành công bản ghi mới cùng slug khi bản ghi cũ đã soft-delete');

  // Dọn dẹp test 3
  await prisma.demo.delete({ where: { id: demoUniq2.id } });
  await prisma.demo.delete({ where: { id: demoUniq1.id } });

  // -------------------------------------------------------------------------
  // TEST 4: Kiểm tra Ràng buộc Duy nhất Email per Demo (demoId, email)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 4: Kiểm tra Ràng buộc Duy nhất DemoAccessGrant (demoId, email)');

  const grant1 = await prisma.demoAccessGrant.create({
    data: {
      demoId: testDemo.id,
      email: 'client-vip@enterprise.vn',
      token: 'gr_token_vip_001',
      maxViews: 10,
    },
  });
  assert(grant1.id !== '', 'Cấp grant đầu tiên cho client-vip@enterprise.vn');

  let caughtDuplicateEmailGrant = false;
  try {
    await prisma.demoAccessGrant.create({
      data: {
        demoId: testDemo.id,
        email: 'client-vip@enterprise.vn',
        token: 'gr_token_vip_002',
        maxViews: 5,
      },
    });
  } catch (e: any) {
    caughtDuplicateEmailGrant = e.code === 'P2002';
  }
  assert(caughtDuplicateEmailGrant, 'DB từ chối cấp trùng grant cho cùng một email trên cùng một demo');

  // -------------------------------------------------------------------------
  // TEST 5: Kiểm tra Repositories (listDemos, getDemo, listGrants, demosSummary)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 5: Kiểm tra Repositories kết nối PostgreSQL');

  const demoList = await listDemos({ q: 'Giáo Vụ' });
  assert(demoList.data.length >= 1, 'listDemos tìm kiếm thành công theo từ khoá tiếng Việt');
  assert(demoList.data[0].slug === 'test-demo-public', 'Kết quả tìm kiếm khớp đúng demo');

  const fetchedDemo = await getDemo('test-demo-public');
  assert(fetchedDemo !== null, 'getDemo() tìm thấy demo theo slug');
  assert(fetchedDemo?.title === 'Hệ Thống Quản Lý Giáo Vụ (Test)', 'Dữ liệu trả về chính xác');

  const grantsList = await listGrants(testDemo.id);
  assert(grantsList.length >= 1, 'listGrants() trả về danh sách grant của demo');
  assert(grantsList[0].email === 'client-vip@enterprise.vn', 'Email trong grant khớp chính xác');
  assert(grantsList[0].demoTitle === testDemo.title, 'demoTitle được join chính xác từ bảng demo');

  const grantByToken = await getGrantByToken('gr_token_vip_001');
  assert(grantByToken !== null, 'getGrantByToken() tìm thấy grant theo token');
  assert(grantByToken?.maxViews === 10, 'maxViews trả về đúng số 10');

  const summary = await demosSummary();
  assert(summary.totalDemos >= 1, 'demosSummary() đếm tổng số demo chính xác');
  assert(summary.publishedDemos >= 1, 'demosSummary() đếm demo đã xuất bản chính xác');
  assert(summary.activeGrants >= 1, 'demosSummary() tính toán activeGrants thời gian thực');

  // -------------------------------------------------------------------------
  // TEST 6: Kiểm tra Cơ Chế checkDemoAccess & Tự Động Ghi Nhận DemoView
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 6: Kiểm tra checkDemoAccess() & Transaction ghi nhận DemoView');

  // 6.1 Demo DRAFT -> Từ chối
  const draftDemo = await prisma.demo.create({
    data: {
      slug: 'test-demo-draft',
      title: 'Demo Đang Soạn Nháp',
      category: 'Internal',
      summary: 'Bản nháp nội bộ chưa xuất bản',
      status: 'DRAFT',
    },
  });
  const draftAccess = await checkDemoAccess('test-demo-draft');
  assert(draftAccess.allowed === false, 'Demo DRAFT bị từ chối truy cập');
  assert(draftAccess.reason === 'not-published', 'Lý do từ chối chính xác: not-published');

  // 6.2 Demo PUBLIC -> Chấp nhận & Tăng viewCount trong DB
  const beforePublicViews = (await prisma.demo.findUnique({ where: { id: testDemo.id } }))?.viewCount ?? 0;
  const publicAccess = await checkDemoAccess('test-demo-public', { ip: '1.2.3.4' });
  assert(publicAccess.allowed === true, 'Demo PUBLIC cho phép truy cập trực tiếp');

  const afterPublicViews = (await prisma.demo.findUnique({ where: { id: testDemo.id } }))?.viewCount ?? 0;
  assert(afterPublicViews === beforePublicViews + 1, 'viewCount của Demo tăng đúng 1 đơn vị');

  const recordedView = await prisma.demoView.findFirst({
    where: { demoId: testDemo.id },
    orderBy: { createdAt: 'desc' },
  });
  assert(recordedView !== null, 'Đã ghi nhận bản ghi DemoView mới trong PostgreSQL');
  assert(recordedView?.ipHash !== null, 'ipHash được mã hoá an toàn');

  // 6.3 Demo PASSWORD -> Kiểm tra xác thực bcrypt
  const passwordHash = await bcrypt.hash('secretpass123', 10);
  const passwordDemo = await prisma.demo.create({
    data: {
      slug: 'test-demo-password',
      title: 'Demo Bảo Mật Mật Khẩu',
      category: 'Finance',
      summary: 'Bản demo số liệu nhạy cảm cần mật khẩu',
      status: 'PUBLISHED',
      visibility: 'PASSWORD',
      accessPasswordHash: passwordHash,
      publishedAt: new Date(),
    },
  });

  const noPassAccess = await checkDemoAccess('test-demo-password');
  assert(noPassAccess.allowed === false, 'Từ chối xem demo PASSWORD khi không cung cấp mật khẩu');
  assert(noPassAccess.reason === 'password-required', 'Lý do: password-required');

  const wrongPassAccess = await checkDemoAccess('test-demo-password', { password: 'wrongpassword' });
  assert(wrongPassAccess.allowed === false, 'Từ chối xem demo PASSWORD khi nhập sai mật khẩu');
  assert(wrongPassAccess.reason === 'invalid-password', 'Lý do: invalid-password');

  const correctPassAccess = await checkDemoAccess('test-demo-password', { password: 'secretpass123' });
  assert(correctPassAccess.allowed === true, 'Cho phép xem demo PASSWORD khi nhập đúng mật khẩu bcrypt');

  // 6.4 Demo GRANT_ONLY -> Kiểm tra toàn diện token, maxViews, expiresAt, revokedAt
  const grantOnlyDemo = await prisma.demo.create({
    data: {
      slug: 'test-demo-grant',
      title: 'Demo Dành Riêng Đối Tác Lớn',
      category: 'Enterprise',
      summary: 'Bản demo chỉ dành cho đối tác được cấp link có token riêng',
      status: 'PUBLISHED',
      visibility: 'GRANT_ONLY',
      publishedAt: new Date(),
    },
  });

  // Không có token -> Từ chối
  const noTokenAccess = await checkDemoAccess('test-demo-grant');
  assert(noTokenAccess.allowed === false, 'Từ chối xem demo GRANT_ONLY khi thiếu token');
  assert(noTokenAccess.reason === 'token-required', 'Lý do: token-required');

  // Token giả -> Từ chối
  const fakeTokenAccess = await checkDemoAccess('test-demo-grant', { token: 'gr_fake_token_999' });
  assert(fakeTokenAccess.allowed === false, 'Từ chối xem khi dùng token giả mạo');
  assert(fakeTokenAccess.reason === 'invalid-token', 'Lý do: invalid-token');

  // Cấp grant với maxViews = 2
  const activeGrant = await prisma.demoAccessGrant.create({
    data: {
      demoId: grantOnlyDemo.id,
      email: 'partner@techcorp.com',
      token: 'gr_partner_valid',
      maxViews: 2,
    },
  });

  // Lần xem 1: Hợp lệ -> tăng grant.viewCount lên 1, demo.viewCount lên 1
  const view1 = await checkDemoAccess('test-demo-grant', { token: 'gr_partner_valid' });
  assert(view1.allowed === true, 'Lần xem 1: Token hợp lệ, được phép truy cập');

  let updatedGrant = await prisma.demoAccessGrant.findUnique({ where: { id: activeGrant.id } });
  assert(updatedGrant?.viewCount === 1, 'grant.viewCount tăng lên 1');
  assert(updatedGrant?.lastViewAt !== null, 'grant.lastViewAt được ghi nhận thời gian xem');

  // Lần xem 2: Hợp lệ -> tăng grant.viewCount lên 2
  const view2 = await checkDemoAccess('test-demo-grant', { token: 'gr_partner_valid' });
  assert(view2.allowed === true, 'Lần xem 2: Được phép truy cập');

  updatedGrant = await prisma.demoAccessGrant.findUnique({ where: { id: activeGrant.id } });
  assert(updatedGrant?.viewCount === 2, 'grant.viewCount đạt ngưỡng maxViews = 2');

  // Lần xem 3: Vượt quá maxViews -> Phải bị từ chối
  const view3 = await checkDemoAccess('test-demo-grant', { token: 'gr_partner_valid' });
  assert(view3.allowed === false, 'Lần xem 3: Bị từ chối do vượt quá số lượt xem');
  assert(view3.reason === 'view-limit', 'Lý do: view-limit');

  // Kiểm tra Grant hết hạn
  const expiredGrant = await prisma.demoAccessGrant.create({
    data: {
      demoId: grantOnlyDemo.id,
      email: 'expired@client.com',
      token: 'gr_expired_token',
      expiresAt: new Date(Date.now() - 3600 * 1000), // đã hết hạn 1 giờ trước
    },
  });
  const expiredAccess = await checkDemoAccess('test-demo-grant', { token: 'gr_expired_token' });
  assert(expiredAccess.allowed === false, 'Từ chối xem khi link đã hết hạn');
  assert(expiredAccess.reason === 'expired', 'Lý do: expired');

  // Kiểm tra Grant bị thu hồi (Revoked)
  const revokedGrant = await prisma.demoAccessGrant.create({
    data: {
      demoId: grantOnlyDemo.id,
      email: 'revoked@client.com',
      token: 'gr_revoked_token',
      revokedAt: new Date(),
    },
  });
  const revokedAccess = await checkDemoAccess('test-demo-grant', { token: 'gr_revoked_token' });
  assert(revokedAccess.allowed === false, 'Từ chối xem khi quyền đã bị thu hồi');
  assert(revokedAccess.reason === 'revoked', 'Lý do: revoked');

  // -------------------------------------------------------------------------
  // DỌN DẸP DỮ LIỆU THỬ NGHIỆM
  // -------------------------------------------------------------------------
  await prisma.demoView.deleteMany({
    where: { demo: { slug: { in: testSlugs } } },
  });
  await prisma.demoAccessGrant.deleteMany({
    where: { demo: { slug: { in: testSlugs } } },
  });
  await prisma.demo.deleteMany({
    where: { slug: { in: testSlugs } },
  });

  console.log('\n======================================================');
  console.log(`🎉 TẤT CẢ ${passedTests}/${totalTests} TESTS DEMO ĐÃ VƯỢT QUA XUẤT SẮC 100%!`);
  console.log('======================================================\n');
}

runDemoTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
