import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import { register, clearError } from "../../store";
import type { RootState, AppDispatch } from "../../store";

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, token, user } = useSelector((s: RootState) => s.auth);
  const nav = useNavigate();
  const [pet, setPet] = useState(0);

  const pets = [
    {
      name: "Corgi",
      desc: "Corgi vẫy đuôi chào mừng thành viên mới! 🌞",
      img: "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=700&h=900&fit=crop",
    },
    {
      name: "Scottish Fold",
      desc: "Scottish chào bạn bằng đôi mắt tròn xoe 🧡",
      img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=700&h=900&fit=crop",
    },
    {
      name: "Golden",
      desc: "Golden vui mừng khi có thêm bạn đồng hành 💛",
      img: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=700&h=900&fit=crop",
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setPet((p) => (p + 1) % pets.length), 3000);
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
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.email.includes("@")) e.email = "Email không hợp lệ";
    if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "SĐT phải 9-11 số";
    if (form.password.length < 6) e.password = "Mật khẩu ít nhất 6 ký tự";
    if (form.password !== form.confirm) e.confirm = "Mật khẩu không khớp";
    if (!form.agree) e.agree = "Vui lòng đồng ý điều khoản";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate())
      dispatch(
        register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      );
  };

  return (
    <div className="min-h-screen flex bg-warm font-body">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
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
          <h1 className="font-display text-3xl font-extrabold text-text mt-6 mb-2">
            Tạo tài khoản mới 🐶
          </h1>
          <p className="text-muted mb-6">
            Tham gia cộng đồng yêu thú cưng ngay hôm nay.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            {["name", "email", "phone", "password", "confirm"].map((f) => (
              <div key={f}>
                <label className="block text-sm font-medium text-text mb-1">
                  {
                    {
                      name: "Họ và tên",
                      email: "Email",
                      phone: "SĐT",
                      password: "Mật khẩu",
                      confirm: "Xác nhận MK",
                    }[f]
                  }
                  {f === "phone" && <span className="text-error"> *</span>}
                </label>
                <div className="relative">
                  {
                    {
                      name: (
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />
                      ),
                      email: (
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />
                      ),
                      phone: (
                        <Phone
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />
                      ),
                      password: (
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />
                      ),
                      confirm: (
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />
                      ),
                    }[f]
                  }
                  <input
                    type={
                      f === "password"
                        ? showPw
                          ? "text"
                          : "password"
                        : f === "confirm"
                          ? "password"
                          : f === "email"
                            ? "email"
                            : "text"
                    }
                    value={(form as any)[f]}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    placeholder={
                      {
                        name: "Nguyễn Văn A",
                        email: "hello@example.com",
                        phone: "0912345678",
                        password: "Ít nhất 6 ký tự",
                        confirm: "Nhập lại mật khẩu",
                      }[f]
                    }
                    className={`w-full pl-10 ${f === "password" ? "pr-12" : "pr-4"} py-2.5 bg-surface border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-text placeholder-muted transition-all ${errors[f] ? "border-error" : "border-border"}`}
                  />
                  {f === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {errors[f] && (
                  <p className="text-xs text-error mt-1">{errors[f]}</p>
                )}
              </div>
            ))}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-border text-brand focus:ring-brand/30"
              />
              <span className="text-sm text-muted">
                Tôi đồng ý với{" "}
                <a href="#" className="text-brand">
                  điều khoản
                </a>{" "}
                và{" "}
                <a href="#" className="text-brand">
                  chính sách bảo mật
                </a>
              </span>
            </label>
            {errors.agree && (
              <p className="text-xs text-error">{errors.agree}</p>
            )}
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
                  Tạo tài khoản <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-6">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-brand hover:text-brand-dark font-semibold"
            >
              Đăng nhập
            </Link>
          </p>
        </motion.div>
      </div>
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-brand/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={pet}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0"
          >
            <img
              src={pets[pet].img}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text/70 via-text/10 to-transparent" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
          <motion.div
            key={`t-${pet}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-display text-4xl font-bold mb-3">
              {pets[pet].name}
            </p>
            <p className="text-lg text-white/80">{pets[pet].desc}</p>
          </motion.div>
          <div className="flex gap-2 mt-8">
            {pets.map((_, i) => (
              <button
                key={i}
                onClick={() => setPet(i)}
                className={`h-2.5 rounded-full transition-all ${i === pet ? "bg-brand w-8" : "bg-white/40 w-2.5 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
