import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, PawPrint } from "lucide-react";
import { login, clearError } from "../../store";
import type { RootState, AppDispatch } from "../../store";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, token, user } = useSelector((s: RootState) => s.auth);
  const nav = useNavigate();
  const [currentPet, setCurrentPet] = useState(0);

  const pets = [
    {
      name: "Misu",
      desc: "Cùng Misu khám phá thế giới thú cưng tuyệt vời! 🐱",
      img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700&h=900&fit=crop",
    },
    {
      name: "Lucky",
      desc: "Lucky chào đón bạn đến với hệ sinh thái thú cưng 🌟",
      img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&h=900&fit=crop",
    },
    {
      name: "Corgi",
      desc: "Corgi mỉm cười chào ngày mới cùng bạn! 🌞",
      img: "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=700&h=900&fit=crop",
    },
  ];

  useEffect(() => {
    const t = setInterval(
      () => setCurrentPet((p) => (p + 1) % pets.length),
      3000,
    );
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (token && user) {
      if (user.role === "ADMIN") nav("/admin");
      else nav("/dashboard");
    }
    dispatch(clearError());
  }, [token, user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.includes("@")) e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) dispatch(login(form));
  };

  return (
    <div className="min-h-screen flex bg-warm font-body">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-light rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
              <PawPrint size={20} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold text-text">
              Pet<span className="text-brand">Ecosystem</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-text mt-8 mb-2">
            Chào mừng trở lại 🐾
          </h1>
          <p className="text-muted mb-8">
            Đăng nhập để khám phá hệ sinh thái thú cưng.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hello@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-surface border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-text placeholder-muted transition-all ${errors.email ? "border-error" : "border-border"}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-surface border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-text placeholder-muted transition-all ${errors.password ? "border-error" : "border-border"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error mt-1">{errors.password}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-brand hover:text-brand-dark font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-brand justify-center text-lg"
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
          <p className="text-center text-sm text-muted mt-8">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-brand hover:text-brand-dark font-semibold"
            >
              Đăng ký ngay
            </Link>
          </p>
        </motion.div>
      </div>
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-brand/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPet}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0"
          >
            <img
              src={pets[currentPet].img}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text/70 via-text/10 to-transparent" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
          <motion.div
            key={`t-${currentPet}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-display text-4xl font-bold mb-3">
              {pets[currentPet].name}
            </p>
            <p className="text-lg text-white/80">{pets[currentPet].desc}</p>
          </motion.div>
          <div className="flex gap-2 mt-8">
            {pets.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPet(i)}
                className={`h-2.5 rounded-full transition-all ${i === currentPet ? "bg-brand w-8" : "bg-white/40 w-2.5 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
