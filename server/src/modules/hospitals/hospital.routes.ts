import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
  const [hospitals, partners] = await Promise.all([
    prisma.hospital.findMany({
      where: { status: "ACTIVE" },
      include: { services: true, veterinarians: true },
    }),
    prisma.partnerRegistration.findMany({ where: { status: "approved" } }),
  ]);
  res.json({ success: true, data: { hospitals, partners } });
});
router.post("/", authenticate, authorize("VET", "ADMIN"), async (req, res) => {
  res
    .status(201)
    .json({
      success: true,
      data: await prisma.hospital.create({ data: req.body }),
    });
});
router.get("/:id", async (req, res) => {
  const h = await prisma.hospital.findUnique({
    where: { id: +req.params.id },
    include: { services: true, veterinarians: true },
  });
  if (!h) return res.status(404).json({ error: "Không tìm thấy" });
  res.json({ success: true, data: h });
});
router.put("/:id", authenticate, async (req: any, res) => {
  await prisma.hospital.updateMany({
    where: { id: +req.params.id },
    data: req.body,
  });
  res.json({ success: true });
});
router.get("/:id/vets", async (req, res) => {
  res.json({
    success: true,
    data: await prisma.veterinarian.findMany({
      where: { hospitalId: +req.params.id },
    }),
  });
});
router.post("/:id/vets", authenticate, async (req: any, res) => {
  res
    .status(201)
    .json({
      success: true,
      data: await prisma.veterinarian.create({
        data: { hospitalId: +req.params.id, ...req.body },
      }),
    });
});
export default router;
