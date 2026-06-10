import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
const prisma = new PrismaClient();
const router = Router();
router.use(authenticate);

router.get("/", async (_req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      media: true,
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json({ success: true, data: posts });
});

router.post("/", upload.array("media", 5), async (req: any, res) => {
  const post = await prisma.post.create({
    data: { userId: req.user.id, content: req.body.content },
  });
  if (req.files && (req.files as Express.Multer.File[]).length > 0) {
    const mediaData = (req.files as Express.Multer.File[]).map((f) => ({
      postId: post.id,
      mediaUrl: `/uploads/${f.filename}`,
      mediaType: f.mimetype.startsWith("video") ? "video" : "image",
    }));
    await prisma.postMedia.createMany({ data: mediaData });
  }
  const created = await prisma.post.findUnique({
    where: { id: post.id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      media: true,
      _count: { select: { likes: true, comments: true } },
    },
  });
  res.status(201).json({ success: true, data: created });
});

router.delete("/:id", async (req: any, res) => {
  await prisma.post.deleteMany({
    where: { id: +req.params.id, userId: req.user.id },
  });
  res.json({ success: true });
});
router.post("/:id/like", async (req: any, res) => {
  try {
    await prisma.postLike.create({
      data: { postId: +req.params.id, userId: req.user.id },
    });
  } catch {}
  res.json({ success: true });
});
router.delete("/:id/like", async (req: any, res) => {
  await prisma.postLike.deleteMany({
    where: { postId: +req.params.id, userId: req.user.id },
  });
  res.json({ success: true });
});
router.get("/:id/comments", async (req, res) => {
  res.json({
    success: true,
    data: await prisma.postComment.findMany({
      where: { postId: +req.params.id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    }),
  });
});
router.post("/:id/comments", async (req: any, res) => {
  const c = await prisma.postComment.create({
    data: {
      postId: +req.params.id,
      userId: req.user.id,
      content: req.body.content,
    },
  });
  res.status(201).json({ success: true, data: c });
});
export default router;
