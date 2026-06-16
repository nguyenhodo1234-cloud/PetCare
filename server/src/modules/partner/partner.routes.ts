import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { upload } from "../../middleware/upload";

const prisma = new PrismaClient();
const router = Router();

const partnerUpload = upload.fields([
  { name: "businessLicense", maxCount: 1 },
  { name: "vetCertificate", maxCount: 1 },
]);

router.post("/register", partnerUpload, async (req: any, res) => {
  try {
    const { businessType, shopName, ownerName, phone, email, address } =
      req.body;
    const files = req.files as
      | { [key: string]: Express.Multer.File[] }
      | undefined;

    if (
      !businessType ||
      !shopName ||
      !ownerName ||
      !phone ||
      !email ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Vui lòng điền đầy đủ thông tin" });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Email không hợp lệ" });
    }

    // Validate phone Vietnam
    const cleanPhone = phone.replace(/\s/g, "");
    const phoneRegex =
      /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res
        .status(400)
        .json({ success: false, error: "Số điện thoại không hợp lệ" });
    }

    // Check trùng email
    const emailExists = await prisma.partnerRegistration.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
    if (emailExists) {
      const statusText =
        emailExists.status === "approved"
          ? "đã được duyệt"
          : emailExists.status === "pending"
            ? "đang chờ duyệt"
            : "đã bị từ chối";
      return res.status(409).json({
        success: false,
        error: `Email này đã được đăng ký (${statusText}). Vui lòng dùng email khác.`,
        field: "email",
      });
    }

    // Check trùng SĐT
    const phoneExists = await prisma.partnerRegistration.findFirst({
      where: { phone: cleanPhone },
    });
    if (phoneExists) {
      const statusText =
        phoneExists.status === "approved"
          ? "đã được duyệt"
          : phoneExists.status === "pending"
            ? "đang chờ duyệt"
            : "đã bị từ chối";
      return res.status(409).json({
        success: false,
        error: `Số điện thoại này đã được đăng ký (${statusText}). Vui lòng dùng SĐT khác.`,
        field: "phone",
      });
    }

    const businessLicense = files?.businessLicense?.[0]?.filename
      ? `/uploads/${files.businessLicense[0].filename}`
      : null;
    const vetCertificate = files?.vetCertificate?.[0]?.filename
      ? `/uploads/${files.vetCertificate[0].filename}`
      : null;

    const partner = await prisma.partnerRegistration.create({
      data: {
        businessType,
        shopName,
        ownerName,
        phone,
        email,
        address,
        businessLicense,
        vetCertificate,
      },
    });

    res.status(201).json({ success: true, data: partner });
  } catch (err: any) {
    console.error("Partner register error:", err);
    res
      .status(500)
      .json({ success: false, error: "Lỗi server, vui lòng thử lại" });
  }
});

export default router;
