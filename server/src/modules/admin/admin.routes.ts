import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticate, authorize } from "../../middleware/auth";
const prisma = new PrismaClient();
const router = Router();

// Public user search (for chat)
router.get("/search", authenticate, async (req: any, res) => {
  const q = (req.query.q as string) || "";
  const users = await prisma.user.findMany({
    where: { name: { contains: q }, id: { not: req.user.id } },
    select: { id: true, name: true, email: true, role: true },
    take: 10,
  });
  res.json({ success: true, data: users });
});

router.use(authenticate);

router.get("/notifications", async (req: any, res) => {
  res.json({
    success: true,
    data: await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  });
});
router.patch("/notifications/:id/read", async (req: any, res) => {
  await prisma.notification.updateMany({
    where: { id: +req.params.id, userId: req.user.id },
    data: { isRead: true },
  });
  res.json({ success: true });
});
router.patch("/notifications/read-all", async (req: any, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  res.json({ success: true });
});

// Admin
router.get("/admin/users", authorize("ADMIN"), async (req, res) => {
  res.json({
    success: true,
    data: await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  });
});
router.patch(
  "/admin/users/:id/status",
  authorize("ADMIN"),
  async (req, res) => {
    await prisma.user.update({
      where: { id: +req.params.id },
      data: { status: req.body.status },
    });
    res.json({ success: true });
  },
);
router.get("/admin/stats", authorize("ADMIN"), async (_req, res) => {
  const [users, appointments, shops, partners] = await Promise.all([
    prisma.user.count(),
    prisma.appointment.count(),
    prisma.shop.count(),
    prisma.partnerRegistration.count({ where: { status: "pending" } }),
  ]);
  res.json({ success: true, data: { users, appointments, shops, partners } });
});

// Partner registrations management
router.get("/admin/partners", authorize("ADMIN"), async (_req, res) => {
  const data = await prisma.partnerRegistration.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ success: true, data });
});

router.patch(
  "/admin/partners/:id/approve",
  authorize("ADMIN"),
  async (req, res) => {
    const id = +req.params.id;
    const reg = await prisma.partnerRegistration.findUnique({ where: { id } });
    if (!reg)
      return res.status(404).json({ success: false, error: "Không tìm thấy" });

    // Kiểm tra email đã tồn tại trong users chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: reg.email },
    });

    if (!existingUser) {
      // Tạo tài khoản từ thông tin đăng ký
      // business_type "clinic" → role VET, còn lại → SHOP_OWNER
      const role = reg.businessType === "clinic" ? "VET" : "SHOP_OWNER";
      const hash = await bcrypt.hash("123456", 12);
      await prisma.user.create({
        data: {
          email: reg.email,
          phone: reg.phone,
          name: reg.ownerName,
          password: hash,
          role,
        },
      });
    }

    await prisma.partnerRegistration.update({
      where: { id },
      data: { status: "approved" },
    });

    res.json({
      success: true,
      message: existingUser
        ? "Đã duyệt (tài khoản đã tồn tại, không tạo mới)"
        : "Đã duyệt và tạo tài khoản SHOP_OWNER",
    });
  },
);

router.patch(
  "/admin/partners/:id/reject",
  authorize("ADMIN"),
  async (req, res) => {
    await prisma.partnerRegistration.update({
      where: { id: +req.params.id },
      data: { status: "rejected" },
    });
    res.json({ success: true });
  },
);

// Update partner registration
router.put("/admin/partners/:id", authorize("ADMIN"), async (req, res) => {
  const id = +req.params.id;
  const { shopName, ownerName, phone, email, address, businessType } = req.body;
  const reg = await prisma.partnerRegistration.findUnique({ where: { id } });
  if (!reg)
    return res.status(404).json({ success: false, error: "Không tìm thấy" });

  // Check trùng email (nếu đổi)
  if (email && email !== reg.email) {
    const dup = await prisma.partnerRegistration.findFirst({
      where: { email: email.toLowerCase().trim(), id: { not: id } },
    });
    if (dup)
      return res.status(409).json({
        success: false,
        error: "Email đã được sử dụng bởi đăng ký khác",
        field: "email",
      });
  }

  // Check trùng SĐT (nếu đổi)
  const cleanPhone = phone?.replace(/\s/g, "");
  if (cleanPhone && cleanPhone !== reg.phone) {
    const dup = await prisma.partnerRegistration.findFirst({
      where: { phone: cleanPhone, id: { not: id } },
    });
    if (dup)
      return res.status(409).json({
        success: false,
        error: "SĐT đã được sử dụng bởi đăng ký khác",
        field: "phone",
      });
  }

  const updated = await prisma.partnerRegistration.update({
    where: { id },
    data: {
      ...(shopName && { shopName }),
      ...(ownerName && { ownerName }),
      ...(cleanPhone && { phone: cleanPhone }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(address && { address }),
      ...(businessType && { businessType }),
    },
  });
  res.json({ success: true, data: updated });
});

// Delete partner registration
router.delete("/admin/partners/:id", authorize("ADMIN"), async (req, res) => {
  const id = +req.params.id;
  const reg = await prisma.partnerRegistration.findUnique({ where: { id } });
  if (!reg)
    return res.status(404).json({ success: false, error: "Không tìm thấy" });
  await prisma.partnerRegistration.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
