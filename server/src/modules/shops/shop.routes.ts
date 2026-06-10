import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../../middleware/auth';
const prisma = new PrismaClient(); const router = Router();

router.get('/', async (req, res) => {
  const shops = await prisma.shop.findMany({ where: { status: 'ACTIVE' }, include: { services: true }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: shops });
});
router.post('/', authenticate, authorize('SHOP_OWNER', 'ADMIN'), async (req: any, res) => {
  const shop = await prisma.shop.create({ data: { ...req.body, ownerId: req.user.id } });
  res.status(201).json({ success: true, data: shop });
});
router.get('/:id', async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: +req.params.id }, include: { services: true, staffs: true } });
  if (!shop) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ success: true, data: shop });
});
router.put('/:id', authenticate, async (req: any, res) => {
  await prisma.shop.updateMany({ where: { id: +req.params.id, ownerId: req.user.id }, data: req.body });
  res.json({ success: true });
});
router.get('/:id/staff', authenticate, async (req: any, res) => {
  res.json({ success: true, data: await prisma.shopStaff.findMany({ where: { shopId: +req.params.id } }) });
});
router.post('/:id/staff', authenticate, async (req: any, res) => {
  await prisma.shopStaff.create({ data: { shopId: +req.params.id, userId: req.body.userId } });
  res.status(201).json({ success: true });
});
export default router;
