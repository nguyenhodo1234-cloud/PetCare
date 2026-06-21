import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
const prisma = new PrismaClient();
const router = Router();
router.use(authenticate);

router.post("/", async (req: any, res) => {
  const a = await prisma.appointment.create({
    data: {
      ...req.body,
      userId: req.user.id,
      dateTime: new Date(req.body.dateTime),
    },
  });
  await prisma.appointmentHistory.create({
    data: { appointmentId: a.id, status: "PENDING", changedBy: req.user.id },
  });
  res.status(201).json({ success: true, data: a });
});
router.get("/", async (req: any, res) => {
  const where: any = { userId: req.user.id };
  if (req.query.status) where.status = req.query.status;
  const data = await prisma.appointment.findMany({
    where,
    include: {
      pet: true,
      service: true,
      vet: { select: { id: true, name: true } },
    },
    orderBy: { dateTime: "desc" },
  });
  res.json({ success: true, data });
});
router.get("/:id", async (req: any, res) => {
  const a = await prisma.appointment.findFirst({
    where: { id: +req.params.id, userId: req.user.id },
    include: { pet: true, service: true, history: true },
  });
  res.json({ success: true, data: a });
});
router.patch("/:id/status", async (req: any, res) => {
  const { status, notes } = req.body;
  await prisma.appointment.update({
    where: { id: +req.params.id },
    data: { status },
  });
  await prisma.appointmentHistory.create({
    data: {
      appointmentId: +req.params.id,
      status,
      notes,
      changedBy: req.user.id,
    },
  });
  res.json({ success: true });
});
export default router;
