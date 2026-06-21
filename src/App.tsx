import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "./store";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OwnerDashboard from "./pages/owner/Dashboard";
import MyPets from "./pages/owner/MyPets";
import PetDetail from "./pages/owner/PetDetail";
import AddPet from "./pages/owner/AddPet";
import ShopsPage from "./pages/owner/ShopsPage";
import HospitalsPage from "./pages/owner/HospitalsPage";
import AppointmentsPage from "./pages/owner/AppointmentsPage";
import NotificationsPage from "./pages/owner/NotificationsPage";
import ProfilePage from "./pages/owner/ProfilePage";
import FeedPage from "./pages/social/FeedPage";
import ChatPage from "./pages/chat/ChatPage";
import PartnerRegisterPage from "./pages/partner/PartnerRegisterPage";
import VetDashboard from "./pages/vet/VetDashboard";
import AdminDashboard from "./pages/admin/Dashboard";

function HomePage() {
  return (
    <div className="min-h-screen bg-warm flex items-center justify-center font-body">
      <div className="text-center px-4">
        <h1 className="font-display text-5xl font-extrabold text-text mb-4">
          🐾 Pet<span className="text-brand">Ecosystem</span>
        </h1>
        <p className="text-muted text-lg mb-8">
          Hệ sinh thái thú cưng toàn diện
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/login" className="btn-brand text-lg">
            Đăng nhập
          </a>
          <a href="/register" className="btn-outline text-lg">
            Đăng ký
          </a>
          <a
            href="/partner-register"
            className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-200 hover:opacity-90"
            style={{ background: "#0E9F6E" }}
          >
            🤝 Đăng ký đối tác
          </a>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { icon: "🏥", title: "Bệnh viện", desc: "Đặt lịch khám" },
            { icon: "🛍️", title: "Cửa hàng", desc: "Spa, grooming" },
            { icon: "💬", title: "Mạng xã hội", desc: "Kết nối cộng đồng" },
            {
              icon: "🤝",
              title: "Đối tác",
              desc: "Đăng ký kinh doanh",
              href: "/partner-register",
            },
          ].map((f, i) =>
            f.href ? (
              <a
                key={i}
                href={f.href}
                className="card p-6 text-center hover:border-green-500/50 transition-colors"
              >
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-display font-bold text-text mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </a>
            ) : (
              <div key={i} className="card p-6 text-center">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-display font-bold text-text mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/my-pets" element={<MyPets />} />
          <Route path="/my-pets/new" element={<AddPet />} />
          <Route path="/my-pets/:id" element={<PetDetail />} />
          <Route path="/shops" element={<ShopsPage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/partner-register" element={<PartnerRegisterPage />} />
          <Route path="/vet" element={<VetDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
