import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticate, authorize } from "../../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// Public: danh sách hospitals + approved partners (clinic)
router.get("/", async (_req, res) => {
  const [hospitals, partners] = await Promise.all([
    prisma.hospital.findMany({
      where: { status: "ACTIVE" },
      include: { services: true, veterinarians: true },
    }),
    prisma.partnerRegistration.findMany({
      where: { businessType: "clinic", status: "approved" },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  res.json({ success: true, data: { hospitals, partners } });
});

router.use(authenticate);

// Hospital CRUD (HOSPITAL_STAFF + ADMIN) — phải đặt trước /:id
router.get(
  "/me",
  authorize("HOSPITAL_STAFF", "ADMIN"),
  async (req: any, res) => {
    const hospital = await prisma.hospital.findFirst({
      where: { ownerId: req.user.id },
      include: {
        veterinarians: { orderBy: { createdAt: "desc" } },
        services: true,
      },
    });
    if (!hospital)
      return res.status(404).json({ success: false, error: "Không tìm thấy" });
    res.json({ success: true, data: hospital });
  },
);

router.patch(
  "/me",
  authorize("HOSPITAL_STAFF", "ADMIN"),
  async (req: any, res) => {
    const hospital = await prisma.hospital.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!hospital)
      return res.status(404).json({ success: false, error: "Không tìm thấy" });
    const updated = await prisma.hospital.update({
      where: { id: hospital.id },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  },
);

// Chi tiết hospital (phải sau /me)
router.get("/:id", async (req, res) => {
  const h = await prisma.hospital.findUnique({
    where: { id: +req.params.id },
    include: { services: true, veterinarians: true },
  });
  if (!h) return res.status(404).json({ error: "Không tìm thấy" });
  res.json({ success: true, data: h });
});

// Doctor management
router.get(
  "/me/doctors",
  authorize("HOSPITAL_STAFF", "ADMIN"),
  async (req: any, res) => {
    const hospital = await prisma.hospital.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!hospital)
      return res.status(404).json({ success: false, error: "Không tìm thấy" });
    const { search, status } = req.query;
    const where: any = { hospitalId: hospital.id };
    if (status && status !== "ALL") where.status = status;
    if (search)
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { specialty: { contains: search } },
        { licenseNumber: { contains: search } },
      ];
    res.json({
      success: true,
      data: await prisma.veterinarian.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
    });
  },
);

router.post(
  "/me/doctors",
  authorize("HOSPITAL_STAFF", "ADMIN"),
  async (req: any, res) => {
    const hospital = await prisma.hospital.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!hospital)
      return res.status(404).json({ success: false, error: "Không tìm thấy" });
    const { name, email, phone, specialty, experience, licenseNumber } =
      req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, error: "Tên bác sĩ là bắt buộc" });
    if (email) {
      if (await prisma.veterinarian.findFirst({ where: { email } }))
        return res
          .status(409)
          .json({ success: false, error: "Email đã tồn tại", field: "email" });
      if (await prisma.user.findUnique({ where: { email } }))
        return res.status(409).json({
          success: false,
          error: "Email đã được sử dụng",
          field: "email",
        });
    }
    if (
      licenseNumber &&
      (await prisma.veterinarian.findFirst({ where: { licenseNumber } }))
    )
      return res.status(409).json({
        success: false,
        error: "Số giấy phép đã tồn tại",
        field: "licenseNumber",
      });

    let userId: number | null = null;
    if (email) {
      const hash = await bcrypt.hash("123456", 12);
      const u = await prisma.user.create({
        data: { email, phone, name, password: hash, role: "VET" },
      });
      userId = u.id;
    }
    const doctor = await prisma.veterinarian.create({
      data: {
        hospitalId: hospital.id,
        userId,
        name,
        email,
        phone,
        specialty,
        experience: experience ? +experience : null,
        licenseNumber,
      },
    });
    res.status(201).json({ success: true, data: doctor });
  },
);

router.patch(
  "/me/doctors/:id",
  authorize("HOSPITAL_STAFF", "ADMIN"),
  async (req: any, res) => {
    const hospital = await prisma.hospital.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!hospital)
      return res.status(404).json({ success: false, error: "Không tìm thấy" });
    const doctor = await prisma.veterinarian.findFirst({
      where: { id: +req.params.id, hospitalId: hospital.id },
    });
    if (!doctor)
      return res.status(403).json({ success: false, error: "Không có quyền" });
    const updated = await prisma.veterinarian.update({
      where: { id: doctor.id },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  },
);

router.delete(
  "/me/doctors/:id",
  authorize("HOSPITAL_STAFF", "ADMIN"),
  async (req: any, res) => {
    const hospital = await prisma.hospital.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!hospital)
      return res.status(404).json({ success: false, error: "Không tìm thấy" });
    const doctor = await prisma.veterinarian.findFirst({
      where: { id: +req.params.id, hospitalId: hospital.id },
    });
    if (!doctor)
      return res.status(403).json({ success: false, error: "Không có quyền" });
    await prisma.veterinarian.update({
      where: { id: doctor.id },
      data: { status: "INACTIVE" },
    });
    res.json({ success: true });
  },
);

export default router;
