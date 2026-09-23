/**
 * Integration Test Suite cho Phân hệ CRM (Khách Hàng & Leads) trên PostgreSQL:
 * 1. Kiểm tra Tạo mới Khách hàng & Ràng buộc trùng Mã số thuế (taxCode).
 * 2. Kiểm tra listClients & tính toán công nợ thực tế.
 * 3. Kiểm tra Tạo mới Lead & Trạng thái khởi tạo 'NEW'.
 * 4. Kiểm tra Thống kê KPI tự động bằng leadStatusCounts().
 * 5. Kiểm tra Tìm kiếm từ khoá và Bộ lọc trạng thái của Lead.
 */
import { prisma } from '../src/lib/prisma';
import { listClients, getClient, listLeads, getLead, leadStatusCounts } from '../src/server/repositories';

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

async function runCrmTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU INTEGRATION TESTS: CRM (CLIENTS & LEADS)');
  console.log('======================================================\n');

  // Dọn dẹp trước khi test nếu có dữ liệu cũ
  await prisma.lead.deleteMany({ where: { email: { in: ['test-crm-lead@example.com', 'test-crm-lead-2@example.com'] } } });
  await prisma.client.deleteMany({ where: { taxCode: '0109998881' } });

  // -------------------------------------------------------------------------
  // TEST 1: Tạo mới Khách hàng & Ràng buộc trùng Mã số thuế
  // -------------------------------------------------------------------------
  console.log('👉 TEST 1: Tạo mới Khách hàng & Ràng buộc duy nhất Mã số thuế');

  const client1 = await prisma.client.create({
    data: {
      name: 'Công ty Cổ phần Alpha Tech',
      legalName: 'Công ty Cổ phần Công nghệ Alpha Tech Việt Nam',
      taxCode: '0109998881',
      email: 'contact@alphatech.vn',
      phone: '0988 123 456',
      status: 'PROSPECT',
      address: 'Tầng 10, Toà nhà Bitexco, TP.HCM',
    },
  });
  assert(client1.id !== '', 'Tạo thành công khách hàng mới trong PostgreSQL');
  assert(client1.status === 'PROSPECT', 'Trạng thái ban đầu chính xác là PROSPECT');

  // Thử tạo khách hàng thứ 2 trùng mã số thuế -> PostgreSQL phải từ chối
  let caughtDuplicateTaxCode = false;
  try {
    await prisma.client.create({
      data: {
        name: 'Công ty Đối thủ Trùng MST',
        taxCode: '0109998881', // Trùng taxCode với client1
        email: 'duplicate@competitor.vn',
      },
    });
  } catch (err: any) {
    caughtDuplicateTaxCode = true;
    assert(
      err.code === 'P2002' || err.message.includes('taxCode'),
      'PostgreSQL từ chối chèn khách hàng trùng Mã số thuế (P2002)',
    );
  }
  assert(caughtDuplicateTaxCode, 'Hệ thống bảo vệ thành công tính duy nhất của Mã số thuế');

  // -------------------------------------------------------------------------
  // TEST 2: Kiểm tra Repository listClients & getClient
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 2: Kiểm tra Repository listClients & getClient');

  const clientList = await listClients({ q: 'Alpha Tech' });
  assert(clientList.total >= 1, 'listClients tìm thấy khách hàng theo từ khoá tìm kiếm');
  const foundClient = clientList.data.find((c) => c.id === client1.id);
  assert(foundClient?.name === 'Công ty Cổ phần Alpha Tech', 'Thông tin tên khách hàng khớp 100%');
  assert(typeof foundClient?.totalBilled === 'number', 'Trường totalBilled là kiểu số hợp lệ');

  const singleClient = await getClient(client1.id);
  assert(singleClient?.id === client1.id, 'getClient lấy đúng thông tin chi tiết của khách hàng');

  // -------------------------------------------------------------------------
  // TEST 3: Tạo mới Lead & Trạng thái khởi tạo 'NEW'
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 3: Tạo mới Lead & Trạng thái khởi tạo');

  const lead1 = await prisma.lead.create({
    data: {
      name: 'Nguyễn Văn An',
      email: 'test-crm-lead@example.com',
      company: 'Logistics An Khang',
      phone: '0909 111 222',
      source: 'WEBSITE_FORM',
      status: 'NEW',
      message: 'Cần chuyển đổi quy trình theo dõi đơn hàng bằng Excel 500 dòng/ngày sang phần mềm web.',
    },
  });
  assert(lead1.id !== '', 'Tạo thành công Lead mới trong PostgreSQL');
  assert(lead1.status === 'NEW', 'Trạng thái khởi tạo mặc định là NEW');
  assert(lead1.score === 0, 'Điểm tiềm năng (score) mặc định là 0');

  // -------------------------------------------------------------------------
  // TEST 4: Kiểm tra Thống kê KPI tự động bằng leadStatusCounts()
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 4: Thống kê KPI bằng leadStatusCounts()');

  const counts = await leadStatusCounts();
  assert(typeof counts.NEW === 'number' && counts.NEW >= 1, `leadStatusCounts phản ánh đúng số lead mới: ${counts.NEW}`);

  // -------------------------------------------------------------------------
  // TEST 5: Kiểm tra Tìm kiếm & Bộ lọc Repository listLeads
  // -------------------------------------------------------------------------
  console.log('\n👉 TEST 5: Tìm kiếm và lọc danh sách Lead');

  // Tìm theo tên
  const searchByName = await listLeads({ q: 'Nguyễn Văn An' });
  assert(searchByName.data.some((l) => l.id === lead1.id), 'Tìm thấy lead theo tên người liên hệ');

  // Tìm theo công ty
  const searchByCompany = await listLeads({ q: 'An Khang' });
  assert(searchByCompany.data.some((l) => l.id === lead1.id), 'Tìm thấy lead theo tên công ty');

  // Lọc theo trạng thái NEW -> Phải thấy
  const filterNew = await listLeads({ status: 'NEW' });
  assert(filterNew.data.some((l) => l.id === lead1.id), 'Lọc trạng thái NEW tìm thấy lead');

  // Lọc theo trạng thái WON -> Không được thấy lead1
  const filterWon = await listLeads({ status: 'WON' });
  assert(!filterWon.data.some((l) => l.id === lead1.id), 'Lọc trạng thái WON loại trừ chính xác lead NEW');

  // Lấy chi tiết lead
  const detailLead = await getLead(lead1.id);
  assert(detailLead?.id === lead1.id && detailLead.company === 'Logistics An Khang', 'getLead lấy chi tiết lead thành công');

  // -------------------------------------------------------------------------
  // DỌN DẸP DỮ LIỆU TEST
  // -------------------------------------------------------------------------
  await prisma.lead.deleteMany({ where: { email: 'test-crm-lead@example.com' } });
  await prisma.client.deleteMany({ where: { taxCode: '0109998881' } });
  console.log('\n  ✓ Đã dọn dẹp sạch dữ liệu thử nghiệm CRM');

  console.log('\n======================================================');
  console.log(`🎉 TẤT CẢ ${passedTests}/${totalTests} CRM TESTS ĐÃ VƯỢT QUA XUẤT SẮC 100%!`);
  console.log('======================================================\n');
}

runCrmTests()
  .catch((e) => {
    console.error('FATAL CRM TEST ERROR:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
