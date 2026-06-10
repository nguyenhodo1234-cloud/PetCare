import { Router } from "express";
import { PrismaClient } from "@prisma/client";
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
  const [users, appointments, shops] = await Promise.all([
    prisma.user.count(),
    prisma.appointment.count(),
    prisma.shop.count(),
  ]);
  res.json({ success: true, data: { users, appointments, shops } });
});
export default router;
