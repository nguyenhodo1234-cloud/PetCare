import express from "express";
import cors from "cors";
import { setupSocket } from "./socket/index";
import authRoutes from "./modules/auth/auth.routes";
import petRoutes from "./modules/pets/pet.routes";
import shopRoutes from "./modules/shops/shop.routes";
import hospitalRoutes from "./modules/hospitals/hospital.routes";
import serviceRoutes from "./modules/services/service.routes";
import appointmentRoutes from "./modules/appointments/appointment.routes";
import socialRoutes from "./modules/social/social.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import adminRoutes from "./modules/admin/admin.routes";
import chatRoutes from "./modules/chat/chat.routes";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("server/uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/posts", socialRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/conversations", chatRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", adminRoutes);

const httpServer = setupSocket(app);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
