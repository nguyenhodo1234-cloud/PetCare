import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const hash = await bcrypt.hash("123456", 12);

  const users = [
    { name: "Admin", email: "admin@petecosystem.com", role: "ADMIN" as const },
    { name: "Nguyễn Văn An", email: "an@test.com", role: "PET_OWNER" as const },
    {
      name: "Trần Thị Mai",
      email: "mai@test.com",
      role: "SHOP_OWNER" as const,
    },
    { name: "Bác sĩ Lê Hùng", email: "hung@test.com", role: "VET" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hash },
      create: { ...u, phone: "0900000000", password: hash },
    });
  }

  console.log("✅ Đã tạo 4 tài khoản test:");
  console.log("   admin@petecosystem.com / 123456 (ADMIN)");
  console.log("   an@test.com / 123456 (PET_OWNER)");
  console.log("   mai@test.com / 123456 (SHOP_OWNER)");
  console.log("   hung@test.com / 123456 (VET)");

  // Seed services
  const existingServices = await prisma.service.count();
  if (existingServices > 0) {
    console.log(`⚠️  Đã có ${existingServices} dịch vụ, bỏ qua`);
  } else {
    const services = [
      // 1. Khám bệnh
      {
        name: "Khám tổng quát",
        category: "CONSULTATION",
        duration: 30,
        price: 150000,
      },
      {
        name: "Khám nội khoa",
        category: "CONSULTATION",
        duration: 30,
        price: 200000,
      },
      {
        name: "Khám ngoại khoa",
        category: "CONSULTATION",
        duration: 30,
        price: 200000,
      },
      {
        name: "Khám da liễu",
        category: "CONSULTATION",
        duration: 30,
        price: 180000,
      },
      {
        name: "Khám mắt",
        category: "CONSULTATION",
        duration: 25,
        price: 180000,
      },
      {
        name: "Khám tai mũi họng",
        category: "CONSULTATION",
        duration: 25,
        price: 180000,
      },
      {
        name: "Khám tim mạch",
        category: "CONSULTATION",
        duration: 40,
        price: 250000,
      },
      {
        name: "Khám tiêu hóa",
        category: "CONSULTATION",
        duration: 30,
        price: 200000,
      },
      {
        name: "Khám cơ xương khớp",
        category: "CONSULTATION",
        duration: 30,
        price: 200000,
      },

      // 2. Tiêm phòng - Chó
      {
        name: "Tiêm vaccine 5 bệnh (Chó)",
        category: "VACCINATION",
        duration: 15,
        price: 180000,
      },
      {
        name: "Tiêm vaccine 7 bệnh (Chó)",
        category: "VACCINATION",
        duration: 15,
        price: 250000,
      },
      {
        name: "Tiêm vaccine dại (Chó)",
        category: "VACCINATION",
        duration: 10,
        price: 120000,
      },
      // Tiêm phòng - Mèo
      {
        name: "Tiêm vaccine 3 bệnh (Mèo)",
        category: "VACCINATION",
        duration: 15,
        price: 180000,
      },
      {
        name: "Tiêm vaccine 4 bệnh (Mèo)",
        category: "VACCINATION",
        duration: 15,
        price: 250000,
      },
      {
        name: "Tiêm vaccine dại (Mèo)",
        category: "VACCINATION",
        duration: 10,
        price: 120000,
      },

      // 3. Xét nghiệm
      {
        name: "Xét nghiệm công thức máu (CBC)",
        category: "LAB_TEST",
        duration: 20,
        price: 200000,
      },
      {
        name: "Xét nghiệm sinh hóa máu",
        category: "LAB_TEST",
        duration: 30,
        price: 300000,
      },
      {
        name: "Xét nghiệm chức năng gan",
        category: "LAB_TEST",
        duration: 30,
        price: 280000,
      },
      {
        name: "Xét nghiệm chức năng thận",
        category: "LAB_TEST",
        duration: 30,
        price: 280000,
      },
      {
        name: "Xét nghiệm ký sinh trùng",
        category: "LAB_TEST",
        duration: 20,
        price: 150000,
      },
      {
        name: "Xét nghiệm Care/Parvo",
        category: "LAB_TEST",
        duration: 15,
        price: 250000,
      },
      {
        name: "Xét nghiệm FeLV/FIV (Mèo)",
        category: "LAB_TEST",
        duration: 15,
        price: 300000,
      },
      {
        name: "Xét nghiệm nước tiểu",
        category: "LAB_TEST",
        duration: 20,
        price: 150000,
      },
      {
        name: "Xét nghiệm phân",
        category: "LAB_TEST",
        duration: 20,
        price: 120000,
      },

      // 4. Chẩn đoán hình ảnh
      {
        name: "Chụp X-Quang",
        category: "IMAGING",
        duration: 20,
        price: 250000,
      },
      {
        name: "Siêu âm ổ bụng",
        category: "IMAGING",
        duration: 25,
        price: 300000,
      },
      {
        name: "Siêu âm thai",
        category: "IMAGING",
        duration: 25,
        price: 300000,
      },
      {
        name: "Điện tim (ECG)",
        category: "IMAGING",
        duration: 20,
        price: 350000,
      },
      { name: "Nội soi", category: "IMAGING", duration: 45, price: 800000 },

      // 5. Phẫu thuật
      {
        name: "Khâu vết thương",
        category: "SURGERY",
        duration: 45,
        price: 500000,
      },
      { name: "Cắt u bướu", category: "SURGERY", duration: 60, price: 1500000 },
      {
        name: "Triệt sản chó đực",
        category: "SURGERY",
        duration: 45,
        price: 800000,
      },
      {
        name: "Triệt sản chó cái",
        category: "SURGERY",
        duration: 60,
        price: 1200000,
      },
      {
        name: "Triệt sản mèo đực",
        category: "SURGERY",
        duration: 30,
        price: 600000,
      },
      {
        name: "Triệt sản mèo cái",
        category: "SURGERY",
        duration: 45,
        price: 1000000,
      },
      {
        name: "Phẫu thuật gãy xương",
        category: "SURGERY",
        duration: 90,
        price: 3000000,
      },
      {
        name: "Phẫu thuật cấp cứu",
        category: "SURGERY",
        duration: 90,
        price: 5000000,
      },

      // 6. Điều trị nội trú
      {
        name: "Nhập viện theo dõi (1 ngày)",
        category: "HOSPITALIZATION",
        duration: 1440,
        price: 300000,
      },
      {
        name: "Truyền dịch",
        category: "HOSPITALIZATION",
        duration: 60,
        price: 200000,
      },
      {
        name: "Chăm sóc hậu phẫu",
        category: "HOSPITALIZATION",
        duration: 1440,
        price: 400000,
      },
      {
        name: "Chăm sóc đặc biệt ICU (1 ngày)",
        category: "HOSPITALIZATION",
        duration: 1440,
        price: 800000,
      },

      // 7. Điều trị ngoại trú
      {
        name: "Tiêm thuốc",
        category: "OUTPATIENT",
        duration: 10,
        price: 50000,
      },
      {
        name: "Thay băng vết thương",
        category: "OUTPATIENT",
        duration: 15,
        price: 80000,
      },
      { name: "Tái khám", category: "OUTPATIENT", duration: 20, price: 100000 },

      // 8. Nha khoa
      { name: "Cạo vôi răng", category: "DENTAL", duration: 45, price: 500000 },
      { name: "Nhổ răng", category: "DENTAL", duration: 30, price: 300000 },
      {
        name: "Điều trị viêm nướu",
        category: "DENTAL",
        duration: 30,
        price: 350000,
      },

      // 9. Spa & Grooming
      {
        name: "Tắm thú cưng",
        category: "GROOMING",
        duration: 40,
        price: 150000,
      },
      {
        name: "Cắt tỉa lông",
        category: "GROOMING",
        duration: 60,
        price: 200000,
      },
      { name: "Vệ sinh tai", category: "GROOMING", duration: 15, price: 60000 },
      { name: "Cắt móng", category: "GROOMING", duration: 15, price: 50000 },
      {
        name: "Vắt tuyến hôi",
        category: "GROOMING",
        duration: 10,
        price: 50000,
      },

      // 10. Ký sinh trùng
      {
        name: "Tẩy giun",
        category: "PARASITE_CONTROL",
        duration: 10,
        price: 80000,
      },
      {
        name: "Trị ve rận",
        category: "PARASITE_CONTROL",
        duration: 30,
        price: 150000,
      },
      {
        name: "Trị ghẻ Demodex",
        category: "PARASITE_CONTROL",
        duration: 30,
        price: 200000,
      },

      // 11. Sinh sản
      {
        name: "Tư vấn phối giống",
        category: "REPRODUCTION",
        duration: 30,
        price: 200000,
      },
      {
        name: "Siêu âm thai",
        category: "REPRODUCTION",
        duration: 25,
        price: 300000,
      },
      {
        name: "Chăm sóc thai kỳ",
        category: "REPRODUCTION",
        duration: 30,
        price: 250000,
      },

      // 12. Khách sạn
      {
        name: "Gửi thú cưng theo ngày",
        category: "PET_HOTEL",
        duration: 1440,
        price: 200000,
      },
      {
        name: "Gửi thú cưng qua đêm",
        category: "PET_HOTEL",
        duration: 720,
        price: 150000,
      },

      // 13. Cấp cứu
      {
        name: "Cấp cứu tai nạn",
        category: "EMERGENCY",
        duration: 60,
        price: 500000,
      },
      {
        name: "Cấp cứu ngộ độc",
        category: "EMERGENCY",
        duration: 60,
        price: 500000,
      },
      {
        name: "Cấp cứu khó thở",
        category: "EMERGENCY",
        duration: 30,
        price: 400000,
      },

      // 14. Dịch vụ tại nhà
      {
        name: "Khám tại nhà",
        category: "HOME_VISIT",
        duration: 60,
        price: 350000,
      },
      {
        name: "Tiêm phòng tại nhà",
        category: "HOME_VISIT",
        duration: 30,
        price: 250000,
      },
    ];

    for (const s of services) {
      await prisma.service.create({
        data: {
          name: s.name,
          price: s.price,
          duration: s.duration,
          providerType: "HOSPITAL",
        },
      });
    }
    console.log(`✅ Đã tạo ${services.length} dịch vụ thú y`);
  }

  await prisma.$disconnect();
}

seed();
