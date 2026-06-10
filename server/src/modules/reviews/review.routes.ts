import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';
const prisma = new PrismaClient(); const router = Router(); router.use(authenticate);

router.post('/', async (req: any, res) => {
  const r = await prisma.review.create({ data: { ...req.body, userId: req.user.id } });
  res.status(201).json({ success: true, data: r });
});
router.get('/', async (req, res) => {
  const { provider_type, provider_id } = req.query;
  res.json({ success: true, data: await prisma.review.findMany({ where: { providerType: provider_type as string, providerId: +(provider_id as string) }, include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } }) });
});
export default router;
