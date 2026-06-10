import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  PawPrint,
} from "lucide-react";

interface RegisterPageProps {
  onRegister?: () => void;
}

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [currentPet, setCurrentPet] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pets = [
    {
      name: "Corgi",
      desc: "Chú chó nhỏ bé với đôi chân ngắn và nụ cười tỏa nắng 🌞",
      img: "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=700&h=900&fit=crop",
    },
    {
      name: "Scottish Fold",
      desc: "Đôi tai cụp đáng yêu và tính cách hiền lành, ấm áp 🧡",
      img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=700&h=900&fit=crop",
    },
    {
      name: "Golden",
      desc: "Người bạn trung thành với trái tim vàng và niềm vui bất tận 💛",
      img: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=700&h=900&fit=crop",
    },
  ];

  useEffect(() => {
    const t = setInterval(
      () => setCurrentPet((p) => (p + 1) % pets.length),
      3000,
    );
    return () => clearInterval(t);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên";
    if (!form.email.includes("@")) errs.email = "Email không hợp lệ";
    if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Số điện thoại phải từ 9-11 chữ số";
    if (form.password.length < 6) errs.password = "Mật khẩu ít nhất 6 ký tự";
    if (form.password !== form.confirm) errs.confirm = "Mật khẩu không khớp";
    if (!form.agree) errs.agree = "Vui lòng đồng ý điều khoản";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.error });
        setLoading(false);
        return;
      }
      onRegister?.();
      window.location.href = "/login";
    } catch {
      setErrors({ email: "Không thể kết nối server" });
    }
    setLoading(false);
  };

  const socials = [
    {
      name: "Google",
      icon: "G",
      bg: "hover:bg-red-50 hover:border-red-200",
      text: "hover:text-red-600",
    },
    {
      name: "Facebook",
      icon: "f",
      bg: "hover:bg-blue-50 hover:border-blue-200",
      text: "hover:text-blue-600",
    },
    {
      name: "Apple",
      icon: "",
      bg: "hover:bg-slate-100 hover:border-slate-400",
      text: "hover:text-slate-800",
    },
  ];

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-heal-500 to-heal-200 rounded-xl flex items-center justify-center">
              <PawPrint size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Pet<span className="text-heal-500">Healing</span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 mt-6 mb-2">
            Tạo tài khoản mới 🐶
          </h1>
          <p className="text-slate-500 mb-6">
            Tham gia cộng đồng yêu thú cưng ngay hôm nay.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 focus:border-heal-500 text-slate-800 placeholder-slate-400 transition-all ${errors.name ? "border-red-400" : "border-slate-200"}`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hello@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 focus:border-heal-500 text-slate-800 placeholder-slate-400 transition-all ${errors.email ? "border-red-400" : "border-slate-200"}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912 345 678"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 focus:border-heal-500 text-slate-800 placeholder-slate-400 transition-all ${errors.phone ? "border-red-400" : "border-slate-200"}`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Ít nhất 6 ký tự"
                  className={`w-full pl-10 pr-12 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 focus:border-heal-500 text-slate-800 placeholder-slate-400 transition-all ${errors.password ? "border-red-400" : "border-slate-200"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 focus:border-heal-500 text-slate-800 placeholder-slate-400 transition-all ${errors.confirm ? "border-red-400" : "border-slate-200"}`}
                />
              </div>
              {errors.confirm && (
                <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>
              )}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-heal-500 focus:ring-heal-500/30"
              />
              <span className="text-sm text-slate-600">
                Tôi đồng ý với{" "}
                <a href="#" className="text-heal-500 hover:text-heal-600">
                  điều khoản
                </a>{" "}
                và{" "}
                <a href="#" className="text-heal-500 hover:text-heal-600">
                  chính sách bảo mật
                </a>
              </span>
            </label>
            {errors.agree && (
              <p className="text-xs text-red-500">{errors.agree}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-heal-500 hover:bg-heal-600 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg shadow-heal-500/25 hover:shadow-heal-500/40 transition-all duration-300"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <>
                  Tạo tài khoản <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Social */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">Hoặc đăng ký với</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {socials.map((s) => (
              <button
                key={s.name}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white ${s.bg} ${s.text} transition-all duration-200`}
              >
                <span className="text-base font-bold">{s.icon}</span>
                <span className="hidden sm:inline">{s.name}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Đã có tài khoản?{" "}
            <a
              href="/login"
              className="text-heal-500 hover:text-heal-600 font-semibold"
            >
              Đăng nhập
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right - Pet Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-heal-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPet}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={pets[currentPet].img}
              alt={pets[currentPet].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
          <motion.div
            key={`info-${currentPet}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-4xl font-bold mb-3">{pets[currentPet].name}</p>
            <p className="text-lg text-white/80 leading-relaxed">
              {pets[currentPet].desc}
            </p>
          </motion.div>
          <div className="flex gap-2 mt-8">
            {pets.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPet(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentPet ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
