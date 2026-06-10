import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt";
import { authenticate } from "../../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Thiếu thông tin" });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email đã tồn tại" });
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hash, role: role || "PET_OWNER" },
      select: { id: true, name: true, email: true, role: true },
    });
    const access = signAccess({ id: user.id, role: user.role });
    const refresh = signRefresh({ id: user.id });
    await prisma.refreshToken.create({
      data: {
        token: refresh,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    res
      .status(201)
      .json({
        success: true,
        user,
        access_token: access,
        refresh_token: refresh,
      });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    if (user.status === "BANNED")
      return res.status(403).json({ error: "Tài khoản bị khóa" });
    const access = signAccess({ id: user.id, role: user.role });
    const refresh = signRefresh({ id: user.id });
    await prisma.refreshToken.create({
      data: {
        token: refresh,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      access_token: access,
      refresh_token: refresh,
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Refresh token
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token)
      return res.status(400).json({ error: "Thiếu refresh token" });
    const payload = verifyRefresh(refresh_token) as { id: number };
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refresh_token },
    });
    if (!stored) return res.status(401).json({ error: "Token không hợp lệ" });
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true },
    });
    if (!user) return res.status(401).json({ error: "User không tồn tại" });
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const access = signAccess({ id: user.id, role: user.role });
    const refresh = signRefresh({ id: user.id });
    await prisma.refreshToken.create({
      data: {
        token: refresh,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    res.json({ access_token: access, refresh_token: refresh });
  } catch {
    res.status(401).json({ error: "Token không hợp lệ" });
  }
});

// Forgot password
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "Email không tồn tại" });
  // In production: send email with reset link
  res.json({ success: true, message: "Link đặt lại mật khẩu đã được gửi!" });
});

// Get me
router.get("/me", authenticate, async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  res.json({ success: true, data: user });
});

export default router;
