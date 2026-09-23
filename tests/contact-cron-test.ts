import { prisma } from '../src/lib/prisma';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function run() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ: CONTACT API & OVERDUE CRON');
  console.log('======================================================\n');

  // Test 1: Contact duplicate suppression (uniq_lead_email_per_day)
  console.log('👉 TEST 1: Ràng buộc duy nhất Email trong ngày (Spam Protection)');
  const testEmail = `contact.bot.${Date.now()}@spam.test`;

  const lead1 = await prisma.lead.create({
    data: {
      name: 'Bot Lần 1',
      email: testEmail,
      message: 'Xin chào, tôi cần tư vấn chuyển đổi số sang phần mềm.',
      source: 'WEBSITE_FORM',
    },
  });
  assert(lead1.id.length > 0, 'Lần gửi đầu tiên được lưu thành công vào PostgreSQL');

  let caughtP2002 = false;
  try {
    await prisma.lead.create({
      data: {
        name: 'Bot Lần 2 (Cùng Ngày)',
        email: testEmail,
        message: 'Spam gửi lặp lại lần 2 trong ngày',
        source: 'WEBSITE_FORM',
      },
    });
  } catch (err: any) {
    if (err.code === 'P2002') caughtP2002 = true;
  }
  assert(caughtP2002, 'PostgreSQL kích hoạt uniq_lead_email_per_day chặn gửi lặp trong cùng ngày');

  // Test 2: mark_overdue_invoices() SQL function
  console.log('\n👉 TEST 2: Hàm PL/pgSQL mark_overdue_invoices()');
  const result = await prisma.$queryRawUnsafe<{ mark_overdue_invoices: number }[]>(
    'SELECT mark_overdue_invoices();',
  );
  assert(result.length > 0, 'Gọi hàm SELECT mark_overdue_invoices() thành công');
  assert(typeof result[0].mark_overdue_invoices === 'number', 'Trả về số lượng hoá đơn cập nhật');

  // Dọn dẹp
  await prisma.lead.delete({ where: { id: lead1.id } });
  console.log('\n  ✓ Đã dọn dẹp sạch dữ liệu kiểm thử.');

  console.log('\n======================================================');
  console.log('🎉 TẤT CẢ TESTS CONTACT & CRON ĐÃ VƯỢT QUA 100%!');
  console.log('======================================================\n');
}

run()
  .catch((err) => {
    console.error('Lỗi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
