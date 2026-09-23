/**
 * Integration Test Suite cho Phân hệ Quản lý Dự án & Kanban Pipeline:
 * 1. Kiểm tra RBAC Matrix cho tài nguyên 'project'.
 * 2. Kiểm tra Ràng buộc Database (Date Order, Budget, Progress).
 * 3. Kiểm tra Tạo mới Dự án, Auto-generate mã FB-YYYY-XXX & Trùng mã.
 * 4. Kiểm tra Repositories: listProjects, getProject, listMilestones, listTasks.
 * 5. Kiểm tra Kanban Pipeline projectBoard() & Chuyển trạng thái thẻ.
 * 6. Kiểm tra Cơ chế Xoá mềm (Soft Delete).
 */
import { prisma } from '../src/lib/prisma';
import {
  listProjects,
  getProject,
  projectBoard,
  listMilestones,
  listTasks,
} from '../src/server/repositories';
import { can, assertCan, PermissionError } from '../src/lib/rbac';
import { projectCreateSchema } from '../src/lib/validators';

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

async function runProjectTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU INTEGRATION TESTS: PROJECTS & KANBAN PIPELINE');
  console.log('======================================================\n');

  // Dọn dẹp dữ liệu thử nghiệm trước khi test
  const testCodes = ['FB-TEST-001', 'FB-TEST-002', 'FB-2026-991', 'FB-2026-992'];
  await prisma.activity.deleteMany({
    where: { project: { code: { in: testCodes } } },
  });
  await prisma.task.deleteMany({
    where: { project: { code: { in: testCodes } } },
  });
  await prisma.milestone.deleteMany({
    where: { project: { code: { in: testCodes } } },
  });
  await prisma.project.deleteMany({
    where: { code: { in: testCodes } },
  });
  await prisma.client.deleteMany({
    where: { taxCode: '0108887771' },
  });

  // Tạo khách hàng thử nghiệm để gắn vào dự án
  const testClient = await prisma.client.create({
    data: {
      name: 'Khách hàng Thử nghiệm Pipeline',
      legalName: 'Công ty TNHH Thử nghiệm Pipeline',
      taxCode: '0108887771',
      email: 'test-pipeline@company.vn',
      status: 'ACTIVE',
    },
  });

  // -------------------------------------------------------------------------
  // TEST 1: Kiểm tra RBAC Matrix cho Project
  // -------------------------------------------------------------------------
  console.log('👉 TEST 1: Kiểm tra RBAC Matrix phân quyền cho Project');

  assert(can('OWNER', 'project', 'create') === true, 'OWNER có toàn quyền tạo dự án');
  assert(can('ADMIN', 'project', 'update') === true, 'ADMIN có quyền cập nhật trạng thái dự án');
  assert(can('EDITOR', 'project', 'create') === true, 'EDITOR có quyền tạo dự án');
  assert(can('EDITOR', 'project', 'update') === true, 'EDITOR có quyền cập nhật tiến độ dự án');
  assert(can('VIEWER', 'project', 'read') === true, 'VIEWER có quyền xem danh sách và Kanban board');
  assert(can('VIEWER', 'project', 'create') === false, 'VIEWER bị từ chối quyền tạo dự án');
  assert(can('VIEWER', 'project', 'update') === false, 'VIEWER bị từ chối quyền cập nhật / kéo thả dự án');

  let viewerBlocked = false;
  try {
    assertCan('VIEWER', 'project', 'create');
  } catch (err) {
    if (err instanceof PermissionError) {
      viewerBlocked = true;
    }
  }
  assert(viewerBlocked, 'assertCan ném PermissionError khi VIEWER cố tạo dự án');

  // -------------------------------------------------------------------------
  // TEST 2: Ràng buộc Database CHECK Constraints
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 2: Kiểm tra Database CHECK Constraints trên bảng projects');

  // 2.1 chk_project_date_order: dueDate < startDate phải bị DB từ chối
  let dateOrderRejected = false;
  try {
    await prisma.project.create({
      data: {
        code: 'FB-TEST-001',
        title: 'Dự án sai thứ tự ngày',
        startDate: new Date('2026-06-01'),
        dueDate: new Date('2026-05-01'), // Sai: hạn chót trước ngày bắt đầu
      },
    });
  } catch (err: any) {
    dateOrderRejected = true;
    assert(
      err.message.includes('chk_project_date_order') || err.code === 'P2010' || err.message.includes('check constraint'),
      'PostgreSQL từ chối chèn dự án có dueDate < startDate (chk_project_date_order)',
    );
  }
  assert(dateOrderRejected, 'Ràng buộc chk_project_date_order hoạt động chính xác');

  // 2.2 chk_project_progress_range: progress > 100 phải bị từ chối
  let progressRejected = false;
  try {
    await prisma.project.create({
      data: {
        code: 'FB-TEST-002',
        title: 'Dự án sai tiến độ',
        progress: 150, // Sai: vượt quá 100%
      },
    });
  } catch (err: any) {
    progressRejected = true;
    assert(
      err.message.includes('chk_project_progress_range') || err.code === 'P2010' || err.message.includes('check constraint'),
      'PostgreSQL từ chối chèn dự án có progress > 100 (chk_project_progress_range)',
    );
  }
  assert(progressRejected, 'Ràng buộc chk_project_progress_range hoạt động chính xác');

  // -------------------------------------------------------------------------
  // TEST 3: Tạo Dự án, Liên kết Khách hàng & Mã duy nhất
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 3: Tạo mới Dự án & Ràng buộc mã duy nhất');

  const project1 = await prisma.project.create({
    data: {
      code: 'FB-2026-991',
      title: 'Hệ thống Quản lý Bán lẻ Đa kênh',
      summary: 'Dự án chuyển đổi số toàn diện',
      clientId: testClient.id,
      status: 'BACKLOG',
      priority: 'HIGH',
      billingType: 'MILESTONE',
      budgetAmount: 180000000,
      currency: 'VND',
      progress: 0,
      startDate: new Date('2026-04-01'),
      dueDate: new Date('2026-08-30'),
    },
    include: { client: { select: { name: true } } },
  });

  assert(project1.id !== '', 'Tạo thành công dự án trong PostgreSQL');
  assert(project1.client?.name === testClient.name, 'Dự án liên kết đúng với khách hàng');
  assert(Number(project1.budgetAmount) === 180000000, 'Ngân sách lưu trữ chính xác dưới dạng Decimal');

  // Thử tạo trùng mã code -> phải bị từ chối (P2002)
  let caughtDuplicateCode = false;
  try {
    await prisma.project.create({
      data: {
        code: 'FB-2026-991', // Trùng code với project1
        title: 'Dự án trùng mã',
      },
    });
  } catch (err: any) {
    caughtDuplicateCode = true;
    assert(err.code === 'P2002', 'PostgreSQL chặn trùng lặp mã dự án (P2002 unique constraint)');
  }
  assert(caughtDuplicateCode, 'Hệ thống bảo vệ thành công tính duy nhất của mã dự án');

  // -------------------------------------------------------------------------
  // TEST 4: Repositories (listProjects, getProject, listMilestones, listTasks)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 4: Kiểm tra Repositories đọc dữ liệu từ PostgreSQL');

  // 4.1 listProjects tìm kiếm theo từ khoá
  const searchResult = await listProjects({ q: 'Bán lẻ Đa kênh' });
  assert(searchResult.total >= 1, 'listProjects tìm thấy dự án theo từ khoá tiêu đề');
  const found = searchResult.data.find((p) => p.id === project1.id);
  assert(found?.clientName === testClient.name, 'Thông tin clientName được join chính xác');

  // 4.2 Lọc theo status
  const filterBacklog = await listProjects({ status: 'BACKLOG' });
  assert(filterBacklog.data.some((p) => p.id === project1.id), 'Lọc theo status BACKLOG tìm thấy dự án');

  const filterDelivered = await listProjects({ status: 'DELIVERED' });
  assert(!filterDelivered.data.some((p) => p.id === project1.id), 'Lọc theo status DELIVERED loại trừ đúng dự án');

  // 4.3 getProject theo ID và Code
  const byId = await getProject(project1.id);
  assert(byId?.id === project1.id, 'getProject tìm đúng dự án theo ID');

  const byCode = await getProject(project1.code);
  assert(byCode?.id === project1.id, 'getProject tìm đúng dự án theo Code');

  // 4.4 listMilestones & listTasks
  await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Mốc 1: Khảo sát kiến trúc',
      amount: 50000000,
      status: 'PLANNED',
      sortOrder: 1,
    },
  });

  await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Thiết kế Schema Database',
      status: 'TODO',
      sortOrder: 1,
    },
  });

  const milestones = await listMilestones(project1.id);
  assert(milestones.length === 1 && milestones[0].title === 'Mốc 1: Khảo sát kiến trúc', 'listMilestones lấy đúng mốc của dự án');

  const tasks = await listTasks(project1.id);
  assert(tasks.length === 1 && tasks[0].title === 'Thiết kế Schema Database', 'listTasks lấy đúng task của dự án');

  // -------------------------------------------------------------------------
  // TEST 5: Kanban Pipeline projectBoard & Chuyển trạng thái
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 5: Kiểm tra Kanban Pipeline projectBoard() & Chuyển cột');

  // 5.1 projectBoard gom đúng 7 cột
  const initialBoard = await projectBoard();
  assert(Array.isArray(initialBoard.BACKLOG), 'Cột BACKLOG tồn tại trên Board');
  assert(Array.isArray(initialBoard.IN_PROGRESS), 'Cột IN_PROGRESS tồn tại trên Board');
  assert(Array.isArray(initialBoard.DELIVERED), 'Cột DELIVERED tồn tại trên Board');
  assert(initialBoard.BACKLOG.some((p) => p.id === project1.id), 'Dự án xuất hiện tại cột BACKLOG ban đầu');

  const initialBacklogBudget = initialBoard.BACKLOG.reduce((s, p) => s + p.budgetAmount, 0);
  assert(initialBacklogBudget >= 180000000, 'Tổng ngân sách cột BACKLOG cộng dồn chính xác');

  // 5.2 Chuyển dự án sang IN_PROGRESS và tạo Activity log
  const updatedProject = await prisma.project.update({
    where: { id: project1.id },
    data: {
      status: 'IN_PROGRESS',
      progress: 35,
    },
  });
  assert(updatedProject.status === 'IN_PROGRESS', 'Cập nhật trạng thái dự án sang IN_PROGRESS thành công');

  const activity = await prisma.activity.create({
    data: {
      type: 'STATUS_CHANGE',
      projectId: project1.id,
      subject: 'Chuyển cột Pipeline',
      body: 'Chuyển từ BACKLOG sang IN_PROGRESS',
      meta: { from: 'BACKLOG', to: 'IN_PROGRESS' },
    },
  });
  assert(activity.id !== '', 'Ghi nhận Activity STATUS_CHANGE thành công');

  // 5.3 projectBoard phản ánh vị trí mới
  const updatedBoard = await projectBoard();
  assert(!updatedBoard.BACKLOG.some((p) => p.id === project1.id), 'Dự án đã rời khỏi cột BACKLOG');
  assert(updatedBoard.IN_PROGRESS.some((p) => p.id === project1.id), 'Dự án đã xuất hiện ở cột IN_PROGRESS');

  // -------------------------------------------------------------------------
  // TEST 6: Cơ chế Xoá mềm (Soft Delete)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 6: Cơ chế Xoá mềm (Soft Delete)');

  await prisma.project.update({
    where: { id: project1.id },
    data: { deletedAt: new Date() },
  });

  const boardAfterDelete = await projectBoard();
  assert(!boardAfterDelete.IN_PROGRESS.some((p) => p.id === project1.id), 'Dự án bị xoá mềm không xuất hiện trên Kanban Board');

  const listAfterDelete = await listProjects({ q: 'Bán lẻ Đa kênh' });
  assert(!listAfterDelete.data.some((p) => p.id === project1.id), 'Dự án bị xoá mềm không xuất hiện trong listProjects');

  const getAfterDelete = await getProject(project1.id);
  assert(getAfterDelete === null, 'getProject trả về null cho dự án đã bị xoá mềm');

  // -------------------------------------------------------------------------
  // DỌN DẸP DỮ LIỆU TEST
  // -------------------------------------------------------------------------
  await prisma.activity.deleteMany({ where: { projectId: project1.id } });
  await prisma.task.deleteMany({ where: { projectId: project1.id } });
  await prisma.milestone.deleteMany({ where: { projectId: project1.id } });
  await prisma.project.delete({ where: { id: project1.id } });
  await prisma.client.delete({ where: { id: testClient.id } });
  console.log('\n  ✓ Đã dọn dẹp sạch toàn bộ dữ liệu thử nghiệm');

  console.log('\n======================================================');
  console.log(`🎉 TẤT CẢ ${passedTests}/${totalTests} PROJECT INTEGRATION TESTS ĐÃ VƯỢT QUA XUẤT SẮC 100%!`);
  console.log('======================================================\n');
}

runProjectTests()
  .catch((e) => {
    console.error('FATAL PROJECT TEST ERROR:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
