import React from 'react';
import type { Translation } from '../types';

export const vi: Translation = {
  nav: {
    solutions: 'Giải pháp',
    process: 'Quy trình',
    aiDev: 'Lập trình AI',
    core: 'Nền tảng Core',
    work: 'Dự án mẫu',
    technology: 'Công nghệ',
    contactBtn: 'Liên hệ →',
  },
  hero: {
    eyebrow: 'Studio phần mềm chuẩn AI',
    titleLine1: 'Từ bảng tính',
    titleLine2: 'đến phần mềm.',
    lead: 'FLOWBASE xây dựng phần mềm quản lý, hệ thống nội bộ và tự động hóa quy trình cho doanh nghiệp.',
    startProjectBtn: 'Khởi động dự án',
    viewWorkBtn: 'Xem sản phẩm mẫu',
    stat1: 'bước từ quy trình đến production',
    stat2: 'module dùng lại trong FLOWBASE Core',
    stat3: 'hệ thống nghiệp vụ mẫu',
    pipeline: 'flowbase / quy trình',
    mapping: 'mapping → validating → building',
    overview: 'Tổng quan vận hành',
    demoData: 'dữ liệu mẫu',
    records: 'Bản ghi',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
  },
  problem: {
    eyebrow: '02 — Vấn đề thực tế',
    title: (
      <>
        Doanh nghiệp của bạn đã có sẵn quy trình.
        <br />
        Chỉ là chưa thành phần mềm.
      </>
    ),
    lead: 'Nhiều doanh nghiệp đang vận hành bằng Excel, Google Sheets, email và quy trình thủ công. FLOWBASE biến những quy trình đó thành hệ thống phần mềm tập trung.',
    cards: {
      spreadsheets: {
        title: 'Quá nhiều file bảng tính',
        desc: 'Dữ liệu nằm rải rác trong nhiều file, mỗi phòng ban giữ một bản khác nhau.',
      },
      dataEntry: {
        title: 'Nhập liệu lặp đi lặp lại',
        desc: 'Một thông tin phải nhập lại nhiều lần ở nhiều nơi khác nhau.',
      },
      workflows: {
        title: 'Quy trình thủ công',
        desc: 'Quy trình phụ thuộc vào con người và vào vài nhân sự nắm việc.',
      },
      sourceOfTruth: {
        title: 'Không có nguồn dữ liệu chuẩn',
        desc: 'Không có một nơi tập trung để theo dõi dữ liệu và trạng thái xử lý.',
      },
      reporting: {
        title: 'Báo cáo chậm trễ',
        desc: 'Tổng hợp báo cáo mất nhiều thời gian và thường trễ so với nhu cầu ra quyết định.',
      },
    },
    conclusion: {
      title: 'Quy trình của bạn đã tồn tại.',
      desc: 'Việc còn lại là đưa nó vào một hệ thống có dữ liệu chung, phân quyền rõ ràng và luồng duyệt tự động.',
    },
  },
  solutions: {
    eyebrow: '03 — Giải pháp may đo',
    title: 'Phần mềm xây dựng xoay quanh quy trình của bạn.',
    lead: 'Chúng tôi không bán một sản phẩm đóng gói. Hệ thống được thiết kế theo đúng cách doanh nghiệp bạn đang vận hành.',
    cards: {
      businessMsg: {
        title: 'Quản trị doanh nghiệp',
        desc: 'HR, đào tạo, vận hành và quản lý hồ sơ trong một hệ thống.',
      },
      workflow: {
        title: 'Quy trình & Phê duyệt',
        desc: 'Submit → Review → Approve → Complete, có lịch sử và phân quyền.',
      },
      data: {
        title: 'Dữ liệu & Báo cáo',
        desc: 'Dữ liệu tập trung, báo cáo và phân tích cập nhật theo thời gian thực.',
      },
      excel: {
        title: 'Tự động hóa Excel',
        desc: 'Import → Validate → Process → Export, giữ lại file quen thuộc khi cần.',
      },
      internalTools: {
        title: 'Công cụ nội bộ',
        desc: 'Công cụ nội bộ xây riêng theo quy trình, không ép quy trình theo phần mềm.',
      },
      ai: {
        title: 'Phần mềm tích hợp AI',
        desc: 'AI-native development giúp rút ngắn vòng đời phát triển và thời gian phản hồi.',
      },
    },
    explore: 'Khám phá →',
  },
  process: {
    eyebrow: '04 — Quy trình triển khai',
    title: 'Từ bài toán thực tế đến phần mềm vận hành.',
    lead: 'Sáu bước, mỗi bước có đầu ra rõ ràng để bạn biết hệ thống đang đi đến đâu.',
    steps: {
      discover: {
        title: 'Khảo sát',
        desc: 'Hiểu doanh nghiệp đang vận hành như thế nào, ai làm gì và dữ liệu đi qua đâu.',
      },
      map: {
        title: 'Mô hình hóa',
        desc: 'Chuyển quy trình thực tế thành workflow và data model có thể triển khai.',
      },
      prototype: {
        title: 'Bản mẫu (Prototype)',
        desc: 'Xây phiên bản trực quan để duyệt trước khi phát triển toàn bộ hệ thống.',
      },
      build: {
        title: 'Xây dựng',
        desc: 'AI-assisted development kết hợp engineering review ở từng pull request.',
      },
      test: {
        title: 'Kiểm thử',
        desc: 'Kiểm tra business logic, phân quyền, dữ liệu và toàn bộ luồng duyệt.',
      },
      deploy: {
        title: 'Triển khai',
        desc: 'Đưa hệ thống vào production, bàn giao tài liệu và hướng dẫn vận hành.',
      },
    },
  },
  aiNative: {
    eyebrow: '05 — Phát triển chuẩn AI',
    title: (
      <>
        AI tăng tốc lập trình.
        <br />
        Con người ra quyết định.
      </>
    ),
    lead: 'FLOWBASE sử dụng AI như một người đồng hành trong quá trình phân tích, lập trình, kiểm thử và viết tài liệu. Mọi thay đổi đưa vào production đều được kiểm duyệt bởi kỹ sư.',
  },
  core: {
    eyebrow: '06 — Nền tảng FLOWBASE Core',
    title: 'Chúng tôi không xây dựng mọi thứ từ con số không.',
    lead: 'FLOWBASE Core là nền tảng tái sử dụng giúp chúng tôi xây dựng các hệ thống nghiệp vụ nhanh hơn và nhất quán hơn. Chọn một nghiệp vụ để xem phần nào thay đổi — và phần nào giữ nguyên.',
  },
  work: {
    eyebrow: '07 — Dự án & Sản phẩm mẫu',
    title: 'Thiết kế cho quy trình vận hành thực tế.',
    lead: 'Các hệ thống dưới đây là giao diện mẫu do FLOWBASE dựng để minh họa năng lực và cách chúng tôi thiết kế nghiệp vụ.',
    note: 'Đây là demo và concept do FLOWBASE tự xây dựng, không phải dự án khách hàng đã triển khai. Dữ liệu hiển thị là dữ liệu mẫu. Chúng tôi không đăng logo khách hàng, testimonial hay số liệu kinh doanh chưa có thật.',
    exploreBtn: 'Khám phá →',
  },
  caseStudy: {
    eyebrow: '08 — Nghiên cứu điển hình · Ý tưởng',
    title: 'Quản lý Giảng viên',
    lead: 'Một ví dụ đầy đủ về cách FLOWBASE chuyển một quy trình chạy bằng bảng tính thành hệ thống phần mềm.',
    flow: {
      problem: { title: 'Vấn đề', desc: 'Thông tin giảng viên nằm rải rác ở nhiều bảng tính và tài liệu riêng biệt.' },
      existing: { title: 'Quy trình hiện tại', desc: 'Excel, hợp đồng giấy, bảng số tiết và file thanh toán tách rời nhau.' },
      solution: { title: 'Giải pháp FLOWBASE', desc: 'Một hồ sơ giảng viên duy nhất, mọi dữ liệu gắn vào hồ sơ đó.' },
      system: { title: 'Hệ thống', desc: 'Dashboard, hồ sơ, phân công giảng dạy và thanh toán trong cùng hệ thống.' },
      result: { title: 'Kết quả', desc: 'Mục tiêu thiết kế: nhập một lần, duyệt theo luồng, báo cáo tự động.' },
    },
    existingTitle: 'Quy trình hiện tại',
    existingDesc: 'Năm nguồn dữ liệu, không nguồn nào kết nối được với nguồn còn lại.',
    solutionTitle: 'Giải pháp FLOWBASE',
    solutionDesc: 'Một thực thể trung tâm, mọi nghiệp vụ gắn vào đó.',
    shots: {
      dashboard: { title: 'Bảng điều khiển', desc: 'Tổng quan số giảng viên, hợp đồng và hồ sơ đang chờ duyệt.' },
      profile: { title: 'Hồ sơ giảng viên', desc: 'Một hồ sơ duy nhất chứa thông tin, hợp đồng và tài liệu đính kèm.' },
      assignment: { title: 'Phân công giảng dạy', desc: 'Phân công theo lớp và học kỳ, tự động cộng dồn số tiết.' },
      payment: { title: 'Thanh toán', desc: 'Tính thanh toán từ số tiết đã duyệt, xuất bảng đối soát ra Excel.' },
    },
  },
  technology: {
    eyebrow: '09 — Công nghệ',
    title: 'Xây dựng trên nền tảng công nghệ hiện đại.',
  },
  contact: {
    eyebrow: '10 — Liên hệ',
    title: 'Bạn có quy trình cần tối ưu?',
    lead: 'Gửi cho FLOWBASE quy trình hiện tại của bạn. Chúng tôi sẽ cùng bạn tìm cách biến nó thành phần mềm.',
    responseLabel: 'Phản hồi',
    responseValue: 'trong 1–2 ngày làm việc',
    noCommitment: 'Không cam kết ràng buộc. Chỉ là một cuộc trò chuyện mở.',
    form: {
      name: 'Họ và tên',
      namePlaceholder: 'Nguyễn Văn A',
      company: 'Công ty',
      companyPlaceholder: 'Tên công ty',
      emailPlaceholder: 'ban@congty.vn',
      message: 'Quy trình bạn muốn nâng cấp?',
      messagePlaceholder: 'Mô tả quy trình của bạn...',
      submitBtn: 'Gửi thông tin',
      sendingBtn: 'Đang gửi...',
      delivered: 'Tin nhắn đã được gửi thành công!',
      errorEmpty: 'Điền tên, email và mô tả quy trình để chúng tôi hiểu đúng vấn đề.',
    },
  },
  footer: {
    titleLine1: 'Từ bảng tính',
    titleLine2: 'đến phần mềm.',
    subtitle: 'Xây dựng quy trình tốt hơn. Kiến tạo phần mềm vượt trội.',
    siteLabel: 'ĐIỀU HƯỚNG',
    contactLabel: 'LIÊN HỆ',
    copyright: '© 2026 FLOWBASE',
    tagline: 'Từ bảng tính đến phần mềm.',
  },
};
