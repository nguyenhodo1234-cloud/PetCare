import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PawPrint, Calendar, MessageCircle, Heart } from "lucide-react";
import type { RootState } from "../../store";

export default function OwnerDashboard() {
  const { user } = useSelector((s: RootState) => s.auth);

  const menu = [
    {
      icon: PawPrint,
      label: "Thú cưng của tôi",
      href: "/my-pets",
      color: "bg-brand/10 text-brand",
    },
    {
      icon: Calendar,
      label: "Lịch hẹn",
      href: "/appointments",
      color: "bg-teal/10 text-teal",
    },
    {
      icon: MessageCircle,
      label: "Tin nhắn",
      href: "/chat",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Heart,
      label: "Mạng xã hội",
      href: "/feed",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-warm font-body">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl text-text">
            🐾 Pet<span className="text-brand">Ecosystem</span>
          </Link>
          <div className="flex items-center gap-3">
            {user?.role === "ADMIN" && (
              <Link
                to="/admin"
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium"
              >
                ⚙️ Admin
              </Link>
            )}
            {user?.role === "VET" && (
              <Link
                to="/vet"
                className="text-xs bg-[#E8F4EE] text-[#2E7D5A] px-3 py-1 rounded-full font-medium"
              >
                🩺 Lịch khám
              </Link>
            )}
            <Link
              to="/notifications"
              className="p-2 rounded-lg hover:bg-warm text-muted"
            >
              🔔
            </Link>
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm"
            >
              {user?.name?.charAt(0) || "U"}
            </Link>
          </div>
        </div>
      </header>

      <div className="container-max px-4 py-8">
        <h1 className="font-display text-2xl font-extrabold text-text mb-1">
          Xin chào, {user?.name || "bạn"}! 👋
        </h1>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              user?.role === "VET"
                ? "bg-blue-100 text-blue-700"
                : user?.role === "SHOP_OWNER"
                  ? "bg-orange-100 text-orange-700"
                  : user?.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {user?.role === "VET"
              ? "Bác sĩ thú y"
              : user?.role === "SHOP_OWNER"
                ? "Chủ cửa hàng"
                : user?.role === "ADMIN"
                  ? "Quản trị viên"
                  : "Chủ thú cưng"}
          </span>
        </div>
        <p className="text-muted mb-8">
          Chào mừng đến với hệ sinh thái thú cưng.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {menu.map((m, i) => (
            <Link
              key={i}
              to={m.href}
              className="card p-5 text-center hover:-translate-y-1 transition-transform"
            >
              <div
                className={`w-12 h-12 ${m.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
              >
                <m.icon size={24} />
              </div>
              <span className="text-sm font-medium text-text">{m.label}</span>
            </Link>
          ))}
        </div>

        <h2 className="font-display text-xl font-bold text-text mb-4">
          Khám phá
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "🏥",
              title: "Bệnh viện thú y",
              desc: "Tìm bệnh viện gần bạn, đặt lịch khám nhanh chóng",
              href: "/hospitals",
            },
            {
              icon: "🛍️",
              title: "Cửa hàng thú cưng",
              desc: "Spa, grooming, phụ kiện cho thú cưng",
              href: "/shops",
            },
            {
              icon: "💉",
              title: "Quản lý tiêm phòng",
              desc: "Theo dõi lịch tiêm, nhắc nhở tự động",
              href: "/my-pets",
            },
          ].map((c, i) => (
            <Link key={i} to={c.href} className="card p-6">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-display font-bold text-text mb-1">
                {c.title}
              </h3>
              <p className="text-sm text-muted">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
