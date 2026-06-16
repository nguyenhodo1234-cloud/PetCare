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
  await prisma.$disconnect();
}

seed();
