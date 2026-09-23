/**
 * Integration Test Suite cho Phân hệ Database FLOWBASE:
 * 1. Kiểm tra kết nối Prisma Singleton & 4 tài khoản seed (bcrypt password verify).
 * 2. Kiểm tra CHECK Constraints: Chặn số âm, chặn lệch số học hoá đơn.
 * 3. Kiểm tra PL/pgSQL Trigger: Tự động đồng bộ amountPaid và status (SENT -> PARTIAL -> PAID).
 * 4. Kiểm tra Partial Unique Index: Cho phép tái sử dụng slug/mã khi bản ghi cũ đã soft-delete.
 */
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

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

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU INTEGRATION TESTS: DATABASE & PRISMA LAYER');
  console.log('======================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: Kiểm tra 4 tài khoản seed & Xác thực bcrypt password
  // -------------------------------------------------------------------------
  console.log('👉 TEST 1: Kiểm tra 4 tài khoản seed & Verify mật khẩu bcrypt');
  const users = await prisma.user.findMany({
    where: { email: { in: ['owner@flowbase.studio', 'admin@flowbase.studio', 'editor@flowbase.studio', 'viewer@flowbase.studio'] } },
    orderBy: { role: 'asc' },
  });

  assert(users.length === 4, 'Tìm thấy đủ 4 tài khoản seed trong PostgreSQL');

  const roles = users.map((u) => u.role);
  assert(
    roles.includes('OWNER') && roles.includes('ADMIN') && roles.includes('EDITOR') && roles.includes('VIEWER'),
    'Cả 4 vai trò OWNER, ADMIN, EDITOR, VIEWER đều hiện diện chính xác',
  );

  for (const user of users) {
    const isMatch = await bcrypt.compare('flowbase123', user.passwordHash ?? '');
    assert(isMatch, `Mật khẩu 'flowbase123' khớp chính xác với hash của user ${user.email} (${user.role})`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Kiểm tra CHECK Constraints (Ràng buộc chặn dữ liệu sai ở DB)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 2: Kiểm tra CHECK Constraints (Ngăn chặn dữ liệu vi phạm)');

  // 2.1 Cố tình chèn chi phí âm (chk_expense_amount_positive)
  let caughtExpenseError = false;
  try {
    await prisma.expense.create({
      data: {
        vendor: 'Test Vendor',
        description: 'Test Invalid Expense',
        amount: -50000, // Sai luật: amount > 0
        currency: 'VND',
        category: 'SOFTWARE',
        spentAt: new Date(),
      },
    });
  } catch (err: any) {
    caughtExpenseError = true;
    assert(
      err.message.includes('chk_expense_amount_positive') || err.code === 'P2004' || err.message.includes('check constraint'),
      'PostgreSQL bắt lỗi chk_expense_amount_positive khi cố tình chèn số tiền âm',
    );
  }
  assert(caughtExpenseError, 'DB từ chối chèn chi phí có số tiền âm');

  // 2.2 Cố tình chèn hoá đơn lệch số học (chk_invoice_total_consistent)
  let caughtInvoiceMathError = false;
  try {
    // Tạo client tạm
    const tempClient = await prisma.client.create({
      data: { name: 'Math Test Client', email: 'math-test@client.com' },
    });

    await prisma.invoice.create({
      data: {
        code: 'INV-TEST-MATH-FAIL',
        clientId: tempClient.id,
        subtotal: 1000000,
        discount: 100000,
        taxRate: 10,
        taxAmount: 90000,
        total: 500000, // Sai số học: 1.000.000 - 100.000 + 90.000 = 990.000 chứ không phải 500.000!
        dueDate: new Date(),
        issueDate: new Date(),
      },
    });
  } catch (err: any) {
    caughtInvoiceMathError = true;
    assert(
      err.message.includes('chk_invoice_total_consistent') || err.code === 'P2004' || err.message.includes('check constraint'),
      'PostgreSQL bắt lỗi chk_invoice_total_consistent khi tổng hoá đơn lệch số học',
    );
  } finally {
    await prisma.client.deleteMany({ where: { email: 'math-test@client.com' } });
  }
  assert(caughtInvoiceMathError, 'DB từ chối chèn hoá đơn có tổng tiền tính sai');

  // -------------------------------------------------------------------------
  // TEST 3: Kiểm tra PL/pgSQL Trigger (sync_invoice_payment_state)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 3: Kiểm tra Trigger tự động đồng bộ thanh toán Hoá đơn');

  await prisma.payment.deleteMany({ where: { invoice: { code: 'INV-TRIGGER-TEST' } } });
  await prisma.invoice.deleteMany({ where: { code: 'INV-TRIGGER-TEST' } });
  await prisma.client.deleteMany({ where: { email: 'trigger@test.com' } });

  const testClient = await prisma.client.create({
    data: { name: 'Trigger Test Client', email: 'trigger@test.com' },
  });

  const invoice = await prisma.invoice.create({
    data: {
      code: 'INV-TRIGGER-TEST',
      clientId: testClient.id,
      subtotal: 10000000,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 10000000,
      amountPaid: 0,
      status: 'SENT',
      dueDate: new Date(Date.now() + 86400000 * 7), // 7 ngày tới
      issueDate: new Date(),
    },
  });

  assert(Number(invoice.amountPaid) === 0 && invoice.status === 'SENT', 'Hoá đơn ban đầu: amountPaid = 0, status = SENT');

  // Đợt 1: Thanh toán 4,000,000 (Một phần)
  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: 4000000,
      method: 'BANK_TRANSFER',
      paidAt: new Date(),
    },
  });

  // Query lại hoá đơn để kiểm tra Trigger đã chạy chưa
  const invAfterPart1 = await prisma.invoice.findUnique({ where: { id: invoice.id } });
  assert(
    Number(invAfterPart1?.amountPaid) === 4000000,
    `Trigger tự động cập nhật amountPaid lên 4,000,000 VND (Thực tế: ${invAfterPart1?.amountPaid})`,
  );
  assert(
    invAfterPart1?.status === 'PARTIAL',
    `Trigger tự động chuyển trạng thái hoá đơn thành PARTIAL (Thực tế: ${invAfterPart1?.status})`,
  );

  // Đợt 2: Thanh toán nốt 6,000,000 (Đủ 100%)
  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: 6000000,
      method: 'BANK_TRANSFER',
      paidAt: new Date(),
    },
  });

  const invAfterPart2 = await prisma.invoice.findUnique({ where: { id: invoice.id } });
  assert(
    Number(invAfterPart2?.amountPaid) === 10000000,
    `Trigger tự động cập nhật amountPaid lên 10,000,000 VND (Thực tế: ${invAfterPart2?.amountPaid})`,
  );
  assert(
    invAfterPart2?.status === 'PAID',
    `Trigger tự động chuyển trạng thái hoá đơn thành PAID (Thực tế: ${invAfterPart2?.status})`,
  );
  assert(invAfterPart2?.paidAt !== null, 'Trigger tự động ghi nhận paidAt khi thu đủ 100%');

  // Dọn dẹp dữ liệu test trigger
  await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.invoice.delete({ where: { id: invoice.id } });
  await prisma.client.delete({ where: { id: testClient.id } });
  console.log('  ✓ Đã dọn dẹp sạch dữ liệu thử nghiệm trigger');

  // -------------------------------------------------------------------------
  // TEST 4: Kiểm tra Partial Unique Index (Soft Delete An Toàn)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 4: Kiểm tra Partial Unique Index (Soft Delete)');

  await prisma.demo.deleteMany({ where: { slug: 'test-partial-unique-slug' } });

  const demo1 = await prisma.demo.create({
    data: {
      slug: 'test-partial-unique-slug',
      title: 'Demo Test 1',
      category: 'Test',
      summary: 'Short summary for test',
      status: 'DRAFT',
    },
  });

  // Soft delete demo1
  await prisma.demo.update({
    where: { id: demo1.id },
    data: { deletedAt: new Date() },
  });

  // Tạo demo2 cùng slug với demo1 đã xoá tạm
  const demo2 = await prisma.demo.create({
    data: {
      slug: 'test-partial-unique-slug',
      title: 'Demo Test 2 (Reused Slug)',
      category: 'Test',
      summary: 'Short summary for test 2',
      status: 'DRAFT',
    },
  });

  assert(demo2.id !== demo1.id, 'Tạo thành công bản ghi mới trùng slug khi bản ghi cũ đã soft-delete (deletedAt IS NOT NULL)');

  // Dọn dẹp
  await prisma.demo.deleteMany({ where: { slug: 'test-partial-unique-slug' } });
  console.log('  ✓ Đã dọn dẹp dữ liệu thử nghiệm soft-delete');

  console.log('\n======================================================');
  console.log(`🎉 TẤT CẢ ${passedTests}/${totalTests} TESTS ĐÃ VƯỢT QUA XUẤT SẮC 100%!`);
  console.log('======================================================\n');
}

runTests()
  .catch((e) => {
    console.error('FATAL TEST ERROR:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
