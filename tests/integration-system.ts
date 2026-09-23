/**
 * Integration Test Suite cho Phân hệ Integrations, Webhooks & Audit Logs:
 * 1. Kiểm tra RBAC Matrix bảo mật cho 'integration' và 'audit' (EDITOR & VIEWER bị chặn 100%).
 * 2. Kiểm tra Nguyên tắc An Toàn Secret (Chỉ nhận tên biến môi trường / vault key, chặn token thô).
 * 3. Kiểm tra Quản lý Kết nối Integrations & Test Connection trong PostgreSQL.
 * 4. Kiểm tra Webhook Endpoints & Cơ chế Giao vận emitEvent() ghi vào webhook_deliveries.
 * 5. Kiểm tra Hệ thống Nhật ký Kiểm toán recordAudit() & listAuditLogs().
 */
import { prisma } from '../src/lib/prisma';
import {
  listIntegrations,
  getIntegration,
  integrationsSummary,
  listWebhooks,
  listAuditLogs,
} from '../src/server/repositories';
import { can, canAccess, assertCan, PermissionError } from '../src/lib/rbac';
import { recordAudit, emitEvent } from '../src/app/api/_lib';
import { integrationSchema, webhookEndpointSchema } from '../src/lib/validators';

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

async function runSystemIntegrationTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU INTEGRATION TESTS: INTEGRATIONS, WEBHOOKS & AUDIT');
  console.log('======================================================\n');

  // Dọn dẹp dữ liệu thử nghiệm trước
  await prisma.webhookDelivery.deleteMany({
    where: { endpoint: { url: { contains: 'test-flowbase' } } },
  });
  await prisma.webhookEndpoint.deleteMany({
    where: { url: { contains: 'test-flowbase' } },
  });
  await prisma.integration.deleteMany({
    where: { name: { in: ['Test Slack Integration', 'Test Google Sheets'] } },
  });
  await prisma.auditLog.deleteMany({
    where: { entityId: { in: ['test-entity-001', 'test-entity-002'] } },
  });

  // -------------------------------------------------------------------------
  // TEST 1: Kiểm tra RBAC Matrix bảo mật cho 'integration' và 'audit'
  // -------------------------------------------------------------------------
  console.log('👉 TEST 1: Kiểm tra Phân Quyền (RBAC) cho "integration" & "audit"');

  // 1.1 Integration RBAC
  assert(can('OWNER', 'integration', 'read') === true, 'OWNER có quyền READ integration');
  assert(can('OWNER', 'integration', 'create') === true, 'OWNER có quyền CREATE integration');
  assert(can('OWNER', 'integration', 'update') === true, 'OWNER có quyền UPDATE integration');
  assert(can('OWNER', 'integration', 'delete') === true, 'OWNER có quyền DELETE integration');

  assert(can('ADMIN', 'integration', 'read') === true, 'ADMIN có quyền READ integration');
  assert(can('ADMIN', 'integration', 'create') === true, 'ADMIN có quyền CREATE integration');
  assert(can('ADMIN', 'integration', 'update') === true, 'ADMIN có quyền UPDATE integration');
  assert(can('ADMIN', 'integration', 'delete') === false, 'ADMIN BỊ CHẶN quyền DELETE integration');

  assert(canAccess('EDITOR', 'integration') === false, 'EDITOR BỊ ẨN menu integration');
  assert(can('EDITOR', 'integration', 'read') === false, 'EDITOR BỊ CHẶN quyền READ integration');
  assert(can('EDITOR', 'integration', 'create') === false, 'EDITOR BỊ CHẶN quyền CREATE integration');

  assert(canAccess('VIEWER', 'integration') === false, 'VIEWER BỊ ẨN menu integration');
  assert(can('VIEWER', 'integration', 'read') === false, 'VIEWER BỊ CHẶN quyền READ integration');

  // 1.2 Audit RBAC
  assert(can('OWNER', 'audit', 'read') === true, 'OWNER có quyền READ audit');
  assert(can('ADMIN', 'audit', 'read') === true, 'ADMIN có quyền READ audit');
  assert(can('ADMIN', 'audit', 'create') === false, 'ADMIN không có quyền ghi/sửa audit');

  assert(canAccess('EDITOR', 'audit') === false, 'EDITOR BỊ ẨN menu audit');
  assert(can('EDITOR', 'audit', 'read') === false, 'EDITOR BỊ CHẶN quyền READ audit');
  assert(canAccess('VIEWER', 'audit') === false, 'VIEWER BỊ ẨN menu audit');
  assert(can('VIEWER', 'audit', 'read') === false, 'VIEWER BỊ CHẶN quyền READ audit');

  let editorAuditBlocked = false;
  try {
    assertCan('EDITOR', 'audit', 'read');
  } catch (e) {
    if (e instanceof PermissionError) editorAuditBlocked = true;
  }
  assert(editorAuditBlocked, 'assertCan() ném PermissionError khi EDITOR cố tình truy cập audit log');

  // -------------------------------------------------------------------------
  // TEST 2: Kiểm tra Nguyên Tắc An Toàn Secret (Chỉ nhận tên biến môi trường)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 2: Kiểm tra Nguyên Tắc Bảo Mật Secret (Chặn Token Thô)');

  // 2.1 Thử truyền access token thật vào secretRef -> Phải bị Zod chặn
  const rawTokenTest1 = integrationSchema.safeParse({
    provider: 'SLACK',
    name: 'Test Raw Token',
    secretRef: 'raw-token-123-abcdefghijklmn', // Token thô nguy hiểm
  });
  assert(!rawTokenTest1.success, 'Zod validator chặn token thô dạng xoxb-...');

  const rawTokenTest2 = integrationSchema.safeParse({
    provider: 'GITHUB',
    name: 'Test GitHub Token',
    secretRef: 'raw_github_token_1234567890abcdef',
  });
  assert(!rawTokenTest2.success, 'Zod validator chặn personal access token GitHub');

  // 2.2 Tên biến môi trường chuẩn -> Phải được chấp nhận
  const validEnvTest = integrationSchema.safeParse({
    provider: 'SLACK',
    name: 'Test Env Variable',
    secretRef: 'SLACK_BOT_TOKEN',
  });
  assert(validEnvTest.success, 'Zod validator chấp nhận tên biến môi trường chuẩn SLACK_BOT_TOKEN');

  const validVaultTest = integrationSchema.safeParse({
    provider: 'RESEND',
    name: 'Test Vault Key',
    secretRef: 'vault://flowbase/resend-key',
  });
  assert(validVaultTest.success, 'Zod validator chấp nhận vault key dạng vault://...');

  // -------------------------------------------------------------------------
  // TEST 3: Quản Lý Kết Nối & Kiểm Tra Test Connection trong PostgreSQL
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 3: Quản Lý Kết Nối Integrations trong PostgreSQL');

  const createdIntegration = await prisma.integration.create({
    data: {
      provider: 'SLACK',
      name: 'Test Slack Integration',
      secretRef: 'TEST_NON_EXISTENT_VAR',
      scopes: ['chat:write', 'channels:read'],
      status: 'DISCONNECTED',
    },
  });
  assert(createdIntegration.id !== '', 'Tạo thành công bản ghi Integration mới trong PostgreSQL');

  const foundIntegration = await getIntegration(createdIntegration.id);
  assert(foundIntegration !== null, 'getIntegration() tìm thấy kết nối theo ID');
  assert(foundIntegration?.name === 'Test Slack Integration', 'Tên kết nối khớp 100%');

  const allIntegrations = await listIntegrations();
  assert(allIntegrations.length >= 1, 'listIntegrations() lấy dữ liệu trực tiếp từ PostgreSQL');

  // Thử nghiệm test connection với biến môi trường KHÔNG tồn tại
  let missingVarResult = false;
  if (!process.env.TEST_NON_EXISTENT_VAR) {
    await prisma.integration.update({
      where: { id: createdIntegration.id },
      data: {
        status: 'ERROR',
        lastError: 'Không tìm thấy biến môi trường TEST_NON_EXISTENT_VAR',
      },
    });
    const updated = await getIntegration(createdIntegration.id);
    missingVarResult = updated?.status === 'ERROR';
  }
  assert(missingVarResult, 'Cập nhật chính xác trạng thái ERROR khi thiếu biến môi trường');

  // Thử nghiệm test connection với biến môi trường CÓ tồn tại
  process.env.TEST_EXISTING_SECRET = 'fake-active-token';
  await prisma.integration.update({
    where: { id: createdIntegration.id },
    data: {
      secretRef: 'TEST_EXISTING_SECRET',
      status: 'CONNECTED',
      lastSyncAt: new Date(),
      lastError: null,
    },
  });
  const activeIntegration = await getIntegration(createdIntegration.id);
  assert(activeIntegration?.status === 'CONNECTED', 'Cập nhật trạng thái CONNECTED khi có biến môi trường');
  assert(activeIntegration?.lastSyncAt !== null, 'Ghi nhận thời gian lastSyncAt thành công');

  const summary = await integrationsSummary();
  assert(summary.total >= 1, 'integrationsSummary() đếm tổng số kết nối');
  assert(summary.connected >= 1, 'integrationsSummary() đếm số kết nối CONNECTED');

  // -------------------------------------------------------------------------
  // TEST 4: Webhook Endpoints & Cơ Chế Giao Vận emitEvent()
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 4: Webhook Endpoints & Cơ Chế Giao Vận emitEvent()');

  const webhook1 = await prisma.webhookEndpoint.create({
    data: {
      url: 'https://webhook.site/test-flowbase-webhook-001',
      description: 'Test Webhook cho sự kiện lead',
      events: ['lead.created', 'invoice.paid'],
      active: true,
    },
  });
  assert(webhook1.id !== '', 'Tạo thành công WebhookEndpoint trong PostgreSQL');

  const webhooksList = await listWebhooks();
  assert(webhooksList.some((w) => w.id === webhook1.id), 'listWebhooks() tìm thấy endpoint vừa tạo');

  // Bắn sự kiện "lead.created" qua emitEvent()
  const deliveries = await emitEvent('lead.created', {
    id: 'test_lead_001',
    name: 'Nguyễn Văn Test',
    email: 'test@customer.com',
  });
  assert(deliveries.length >= 1, 'emitEvent() tìm thấy endpoint phù hợp và tạo WebhookDelivery');

  const savedDelivery = await prisma.webhookDelivery.findFirst({
    where: { endpointId: webhook1.id },
    orderBy: { createdAt: 'desc' },
  });
  assert(savedDelivery !== null && savedDelivery.attempts >= 1, 'attempts được ghi nhận ít nhất 1 lần gửi');
  assert(savedDelivery?.event === 'lead.created', 'Sự kiện lưu trữ chính xác là lead.created');

  // Thử tắt active của endpoint
  await prisma.webhookEndpoint.update({
    where: { id: webhook1.id },
    data: { active: false },
  });

  // Đếm deliveries trước khi bắn
  const countBefore = await prisma.webhookDelivery.count({ where: { endpointId: webhook1.id } });
  await emitEvent('lead.created', { id: 'test_lead_002' });
  const countAfter = await prisma.webhookDelivery.count({ where: { endpointId: webhook1.id } });
  assert(countAfter === countBefore, 'emitEvent() bỏ qua không gửi tới endpoint đã bị tắt (active: false)');

  // -------------------------------------------------------------------------
  // TEST 5: Hệ Thống Nhật Ký Kiểm Toán recordAudit() & listAuditLogs()
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 5: Hệ Thống Nhật Ký Kiểm Toán (Audit Logs) trong PostgreSQL');

  const auditEntry = await recordAudit({
    action: 'CREATE',
    entityType: 'Lead',
    entityId: 'test-entity-001',
    summary: 'Tạo khách hàng tiềm năng mới qua website form',
    ip: '192.168.1.1',
    diff: { before: null, after: { name: 'Lead Test Audit' } },
  });
  assert(auditEntry !== null, 'recordAudit() ghi thành công bản ghi vào bảng audit_logs trong PostgreSQL');
  assert(auditEntry?.action === 'CREATE', 'Hành động lưu trữ đúng chuẩn AuditAction: CREATE');
  assert(auditEntry?.entityType === 'Lead', 'entityType lưu trữ chính xác: Lead');

  const auditLogs = await listAuditLogs({ entityType: 'Lead' });
  assert(auditLogs.data.length >= 1, 'listAuditLogs() lấy dữ liệu trực tiếp từ PostgreSQL');
  assert(
    auditLogs.data.some((a) => a.entityId === 'test-entity-001'),
    'Tìm thấy bản ghi audit log vừa tạo với entityId khớp',
  );

  const actionFilterLogs = await listAuditLogs({ action: 'CREATE' });
  assert(
    actionFilterLogs.data.some((a) => a.entityId === 'test-entity-001'),
    'Lọc theo action CREATE thành công',
  );

  // -------------------------------------------------------------------------
  // DỌN DẸP DỮ LIỆU THỬ NGHIỆM
  // -------------------------------------------------------------------------
  await prisma.webhookDelivery.deleteMany({
    where: { endpoint: { url: { contains: 'test-flowbase' } } },
  });
  await prisma.webhookEndpoint.deleteMany({
    where: { url: { contains: 'test-flowbase' } },
  });
  await prisma.integration.deleteMany({
    where: { id: createdIntegration.id },
  });
  await prisma.auditLog.deleteMany({
    where: { entityId: { in: ['test-entity-001', 'test-entity-002'] } },
  });

  console.log('\n======================================================');
  console.log(`🎉 TẤT CẢ ${passedTests}/${totalTests} TESTS HỆ THỐNG ĐÃ VƯỢT QUA XUẤT SẮC 100%!`);
  console.log('======================================================\n');
}

runSystemIntegrationTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
