import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';
const prisma = new PrismaClient(); const router = Router(); router.use(authenticate);

router.get('/', async (req: any, res) => {
  const pets = await prisma.pet.findMany({ where: { ownerId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: pets });
});
router.post('/', async (req: any, res) => {
  const { name, species, breed, birthDate, weight, notes } = req.body;
  const pet = await prisma.pet.create({ data: { ownerId: req.user.id, name, species, breed, birthDate: birthDate ? new Date(birthDate) : null, weight, notes } });
  res.status(201).json({ success: true, data: pet });
});
router.get('/:id', async (req: any, res) => {
  const pet = await prisma.pet.findFirst({ where: { id: +req.params.id, ownerId: req.user.id }, include: { vaccinations: true, medicalRecords: { include: { files: true } }, appointments: { include: { service: true } } } });
  if (!pet) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ success: true, data: pet });
});
router.put('/:id', async (req: any, res) => {
  await prisma.pet.updateMany({ where: { id: +req.params.id, ownerId: req.user.id }, data: req.body });
  res.json({ success: true });
});
router.delete('/:id', async (req: any, res) => {
  await prisma.pet.deleteMany({ where: { id: +req.params.id, ownerId: req.user.id } });
  res.json({ success: true });
});
router.get('/:id/vaccinations', async (req: any, res) => {
  res.json({ success: true, data: await prisma.vaccination.findMany({ where: { petId: +req.params.id }, orderBy: { dateGiven: 'desc' } }) });
});
router.post('/:id/vaccinations', async (req: any, res) => {
  const v = await prisma.vaccination.create({ data: { petId: +req.params.id, ...req.body, dateGiven: new Date(req.body.dateGiven), nextDueDate: req.body.nextDueDate ? new Date(req.body.nextDueDate) : null } });
  res.status(201).json({ success: true, data: v });
});
router.get('/:id/medical-records', async (req: any, res) => {
  res.json({ success: true, data: await prisma.medicalRecord.findMany({ where: { petId: +req.params.id }, include: { files: true }, orderBy: { recordDate: 'desc' } }) });
});
router.post('/:id/medical-records', async (req: any, res) => {
  const r = await prisma.medicalRecord.create({ data: { petId: +req.params.id, vetId: req.user.id, ...req.body } });
  res.status(201).json({ success: true, data: r });
});
export default router;
