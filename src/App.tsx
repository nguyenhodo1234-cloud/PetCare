import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import { PawPrint, LogIn, UserPlus, Stethoscope, Store } from "lucide-react";
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
import HospitalManage from "./pages/vet/HospitalManage";
import MedicalRecordsPage from "./pages/vet/MedicalRecordsPage";
import AdminDashboard from "./pages/admin/Dashboard";

function HomePage() {
  const cards = [
    {
      icon: LogIn,
      title: "Đăng nhập",
      desc: "Tiếp tục hành trình cùng thú cưng của bạn",
      href: "/login",
      color: "bg-[#256F63]/10 text-[#256F63]",
      primary: true,
    },
    {
      icon: UserPlus,
      title: "Đăng ký Chủ nuôi",
      desc: "Tạo hồ sơ cho bạn và các bé yêu",
      href: "/register",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Stethoscope,
      title: "Đăng ký Phòng khám",
      desc: "Quản lý bệnh viện và đội ngũ bác sĩ",
      href: "/partner-register",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Store,
      title: "Đăng ký Cửa hàng",
      desc: "Kết nối khách hàng yêu thú cưng gần bạn",
      href: "/partner-register",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EE] font-body flex flex-col lg:flex-row">
      <div className="lg:w-[45%] bg-[#256F63] text-white flex flex-col justify-center p-8 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white" />
          <div className="absolute bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <PawPrint size={22} className="text-white" />
            </div>
            <span className="text-2xl font-display font-bold">PetConnect</span>
          </div>
          <span className="inline-block px-4 py-1.5 bg-white/15 rounded-full text-sm font-medium mb-8 border border-white/20">
            ✨ Cộng đồng yêu thú cưng
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Nơi tình yêu dành cho boss bắt đầu
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Kết nối cộng đồng yêu thú cưng, tìm dịch vụ phù hợp và lưu lại hành
            trình chăm sóc thú cưng.
          </p>
          <div className="flex gap-4 text-white/50 text-sm">
            <span>Care</span>
            <span>•</span>
            <span>Connect</span>
            <span>•</span>
            <span>Love</span>
          </div>
        </div>
        <p className="absolute bottom-6 left-16 text-white/30 text-xs z-10">
          PetConnect luôn đồng hành cùng bạn và boss mỗi ngày
        </p>
      </div>
      <div className="lg:w-[55%] flex flex-col justify-center p-8 lg:p-16">
        <div className="max-w-lg mx-auto w-full">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
            Chào mừng đến với PetConnect
          </p>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-8">
            Bắt đầu hành trình của bạn
          </h2>
          <div className="grid gap-4">
            {cards.map((c, i) => (
              <Link
                key={i}
                to={c.href}
                className={`group flex items-center gap-5 p-5 rounded-[28px] border-2 transition-all duration-300 hover:shadow-lg ${c.primary ? "border-[#256F63] bg-[#DDF2EA]" : "border-gray-100 bg-white hover:border-[#256F63]/30"}`}
              >
                <div
                  className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center shrink-0`}
                >
                  <c.icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-gray-800 text-sm">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                </div>
                {c.primary && (
                  <span className="text-[10px] px-2 py-0.5 bg-[#256F63] text-white rounded-full font-medium">
                    Chọn
                  </span>
                )}
              </Link>
            ))}
          </div>
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
          <Route path="/hospital" element={<HospitalManage />} />
          <Route path="/medical-records" element={<MedicalRecordsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
