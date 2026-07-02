import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PawPrint,
  Calendar,
  MessageCircle,
  Heart,
  Stethoscope,
  Store,
  Syringe,
  Building2,
  FileText,
  Users,
  Menu,
  Bell,
  ChevronRight,
  MapPin,
  Phone,
  LogOut,
  User,
} from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";
import { logout } from "../../store";

const SIDEBAR = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/dashboard" },
  { icon: PawPrint, label: "Thú cưng", href: "/my-pets" },
  { icon: Calendar, label: "Lịch hẹn", href: "/appointments" },
  { icon: Stethoscope, label: "Phòng khám", href: "/hospitals" },
  { icon: Store, label: "Cửa hàng", href: "/shops" },
  { icon: Syringe, label: "Tiêm phòng", href: "/my-pets" },
  { icon: FileText, label: "Bệnh án", href: "/my-pets" },
  { icon: MessageCircle, label: "Tin nhắn", href: "/chat" },
  { icon: Heart, label: "Cộng đồng", href: "/feed" },
];

const VET_SIDEBAR = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/vet" },
  { icon: Calendar, label: "Lịch khám", href: "/vet" },
  { icon: FileText, label: "Hồ sơ bệnh án", href: "/medical-records" },
  { icon: Building2, label: "Bệnh viện", href: "/hospital" },
  { icon: Users, label: "Bác sĩ", href: "/hospital" },
];

const APPTS = [
  {
    time: "08:30",
    pet: "Milo",
    owner: "Chị Hân",
    service: "Khám tổng quát",
    status: "confirmed",
  },
  {
    time: "09:00",
    pet: "Lucky",
    owner: "Anh Tuấn",
    service: "Tiêm vaccine",
    status: "waiting",
  },
  {
    time: "10:15",
    pet: "Kitty",
    owner: "Bé Na",
    service: "Cắt tỉa lông",
    status: "confirmed",
  },
  {
    time: "14:00",
    pet: "Bông",
    owner: "Cô Lan",
    service: "Tái khám",
    status: "completed",
  },
];

export default function OwnerDashboard() {
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hospital, setHospital] = useState<any>(null);
  const [stats, setStats] = useState({ pets: 0, appointments: 0, records: 0 });

  const isVet = user?.role === "VET" || user?.role === "HOSPITAL_STAFF";
  const menu = isVet ? VET_SIDEBAR : SIDEBAR;

  useEffect(() => {
    api
      .get("/pets")
      .then((r) => setStats((s) => ({ ...s, pets: r.data.data?.length || 0 })))
      .catch(() => {});
    api
      .get("/appointments")
      .then((r) =>
        setStats((s) => ({ ...s, appointments: r.data.data?.length || 0 })),
      )
      .catch(() => {});
    if (isVet) {
      api
        .get("/hospitals/me")
        .then((r) => setHospital(r.data.data))
        .catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5EE] font-body flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#256F63] rounded-xl flex items-center justify-center">
              🐾
            </div>
            <span className="font-display font-bold text-lg text-gray-800">
              Pet<span className="text-[#256F63]">Connect</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menu.map((m) => {
            const active =
              location.pathname === m.href ||
              (m.href !== "/dashboard" && location.pathname.startsWith(m.href));
            return (
              <Link
                key={m.href}
                to={m.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#DDF2EA] text-[#256F63]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <m.icon size={18} />
                {m.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link to="/profile" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#DDF2EA] flex items-center justify-center text-[#256F63] font-bold text-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-50"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3 ml-auto">
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium"
                >
                  ⚙️ Admin
                </Link>
              )}
              {isVet && (
                <>
                  <Link
                    to="/vet"
                    className="text-xs bg-[#DDF2EA] text-[#256F63] px-3 py-1 rounded-full font-medium"
                  >
                    🩺 Lịch khám
                  </Link>
                  {user?.role === "HOSPITAL_STAFF" && (
                    <Link
                      to="/hospital"
                      className="text-xs bg-[#DDF2EA] text-[#256F63] px-3 py-1 rounded-full font-medium"
                    >
                      🏥 Bệnh viện
                    </Link>
                  )}
                </>
              )}
              <Link
                to="/notifications"
                className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 relative"
              >
                <Bell size={18} />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full bg-[#DDF2EA] flex items-center justify-center text-[#256F63] font-bold text-sm hover:ring-2 ring-[#256F63]/30 transition-all"
                >
                  {user?.name?.charAt(0) || "U"}
                </button>
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        <User size={16} /> Hồ sơ
                      </button>
                      <button
                        onClick={() => {
                          dispatch(logout());
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-8">
          {/* Welcome */}
          <div>
            <h1 className="font-display text-2xl font-extrabold text-gray-800">
              Chào buổi sáng, {user?.role === "VET" ? "BS." : ""}
              {user?.role === "ADMIN" ? "Admin " : ""}
              {user?.name || "bạn"}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Theo dõi sức khỏe thú cưng và quản lý lịch hẹn của bạn.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                icon: PawPrint,
                label: "Thú cưng",
                value: stats.pets,
                color: "bg-[#256F63]/10 text-[#256F63]",
              },
              {
                icon: Calendar,
                label: "Lịch hẹn",
                value: stats.appointments,
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: FileText,
                label: "Bệnh án",
                value: stats.records,
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: Syringe,
                label: "Tiêm phòng",
                value: "0",
                color: "bg-orange-100 text-orange-600",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div
                  className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <s.icon size={20} />
                </div>
                <p className="text-2xl font-display font-bold text-gray-800">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Hospital info (if VET) */}
          {hospital && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#DDF2EA] rounded-2xl flex items-center justify-center text-2xl">
                  🏥
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-lg text-gray-800">
                    {hospital.name}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {hospital.address && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {hospital.address}
                      </span>
                    )}
                    {hospital.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {hospital.phone}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  {hospital.status === "ACTIVE" ? "Đã xác minh" : "Chờ duyệt"}
                </span>
              </div>
            </div>
          )}

          {/* Menu Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Stethoscope,
                label: "Phòng khám",
                desc: "Tìm phòng khám gần bạn",
                href: "/hospitals",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Store,
                label: "Cửa hàng",
                desc: "Spa, grooming",
                href: "/shops",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: Syringe,
                label: "Tiêm phòng",
                desc: "Lịch tiêm chủng",
                href: "/my-pets",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: FileText,
                label: "Bệnh án",
                desc: "Hồ sơ sức khỏe",
                href: "/my-pets",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: Calendar,
                label: "Lịch hẹn",
                desc: "Đặt lịch khám",
                href: "/appointments",
                color: "bg-teal-100 text-teal-600",
              },
              {
                icon: Heart,
                label: "Cộng đồng",
                desc: "Chia sẻ khoảnh khắc",
                href: "/feed",
                color: "bg-pink-100 text-pink-600",
              },
              {
                icon: MessageCircle,
                label: "Tin nhắn",
                desc: "Chat với bác sĩ",
                href: "/chat",
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                icon: Building2,
                label: "Đối tác",
                desc: "Đăng ký kinh doanh",
                href: "/partner-register",
                color: "bg-indigo-100 text-indigo-600",
              },
            ].map((m, i) => (
              <Link
                key={i}
                to={m.href}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <m.icon size={20} />
                </div>
                <h3 className="font-display font-bold text-gray-800 text-sm">
                  {m.label}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
              </Link>
            ))}
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-gray-800">
                📅 Lịch hẹn hôm nay
              </h2>
              <Link
                to="/appointments"
                className="text-sm text-[#256F63] font-medium flex items-center gap-1"
              >
                Xem tất cả <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {APPTS.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-display font-bold text-gray-800 w-12">
                    {a.time}
                  </span>
                  <div className="w-10 h-10 bg-[#DDF2EA] rounded-xl flex items-center justify-center text-lg">
                    🐾
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {a.pet}{" "}
                      <span className="text-gray-400 font-normal">
                        · {a.owner}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">{a.service}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      a.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : a.status === "waiting"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {a.status === "confirmed"
                      ? "Đã xác nhận"
                      : a.status === "waiting"
                        ? "Chờ khám"
                        : "Hoàn thành"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
