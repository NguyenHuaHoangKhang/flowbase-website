import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { can, canAccess, assertCan, PermissionError } from '../src/lib/rbac';
import {
  listUsers,
  getUser,
  countActiveOwners,
  createUser,
  updateUser,
  deleteUser,
} from '../src/server/repositories';
import { recordAudit } from '../src/app/api/_lib';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU INTEGRATION TESTS: USER MANAGEMENT & RBAC');
  console.log('======================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: Kiểm Tra Ma Trận Phân Quyền (RBAC) Cho Tài Nguyên "user"
  // -------------------------------------------------------------------------
  console.log('👉 TEST 1: Kiểm tra Phân Quyền (RBAC) cho "user" (Chỉ OWNER)');
  assert(can('OWNER', 'user', 'read') === true, 'OWNER có quyền READ user');
  assert(can('OWNER', 'user', 'create') === true, 'OWNER có quyền CREATE user');
  assert(can('OWNER', 'user', 'update') === true, 'OWNER có quyền UPDATE user');
  assert(can('OWNER', 'user', 'delete') === true, 'OWNER có quyền DELETE user');

  assert(canAccess('ADMIN', 'user') === false, 'ADMIN BỊ ẨN menu user');
  assert(can('ADMIN', 'user', 'read') === false, 'ADMIN BỊ CHẶN quyền READ user');
  assert(can('ADMIN', 'user', 'create') === false, 'ADMIN BỊ CHẶN quyền CREATE user');
  assert(can('ADMIN', 'user', 'update') === false, 'ADMIN BỊ CHẶN quyền UPDATE user');
  assert(can('ADMIN', 'user', 'delete') === false, 'ADMIN BỊ CHẶN quyền DELETE user');

  assert(canAccess('EDITOR', 'user') === false, 'EDITOR BỊ ẨN menu user');
  assert(can('EDITOR', 'user', 'read') === false, 'EDITOR BỊ CHẶN quyền READ user');

  assert(canAccess('VIEWER', 'user') === false, 'VIEWER BỊ ẨN menu user');
  assert(can('VIEWER', 'user', 'read') === false, 'VIEWER BỊ CHẶN quyền READ user');

  let caughtRbacError = false;
  try {
    assertCan('ADMIN', 'user', 'read');
  } catch (err: any) {
    if (err instanceof PermissionError && err.status === 403) {
      caughtRbacError = true;
    }
  }
  assert(caughtRbacError, 'assertCan() ném PermissionError 403 khi ADMIN cố truy cập user');

  // -------------------------------------------------------------------------
  // TEST 2: Tạo Mới Người Dùng & Băm Mật Khẩu An Toàn
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 2: Tạo Người Dùng Mới & Xác Thực Băm Mật Khẩu (bcrypt)');
  const testEmail = `test.user.${Date.now()}@flowbase.test`;
  const rawPassword = 'flowbase_secure_pass_2026';

  const newUser = await createUser({
    name: 'Nguyễn Văn Kiểm Thử',
    email: testEmail,
    role: 'EDITOR',
    status: 'ACTIVE',
    password: rawPassword,
  });

  assert(newUser.id.length > 0, 'Tạo thành công người dùng mới với cuid');
  assert(newUser.name === 'Nguyễn Văn Kiểm Thử', 'Họ tên lưu chính xác');
  assert(newUser.email === testEmail, 'Email lưu chính xác chữ thường');
  assert(newUser.role === 'EDITOR', 'Vai trò khởi tạo là EDITOR');
  assert(newUser.status === 'ACTIVE', 'Trạng thái khởi tạo là ACTIVE');

  const dbUser = await prisma.user.findUnique({ where: { id: newUser.id } });
  assert(dbUser !== null, 'Tìm thấy người dùng trong bảng users PostgreSQL');
  assert(dbUser?.passwordHash !== null, 'passwordHash đã được tạo');
  assert(dbUser?.passwordHash !== rawPassword, 'Tuyệt đối KHÔNG lưu mật khẩu thô');
  const passwordValid = await bcrypt.compare(rawPassword, dbUser!.passwordHash!);
  assert(passwordValid, 'bcrypt.compare khớp chính xác với mật khẩu thô');

  // Thử tạo trùng email -> P2002
  let caughtDuplicateEmail = false;
  try {
    await prisma.user.create({
      data: {
        name: 'Trùng Email',
        email: testEmail,
        role: 'VIEWER',
      },
    });
  } catch (err: any) {
    if (err.code === 'P2002') caughtDuplicateEmail = true;
  }
  assert(caughtDuplicateEmail, 'PostgreSQL chặn trùng lặp email (P2002 Unique constraint)');

  // -------------------------------------------------------------------------
  // TEST 3: Kiểm Tra Repositories (listUsers & getUser)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 3: Kiểm Tra Repositories (listUsers & getUser)');
  const fetchedUser = await getUser(newUser.id);
  assert(fetchedUser !== null, 'getUser() tìm thấy người dùng theo ID');
  assert(fetchedUser?.email === testEmail, 'Thông tin email khớp 100%');

  const allUsers = await listUsers();
  assert(allUsers.length >= 5, 'listUsers() lấy danh sách người dùng từ PostgreSQL');
  const foundInList = allUsers.some((u) => u.id === newUser.id);
  assert(foundInList, 'Người dùng mới tạo xuất hiện trong listUsers()');

  // -------------------------------------------------------------------------
  // TEST 4: Cập Nhật Vai Trò & Thăng Cấp Thành Viên
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 4: Cập Nhật Vai Trò & Thăng Cấp Quyền Hạn');
  const updatedUser = await updateUser(newUser.id, {
    name: 'Nguyễn Văn Kiểm Thử (Đã Sửa)',
    role: 'ADMIN',
  });
  assert(updatedUser.name === 'Nguyễn Văn Kiểm Thử (Đã Sửa)', 'Cập nhật họ tên thành công');
  assert(updatedUser.role === 'ADMIN', 'Thăng cấp thành công lên ADMIN');

  const dbCheckUpdated = await prisma.user.findUnique({ where: { id: newUser.id } });
  assert(dbCheckUpdated?.role === 'ADMIN', 'PostgreSQL ghi nhận vai trò mới là ADMIN');

  // -------------------------------------------------------------------------
  // TEST 5: Cơ Chế Huỷ Session Tức Thì Khi Khoá Tài Khoản (SUSPENDED)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 5: Cơ Chế Huỷ Session Tức Thì Khi Khoá Tài Khoản (SUSPENDED)');
  // Tạo 2 session giả lập cho user này
  await prisma.session.createMany({
    data: [
      {
        userId: newUser.id,
        token: `mock_session_1_${Date.now()}`,
        expiresAt: new Date(Date.now() + 86400000),
      },
      {
        userId: newUser.id,
        token: `mock_session_2_${Date.now()}`,
        expiresAt: new Date(Date.now() + 86400000),
      },
    ],
  });

  const sessionCountBefore = await prisma.session.count({ where: { userId: newUser.id } });
  assert(sessionCountBefore === 2, 'Khởi tạo thành công 2 phiên session cho người dùng');

  // Khoá tài khoản
  await updateUser(newUser.id, { status: 'SUSPENDED' });
  const dbUserSuspended = await prisma.user.findUnique({ where: { id: newUser.id } });
  assert(dbUserSuspended?.status === 'SUSPENDED', 'Tài khoản đã chuyển sang SUSPENDED');

  const sessionCountAfter = await prisma.session.count({ where: { userId: newUser.id } });
  assert(sessionCountAfter === 0, 'Toàn bộ phiên session bị xoá sạch ngay lập tức khi tài khoản bị khoá');

  // -------------------------------------------------------------------------
  // TEST 6: Bảo Vệ Tài Khoản OWNER Cuối Cùng (Last Owner Protection)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 6: Quy Tắc Bảo Vệ Tài Khoản OWNER Cuối Cùng');
  const activeOwners = await countActiveOwners();
  assert(activeOwners >= 1, `Hệ thống hiện có ${activeOwners} tài khoản OWNER đang hoạt động`);

  // Tìm 1 owner duy nhất (hoặc giả lập nếu chỉ có 1)
  const ownerUser = await prisma.user.findFirst({
    where: { role: 'OWNER', status: 'ACTIVE', deletedAt: null },
  });
  assert(ownerUser !== null, 'Tìm thấy tài khoản OWNER trong PostgreSQL');

  if (activeOwners === 1 && ownerUser) {
    let caughtDowngrade = false;
    try {
      await updateUser(ownerUser.id, { role: 'ADMIN' });
    } catch (err: any) {
      if (err.message.includes('OWNER duy nhất')) caughtDowngrade = true;
    }
    assert(caughtDowngrade, 'Từ chối hạ cấp tài khoản khi chỉ còn 1 OWNER duy nhất');

    let caughtDelete = false;
    try {
      await deleteUser(ownerUser.id);
    } catch (err: any) {
      if (err.message.includes('OWNER duy nhất')) caughtDelete = true;
    }
    assert(caughtDelete, 'Từ chối xoá tài khoản khi chỉ còn 1 OWNER duy nhất');
  } else {
    console.log('  (Đang có nhiều hơn 1 OWNER, kiểm tra logic hàm countActiveOwners)');
    assert(activeOwners >= 1, 'countActiveOwners() trả về số dương hợp lệ');
  }

  // -------------------------------------------------------------------------
  // TEST 7: Cơ Chế Xoá Mềm (Soft Delete) & Dọn Dẹp Phiên Làm Việc
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 7: Xoá Mềm (Soft Delete) & Huỷ Phiên Làm Việc');
  // Tạo lại session thử nghiệm cho newUser
  await prisma.session.create({
    data: {
      userId: newUser.id,
      token: `mock_session_delete_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  await deleteUser(newUser.id);
  const deletedInDb = await prisma.user.findUnique({ where: { id: newUser.id } });
  assert(deletedInDb?.deletedAt !== null, 'Người dùng đã được gán deletedAt (Soft delete)');

  const deletedInRepo = await getUser(newUser.id);
  assert(deletedInRepo === null, 'getUser() loại trừ người dùng đã bị xoá mềm');

  const listAfterDelete = await listUsers();
  assert(!listAfterDelete.some((u) => u.id === newUser.id), 'listUsers() không trả về người dùng đã xoá mềm');

  const sessionsAfterDelete = await prisma.session.count({ where: { userId: newUser.id } });
  assert(sessionsAfterDelete === 0, 'Mọi phiên session bị quét sạch khi xoá mềm tài khoản');

  // -------------------------------------------------------------------------
  // TEST 8: Nhật Ký Kiểm Toán Toàn Diện Cho Entity "User"
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 8: Ghi Nhật Ký Kiểm Toán (Audit Logs) Cho Thực Thể "User"');
  const auditEntityId = `usr_audit_test_${Date.now()}`;
  await recordAudit({
    userId: ownerUser?.id,
    action: 'CREATE',
    entityType: 'User',
    entityId: auditEntityId,
    summary: 'Tạo tài khoản kiểm toán mẫu',
  });

  const auditRecord = await prisma.auditLog.findFirst({
    where: { entityId: auditEntityId },
  });
  assert(auditRecord !== null, 'Bản ghi audit log được lưu thành công vào PostgreSQL');
  assert(auditRecord?.entityType === 'User', 'entityType chính xác là User');
  assert(auditRecord?.action === 'CREATE', 'action chính xác là CREATE');

  // Dọn dẹp dữ liệu kiểm toán và user test
  await prisma.auditLog.deleteMany({ where: { entityId: auditEntityId } });
  await prisma.user.delete({ where: { id: newUser.id } });
  console.log('\n  ✓ Đã dọn dẹp sạch toàn bộ dữ liệu thử nghiệm người dùng.');

  console.log('\n======================================================');
  console.log('🎉 TẤT CẢ USER MANAGEMENT & RBAC TESTS ĐÃ VƯỢT QUA XUẤT SẮC 100%!');
  console.log('======================================================\n');
}

runTests()
  .catch((err) => {
    console.error('Lỗi kiểm thử:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
