/**
 * Integration Test Suite cho Phân hệ Quản lý Tài chính, Hoá đơn & Chi phí:
 * 1. Kiểm tra RBAC Matrix bảo mật cho 'invoice' và 'expense'.
 * 2. Kiểm tra Database CHECK Constraints (ngày tháng, số học dòng hàng, tổng tiền).
 * 3. Kiểm tra Tạo mới Hoá đơn nhiều dòng (Invoice + InvoiceItems) & Mã duy nhất.
 * 4. Kiểm tra Trigger PL/pgSQL sync_invoice_payment_state (tự động chuyển SENT -> PARTIAL -> PAID).
 * 5. Kiểm tra Ghi nhận Chi phí (Expenses) & Lọc danh mục.
 * 6. Kiểm tra Tổng hợp Tài chính financeSummary() thời gian thực.
 * 7. Kiểm tra Cơ chế Xoá mềm (Soft Delete).
 */
import { prisma } from '../src/lib/prisma';
import {
  listInvoices,
  getInvoice,
  listPayments,
  listExpenses,
  financeSummary,
} from '../src/server/repositories';
import { can, assertCan, PermissionError } from '../src/lib/rbac';
import { computeInvoiceTotals } from '../src/lib/validators';

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

async function runFinanceTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU INTEGRATION TESTS: FINANCE (INVOICES & EXPENSES)');
  console.log('======================================================\n');

  // Dọn dẹp dữ liệu thử nghiệm trước
  const testCodes = ['INV-TEST-001', 'INV-TEST-002', 'INV-TEST-003', 'INV-2026-991'];
  await prisma.payment.deleteMany({
    where: { invoice: { code: { in: testCodes } } },
  });
  await prisma.invoiceItem.deleteMany({
    where: { invoice: { code: { in: testCodes } } },
  });
  await prisma.invoice.deleteMany({
    where: { code: { in: testCodes } },
  });
  await prisma.expense.deleteMany({
    where: { vendor: { in: ['Test Cloud Server Hosting', 'Test SaaS Tool License'] } },
  });
  await prisma.client.deleteMany({
    where: { taxCode: '0107776661' },
  });

  // Tạo khách hàng thử nghiệm
  const testClient = await prisma.client.create({
    data: {
      name: 'Tập đoàn Tài chính Thử nghiệm',
      legalName: 'Công ty Cổ phần Tài chính Thử nghiệm',
      taxCode: '0107776661',
      email: 'finance-test@company.vn',
      status: 'ACTIVE',
    },
  });

  // -------------------------------------------------------------------------
  // TEST 1: Kiểm tra RBAC Matrix bảo vệ Tài chính
  // -------------------------------------------------------------------------
  console.log('👉 TEST 1: Kiểm tra RBAC Matrix phân quyền cho Hoá đơn & Chi phí');

  assert(can('OWNER', 'invoice', 'create') === true, 'OWNER có quyền tạo hoá đơn');
  assert(can('ADMIN', 'invoice', 'create') === true, 'ADMIN có quyền tạo hoá đơn');
  assert(can('ADMIN', 'invoice', 'update') === true, 'ADMIN có quyền cập nhật thanh toán');
  assert(can('ADMIN', 'expense', 'create') === true, 'ADMIN có quyền ghi nhận chi phí');

  assert(can('EDITOR', 'invoice', 'read') === false, 'EDITOR bị chặn xem hoá đơn (chống lộ số liệu tài chính)');
  assert(can('EDITOR', 'expense', 'read') === false, 'EDITOR bị chặn xem chi phí');
  assert(can('VIEWER', 'invoice', 'read') === false, 'VIEWER bị chặn xem hoá đơn');
  assert(can('VIEWER', 'expense', 'read') === false, 'VIEWER bị chặn xem chi phí');

  let editorBlocked = false;
  try {
    assertCan('EDITOR', 'invoice', 'read');
  } catch (err) {
    if (err instanceof PermissionError) editorBlocked = true;
  }
  assert(editorBlocked, 'assertCan ném PermissionError khi EDITOR cố truy cập hoá đơn');

  // -------------------------------------------------------------------------
  // TEST 2: Kiểm tra Database CHECK Constraints
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 2: Kiểm tra Database CHECK Constraints');

  // 2.1 chk_invoice_dates: dueDate < issueDate bị chặn
  let dateOrderRejected = false;
  try {
    await prisma.invoice.create({
      data: {
        code: 'INV-TEST-001',
        clientId: testClient.id,
        issueDate: new Date('2026-05-15'),
        dueDate: new Date('2026-05-01'), // Sai: hạn thu trước ngày phát hành
      },
    });
  } catch (err: any) {
    dateOrderRejected = true;
    assert(
      err.message.includes('chk_invoice_dates') || err.message.includes('check constraint'),
      'PostgreSQL từ chối chèn hoá đơn có dueDate < issueDate (chk_invoice_dates)',
    );
  }
  assert(dateOrderRejected, 'Ràng buộc chk_invoice_dates hoạt động chính xác');

  // 2.2 chk_invoice_amounts: discount > subtotal bị chặn
  let discountRejected = false;
  try {
    await prisma.invoice.create({
      data: {
        code: 'INV-TEST-002',
        clientId: testClient.id,
        issueDate: new Date('2026-05-01'),
        dueDate: new Date('2026-05-15'),
        subtotal: 10000000,
        discount: 20000000, // Sai: chiết khấu lớn hơn tiền hàng
        total: 0,
      },
    });
  } catch (err: any) {
    discountRejected = true;
    assert(
      err.message.includes('chk_invoice_amounts') || err.message.includes('check constraint'),
      'PostgreSQL từ chối chiết khấu vượt quá tiền hàng (chk_invoice_amounts)',
    );
  }
  assert(discountRejected, 'Ràng buộc chk_invoice_amounts bảo vệ chiết khấu chính xác');

  // 2.3 chk_invoice_total_consistent: total != subtotal - discount + taxAmount bị chặn
  let totalMathRejected = false;
  try {
    await prisma.invoice.create({
      data: {
        code: 'INV-TEST-003',
        clientId: testClient.id,
        issueDate: new Date('2026-05-01'),
        dueDate: new Date('2026-05-15'),
        subtotal: 10000000,
        discount: 0,
        taxRate: 8,
        taxAmount: 800000,
        total: 99999999, // Sai: tổng tiền cố tình lệch với số học
      },
    });
  } catch (err: any) {
    totalMathRejected = true;
    assert(
      err.message.includes('chk_invoice_total_consistent') || err.message.includes('check constraint'),
      'PostgreSQL từ chối hoá đơn có tổng tiền không khớp số học (chk_invoice_total_consistent)',
    );
  }
  assert(totalMathRejected, 'Ràng buộc chk_invoice_total_consistent bảo vệ tính toàn vẹn số học');

  // -------------------------------------------------------------------------
  // TEST 3: Tạo Hoá đơn nhiều dòng (Invoice + InvoiceItems) & Mã duy nhất
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 3: Tạo mới Hoá đơn nhiều dòng & Ràng buộc mã duy nhất');

  const rawItems = [
    { description: 'Module Thiết kế & Prototype UI/UX', quantity: 1, unitPrice: 50000000 },
    { description: 'Module Lập trình API & Tích hợp ERP', quantity: 2, unitPrice: 5000000 },
  ];
  const totals = computeInvoiceTotals({ items: rawItems, discount: 0, taxRate: 8 });
  assert(totals.subtotal === 60000000, 'Tạm tính tiền hàng đúng 60,000,000 ₫');
  assert(totals.taxAmount === 4800000, 'Tiền thuế VAT 8% đúng 4,800,000 ₫');
  assert(totals.total === 64800000, 'Tổng thanh toán đúng 64,800,000 ₫');

  const invoice1 = await prisma.invoice.create({
    data: {
      code: 'INV-2026-991',
      clientId: testClient.id,
      issueDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-20'),
      currency: 'VND',
      exchangeRate: 1,
      subtotal: totals.subtotal,
      discount: 0,
      taxRate: 8,
      taxAmount: totals.taxAmount,
      total: totals.total,
      amountPaid: 0,
      status: 'SENT',
      items: {
        create: rawItems.map((item, idx) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          sortOrder: idx + 1,
        })),
      },
    },
    include: {
      client: { select: { name: true } },
      items: true,
    },
  });

  assert(invoice1.id !== '', 'Tạo thành công hoá đơn trong PostgreSQL');
  assert(invoice1.items.length === 2, 'Hoá đơn chứa đúng 2 dòng chi tiết');
  assert(Number(invoice1.total) === 64800000, 'Tổng tiền hoá đơn lưu chính xác');
  assert(invoice1.status === 'SENT', 'Trạng thái khởi tạo là SENT');

  // Thử tạo trùng mã -> P2002
  let caughtDuplicateCode = false;
  try {
    await prisma.invoice.create({
      data: {
        code: 'INV-2026-991', // Trùng mã
        clientId: testClient.id,
        issueDate: new Date('2026-04-01'),
        dueDate: new Date('2026-04-20'),
      },
    });
  } catch (err: any) {
    caughtDuplicateCode = true;
    assert(err.code === 'P2002', 'PostgreSQL chặn trùng lặp mã hoá đơn (P2002)');
  }
  assert(caughtDuplicateCode, 'Bảo vệ tính duy nhất của mã hoá đơn');

  // -------------------------------------------------------------------------
  // TEST 4: Trigger PL/pgSQL sync_invoice_payment_state (SENT -> PARTIAL -> PAID)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 4: Kiểm tra Trigger PL/pgSQL sync_invoice_payment_state');

  // 4.1 Thu đợt 1: 30,000,000 ₫ (Một phần)
  const payment1 = await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 30000000,
      currency: 'VND',
      method: 'BANK_TRANSFER',
      paidAt: new Date('2026-04-05'),
      reference: 'FT2604050011',
    },
  });
  assert(payment1.id !== '', 'Ghi nhận thành công đợt thanh toán 1');

  // Kiểm tra Invoice sau khi Trigger tự động chạy
  const invoiceAfterPay1 = await prisma.invoice.findUnique({
    where: { id: invoice1.id },
  });
  assert(Number(invoiceAfterPay1?.amountPaid) === 30000000, 'Trigger PostgreSQL tự động cập nhật amountPaid lên 30,000,000 ₫');
  assert(invoiceAfterPay1?.status === 'PARTIAL', 'Trigger PostgreSQL tự động chuyển status sang PARTIAL');
  assert(invoiceAfterPay1?.paidAt === null, 'paidAt vẫn là null vì chưa thu đủ');

  // 4.2 Thu đợt 2: 34,800,000 ₫ (Thu đủ 100%)
  const payment2 = await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 34800000,
      currency: 'VND',
      method: 'BANK_TRANSFER',
      paidAt: new Date('2026-04-10'),
      reference: 'FT2604100088',
    },
  });
  assert(payment2.id !== '', 'Ghi nhận thành công đợt thanh toán 2');

  const invoiceAfterPay2 = await prisma.invoice.findUnique({
    where: { id: invoice1.id },
  });
  assert(Number(invoiceAfterPay2?.amountPaid) === 64800000, 'Trigger PostgreSQL tự động cập nhật amountPaid lên 64,800,000 ₫');
  assert(invoiceAfterPay2?.status === 'PAID', 'Trigger PostgreSQL tự động chuyển status sang PAID khi thu đủ');
  assert(invoiceAfterPay2?.paidAt !== null, 'Trigger PostgreSQL tự động ghi nhận mốc thời gian paidAt');

  // -------------------------------------------------------------------------
  // TEST 5: Ghi nhận Chi phí (Expenses) & Lọc danh mục
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 5: Ghi nhận Chi phí (Expenses) & Lọc');

  const expense1 = await prisma.expense.create({
    data: {
      vendor: 'Test Cloud Server Hosting',
      category: 'INFRASTRUCTURE',
      description: 'Máy chủ cụm k8s staging',
      amount: 4500000,
      currency: 'VND',
      spentAt: new Date('2026-04-02'),
      billable: false,
      recurrence: 'monthly',
    },
  });

  const expense2 = await prisma.expense.create({
    data: {
      vendor: 'Test SaaS Tool License',
      category: 'SOFTWARE',
      description: 'Bản quyền công cụ thiết kế',
      amount: 1500000,
      currency: 'VND',
      spentAt: new Date('2026-04-03'),
      billable: true,
      recurrence: null,
    },
  });

  assert(expense1.id !== '' && expense2.id !== '', 'Tạo thành công 2 bản ghi chi phí');

  const listExp = await listExpenses({ category: 'INFRASTRUCTURE' });
  assert(listExp.data.some((e) => e.id === expense1.id), 'listExpenses lọc đúng chi phí theo nhóm INFRASTRUCTURE');
  assert(!listExp.data.some((e) => e.id === expense2.id), 'listExpenses loại trừ đúng chi phí khác nhóm');

  // -------------------------------------------------------------------------
  // TEST 6: Tổng hợp Tài chính financeSummary() thời gian thực
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 6: Kiểm tra Tổng hợp Tài chính financeSummary()');

  const summary = await financeSummary();
  assert(summary.billed >= 64800000, `financeSummary: tổng tiền xuất hoá đơn (${summary.billed}) bao gồm invoice1`);
  assert(summary.collected >= 64800000, `financeSummary: tổng tiền đã thu (${summary.collected}) bao gồm payment1 + payment2`);
  assert(summary.expenses >= 6000000, `financeSummary: tổng chi phí (${summary.expenses}) bao gồm expense1 + expense2`);
  assert(summary.recurringMonthly >= 4500000, `financeSummary: chi phí định kỳ tháng (${summary.recurringMonthly}) tính đúng`);
  assert(summary.net === summary.collected - summary.expenses, 'financeSummary: net = collected - expenses chuẩn xác');

  // -------------------------------------------------------------------------
  // TEST 7: Cơ chế Xoá mềm (Soft Delete)
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 7: Cơ chế Xoá mềm (Soft Delete) trên Hoá đơn & Chi phí');

  await prisma.invoice.update({
    where: { id: invoice1.id },
    data: { deletedAt: new Date() },
  });

  await prisma.expense.update({
    where: { id: expense1.id },
    data: { deletedAt: new Date() },
  });

  const invoiceListAfterDel = await listInvoices({ q: 'INV-2026-991' });
  assert(invoiceListAfterDel.data.length === 0, 'Hoá đơn bị xoá mềm không xuất hiện trong listInvoices');

  const expenseListAfterDel = await listExpenses({ q: 'Test Cloud Server Hosting' });
  assert(expenseListAfterDel.data.length === 0, 'Chi phí bị xoá mềm không xuất hiện trong listExpenses');

  const getInvAfterDel = await getInvoice(invoice1.id);
  assert(getInvAfterDel === null, 'getInvoice trả về null cho hoá đơn đã bị xoá mềm');

  // -------------------------------------------------------------------------
  // DỌN DẸP DỮ LIỆU TEST
  // -------------------------------------------------------------------------
  await prisma.payment.deleteMany({ where: { invoiceId: invoice1.id } });
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice1.id } });
  await prisma.invoice.delete({ where: { id: invoice1.id } });
  await prisma.expense.delete({ where: { id: expense1.id } });
  await prisma.expense.delete({ where: { id: expense2.id } });
  await prisma.client.delete({ where: { id: testClient.id } });
  console.log('\n  ✓ Đã dọn dẹp sạch toàn bộ dữ liệu thử nghiệm tài chính');

  console.log('\n======================================================');
  console.log(`🎉 TẤT CẢ ${passedTests}/${totalTests} FINANCE INTEGRATION TESTS ĐÃ VƯỢT QUA XUẤT SẮC 100%!`);
  console.log('======================================================\n');
}

runFinanceTests()
  .catch((e) => {
    console.error('FATAL FINANCE TEST ERROR:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
