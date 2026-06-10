import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, PawPrint } from "lucide-react";

interface AuthPageProps {
  onLogin?: () => void;
}

export default function LoginPage({ onLogin }: AuthPageProps) {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [currentPet, setCurrentPet] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pets = [
    {
      name: "Misu",
      desc: "Misu thích được vuốt ve và chơi đùa mỗi sáng 🌿",
      img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700&h=900&fit=crop",
    },
    {
      name: "Lucky",
      desc: "Lucky luôn vui vẻ và thích chạy nhảy trong công viên 🎾",
      img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&h=900&fit=crop",
    },
    {
      name: "Bông",
      desc: "Bông thích nằm cuộn tròn và kêu gừ gừ suốt ngày ☁️",
      img: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=700&h=900&fit=crop",
    },
  ];

  useEffect(() => {
    const t = setInterval(
      () => setCurrentPet((p) => (p + 1) % pets.length),
      3000,
    );
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.email.includes("@")) errs.email = "Email không hợp lệ";
    if (!form.password) errs.password = "Vui lòng nhập mật khẩu";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.error });
        setLoading(false);
        return;
      }
      if (form.remember)
        localStorage.setItem("petheal_user", JSON.stringify(data.user));
      onLogin?.();
      window.location.href = "/";
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
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-heal-500 to-heal-200 rounded-xl flex items-center justify-center">
              <PawPrint size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Pet<span className="text-heal-500">Healing</span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 mt-8 mb-2">
            Chào mừng trở lại 🐾
          </h1>
          <p className="text-slate-500 mb-8">
            Đăng nhập để chăm sóc thú cưng của bạn tốt hơn mỗi ngày.
          </p>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-3 mb-6">
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

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              hoặc
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hello@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 focus:border-heal-500 text-slate-800 placeholder-slate-400 transition-all duration-200 ${errors.email ? "border-red-400" : "border-slate-200"}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 focus:border-heal-500 text-slate-800 placeholder-slate-400 transition-all duration-200 ${errors.password ? "border-red-400" : "border-slate-200"}`}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) =>
                    setForm({ ...form, remember: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-heal-500 focus:ring-heal-500/30"
                />
                <span className="text-sm text-slate-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-heal-500 hover:text-heal-600 font-medium"
              >
                Quên mật khẩu?
              </a>
            </div>

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
                  Đăng nhập <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-heal-500 hover:text-heal-600 font-semibold"
            >
              Đăng ký ngay
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

        {/* Pet info overlay */}
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

          {/* Dots */}
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
