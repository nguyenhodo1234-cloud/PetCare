import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../../middleware/auth';
const prisma = new PrismaClient(); const router = Router();

router.get('/', async (req, res) => {
  const { provider_type, provider_id } = req.query;
  const where: any = {};
  if (provider_type) where.providerType = provider_type as string;
  if (provider_id) where[provider_type === 'SHOP' ? 'shopId' : 'hospitalId'] = +provider_id;
  res.json({ success: true, data: await prisma.service.findMany({ where, include: { images: true } }) });
});
router.post('/', authenticate, authorize('SHOP_OWNER', 'VET', 'ADMIN'), async (req: any, res) => {
  res.status(201).json({ success: true, data: await prisma.service.create({ data: req.body }) });
});
router.get('/:id', async (req, res) => {
  const s = await prisma.service.findUnique({ where: { id: +req.params.id }, include: { images: true } });
  res.json({ success: true, data: s });
});
router.put('/:id', authenticate, async (req: any, res) => {
  await prisma.service.update({ where: { id: +req.params.id }, data: req.body });
  res.json({ success: true });
});
router.delete('/:id', authenticate, async (req: any, res) => {
  await prisma.service.delete({ where: { id: +req.params.id } });
  res.json({ success: true });
});
export default router;
