import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';
const prisma = new PrismaClient(); const router = Router(); router.use(authenticate);

router.get('/', async (req: any, res) => {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: req.user.id }, { user2Id: req.user.id }] },
    include: { user1: { select: { id: true, name: true } }, user2: { select: { id: true, name: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: convs });
});
router.post('/', async (req: any, res) => {
  const existing = await prisma.conversation.findFirst({ where: { OR: [{ user1Id: req.user.id, user2Id: req.body.userId }, { user1Id: req.body.userId, user2Id: req.user.id }] } });
  if (existing) return res.json({ success: true, data: existing });
  res.status(201).json({ success: true, data: await prisma.conversation.create({ data: { user1Id: req.user.id, user2Id: req.body.userId } }) });
});
router.get('/:id/messages', async (req, res) => {
  res.json({ success: true, data: await prisma.message.findMany({ where: { conversationId: +req.params.id }, include: { sender: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' }, take: 50 }) });
});
router.post('/:id/messages', async (req: any, res) => {
  const m = await prisma.message.create({ data: { conversationId: +req.params.id, senderId: req.user.id, message: req.body.message }, include: { sender: { select: { id: true, name: true } } } });
  res.status(201).json({ success: true, data: m });
});
export default router;
