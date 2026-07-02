import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
import { upload } from "../../middleware/upload";

const prisma = new PrismaClient();
const router = Router();
router.use(authenticate);

// Dashboard stats + list
router.get("/", async (req: any, res) => {
  const { search, status, page = "1", limit = "20" } = req.query;
  const where: any = {};

  if (status && status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { pet: { name: { contains: search } } },
      { diagnosis: { contains: search } },
      { notes: { contains: search } },
    ];
  }

  const skip = (+page - 1) * +limit;
  const [records, total, treating, followUp, completed] = await Promise.all([
    prisma.medicalRecord.findMany({
      where,
      include: {
        pet: { select: { id: true, name: true, species: true, breed: true } },
        files: true,
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: +limit,
    }),
    prisma.medicalRecord.count({ where }),
    prisma.medicalRecord.count({ where: { status: { in: ["DIAGNOSING", "TREATING"] } } }),
    prisma.medicalRecord.count({ where: { status: "FOLLOW_UP" } }),
    prisma.medicalRecord.count({ where: { status: "COMPLETED" } }),
  ]);

  // Lấy tên bác sĩ và chủ nuôi
  const vetIds = [...new Set(records.map((r) => r.vetId).filter(Boolean))];
  const vets = await prisma.user.findMany({ where: { id: { in: vetIds as number[] } }, select: { id: true, name: true } });
  const vetMap = Object.fromEntries(vets.map((v) => [v.id, v]));

  const data = records.map((r) => ({
    ...r,
    vet: r.vetId ? vetMap[r.vetId] : null,
  }));

  res.json({ success: true, data: { records: data, stats: { total, treating, followUp, completed }, total, page: +page } });
});

// Detail
router.get("/:id", async (req: any, res) => {
  const record = await prisma.medicalRecord.findUnique({
    where: { id: +req.params.id },
    include: {
      pet: {
        select: { id: true, name: true, species: true, breed: true, birthDate: true, weight: true },
      },
      files: true,
    },
  });
  if (!record) return res.status(404).json({ success: false, error: "Không tìm thấy" });

  const vet = record.vetId ? await prisma.user.findUnique({ where: { id: record.vetId }, select: { id: true, name: true } }) : null;
  const pet = record.pet;
  const owner = await prisma.user.findUnique({ where: { id: (pet as any).ownerId }, select: { id: true, name: true, phone: true, email: true } });

  res.json({ success: true, data: { ...record, vet, owner } });
});

// Create (VET only)
router.post("/", authorize("VET", "HOSPITAL_STAFF", "ADMIN"), async (req: any, res) => {
  const { petId, diagnosis, treatment, notes, symptoms, cause, conclusion, status, hospitalId } = req.body;
  if (!petId) return res.status(400).json({ success: false, error: "Thiếu thú cưng" });

  const record = await prisma.medicalRecord.create({
    data: {
      petId: +petId,
      vetId: req.user.id,
      hospitalId: hospitalId ? +hospitalId : null,
      diagnosis, treatment, notes, symptoms, cause, conclusion,
      status: status || "NEW",
      recordDate: new Date(),
    },
  });
  res.status(201).json({ success: true, data: record });
});

// Update
router.patch("/:id", authorize("VET", "HOSPITAL_STAFF", "ADMIN"), async (req: any, res) => {
  const record = await prisma.medicalRecord.findUnique({ where: { id: +req.params.id } });
  if (!record) return res.status(404).json({ success: false, error: "Không tìm thấy" });

  const updated = await prisma.medicalRecord.update({
    where: { id: +req.params.id },
    data: req.body,
  });
  res.json({ success: true, data: updated });
});

// Upload file
router.post("/:id/files", upload.single("file"), async (req: any, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "Thiếu file" });
  const file = await prisma.medicalFile.create({
    data: {
      recordId: +req.params.id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
    },
  });
  res.status(201).json({ success: true, data: file });
});

export default router;
