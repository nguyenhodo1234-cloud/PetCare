import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";

const prisma = new PrismaClient();
const router = Router();
router.use(authenticate, authorize("VET"));

// VET Dashboard stats
router.get("/dashboard", async (req: any, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const where = {
    vetId: req.user.id,
    dateTime: { gte: today, lt: tomorrow },
  };

  const [total, waiting, inProgress, completed] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.count({ where: { ...where, status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.appointment.count({ where: { ...where, status: "COMPLETED" } }),
  ]);

  // Lấy danh sách lịch hôm nay
  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      pet: { select: { id: true, name: true, species: true, avatar: true } },
      service: { select: { id: true, name: true } },
      history: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { dateTime: "asc" },
  });

  // Lấy thông tin user đặt lịch
  const userIds = [...new Set(appointments.map((a) => a.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, phone: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const data = appointments.map((a) => ({
    ...a,
    customer: userMap[a.userId] || null,
  }));

  res.json({
    success: true,
    data: {
      stats: { total, waiting, inProgress, completed },
      appointments: data,
      today: today.toISOString(),
    },
  });
});

// Danh sách lịch khám theo ngày
router.get("/appointments", async (req: any, res) => {
  const { date, status } = req.query;
  const targetDate = date ? new Date(date as string) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const where: any = {
    vetId: req.user.id,
    dateTime: { gte: targetDate, lt: nextDay },
  };
  if (status && status !== "ALL") where.status = status;

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      pet: { select: { id: true, name: true, species: true, avatar: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { dateTime: "asc" },
  });

  const userIds = [...new Set(appointments.map((a) => a.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, phone: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  res.json({
    success: true,
    data: appointments.map((a) => ({
      ...a,
      customer: userMap[a.userId] || null,
    })),
  });
});

// Chi tiết lịch khám
router.get("/appointments/:id", async (req: any, res) => {
  const a = await prisma.appointment.findFirst({
    where: { id: +req.params.id, vetId: req.user.id },
    include: {
      pet: true,
      service: true,
      history: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!a)
    return res.status(404).json({ success: false, error: "Không tìm thấy" });

  const customer = await prisma.user.findUnique({
    where: { id: a.userId },
    select: { id: true, name: true, phone: true, email: true },
  });

  // Lấy medical records của pet
  const records = await prisma.medicalRecord.findMany({
    where: { petId: a.petId },
    include: { files: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  res.json({
    success: true,
    data: { ...a, customer, medicalRecords: records },
  });
});

// Xác nhận lịch (PENDING → CONFIRMED)
router.patch("/appointments/:id/confirm", async (req: any, res) => {
  const a = await prisma.appointment.findFirst({
    where: { id: +req.params.id, vetId: req.user.id },
  });
  if (!a)
    return res.status(404).json({ success: false, error: "Không tìm thấy" });
  if (a.status !== "PENDING")
    return res
      .status(400)
      .json({ success: false, error: "Trạng thái không hợp lệ" });

  await prisma.appointment.update({
    where: { id: a.id },
    data: { status: "CONFIRMED" },
  });
  await prisma.appointmentHistory.create({
    data: {
      appointmentId: a.id,
      status: "CONFIRMED",
      changedBy: req.user.id,
      notes: "Bác sĩ xác nhận lịch",
    },
  });
  res.json({ success: true });
});

// Bắt đầu khám
router.post("/appointments/:id/start", async (req: any, res) => {
  const a = await prisma.appointment.findFirst({
    where: { id: +req.params.id, vetId: req.user.id },
  });
  if (!a)
    return res.status(404).json({ success: false, error: "Không tìm thấy" });
  if (a.status !== "CONFIRMED")
    return res
      .status(400)
      .json({ success: false, error: "Trạng thái không hợp lệ" });

  await prisma.appointment.update({
    where: { id: a.id },
    data: { status: "IN_PROGRESS" },
  });
  await prisma.appointmentHistory.create({
    data: {
      appointmentId: a.id,
      status: "IN_PROGRESS",
      changedBy: req.user.id,
      notes: "Bắt đầu khám",
    },
  });
  res.json({ success: true });
});

// Hoàn thành khám
router.post("/appointments/:id/complete", async (req: any, res) => {
  const { diagnosis, treatment, notes } = req.body;
  const a = await prisma.appointment.findFirst({
    where: { id: +req.params.id, vetId: req.user.id },
  });
  if (!a)
    return res.status(404).json({ success: false, error: "Không tìm thấy" });

  await prisma.appointment.update({
    where: { id: a.id },
    data: { status: "COMPLETED", notes: notes || a.notes },
  });
  await prisma.appointmentHistory.create({
    data: {
      appointmentId: a.id,
      status: "COMPLETED",
      changedBy: req.user.id,
      notes: "Hoàn thành khám",
    },
  });

  // Tạo medical record
  await prisma.medicalRecord.create({
    data: {
      petId: a.petId,
      vetId: req.user.id,
      diagnosis,
      treatment,
      notes,
      recordDate: new Date(),
    },
  });

  res.json({ success: true });
});

export default router;
