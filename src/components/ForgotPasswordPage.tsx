import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, PawPrint, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [currentPet, setCurrentPet] = useState(0);

  const pets = [
    { name: 'Misu', desc: 'Đừng lo, Misu sẽ giúp bạn lấy lại mật khẩu! 🐱', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700&h=900&fit=crop' },
    { name: 'Lucky', desc: 'Lucky luôn ở đây để hỗ trợ bạn 🌟', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&h=900&fit=crop' },
    { name: 'Bông', desc: 'Bông sẽ đưa bạn trở lại tài khoản nhanh thôi! ☁️', img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=700&h=900&fit=crop' },
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrentPet((p) => (p + 1) % pets.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Email không hợp lệ'); return; }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-heal-500 to-heal-200 rounded-xl flex items-center justify-center">
              <PawPrint size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Pet<span className="text-heal-500">Healing</span></span>
          </div>

          {!sent ? (
            <>
              <h1 className="text-3xl font-extrabold text-slate-800 mt-8 mb-2">Quên mật khẩu? 🔑</h1>
              <p className="text-slate-500 mb-8">Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email" required value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="hello@example.com"
                      className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 focus:border-heal-500 text-slate-800 placeholder-slate-400 transition-all ${error ? 'border-red-400' : 'border-slate-200'}`}
                    />
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-heal-500 hover:bg-heal-600 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg shadow-heal-500/25 hover:shadow-heal-500/40 transition-all duration-300">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : (
                    <>Gửi link đặt lại <ArrowRight size={18} /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-8">
                <a href="/login" className="inline-flex items-center gap-1 text-heal-500 hover:text-heal-600 font-semibold">
                  <ArrowLeft size={14} /> Quay lại đăng nhập
                </a>
              </p>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Đã gửi! ✉️</h2>
              <p className="text-slate-500 mb-2">Link đặt lại mật khẩu đã được gửi đến</p>
              <p className="text-heal-600 font-semibold mb-8">{email}</p>
              <p className="text-sm text-slate-400 mb-8">Vui lòng kiểm tra hộp thư (cả spam) và làm theo hướng dẫn.</p>
              <a href="/login" className="inline-flex items-center gap-1 text-heal-500 hover:text-heal-600 font-semibold">
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right - Pet Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-heal-50">
        <AnimatePresence mode="wait">
          <motion.div key={currentPet} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6 }} className="absolute inset-0">
            <img src={pets[currentPet].img} alt={pets[currentPet].name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
          <motion.div key={`info-${currentPet}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-4xl font-bold mb-3">{pets[currentPet].name}</p>
            <p className="text-lg text-white/80 leading-relaxed">{pets[currentPet].desc}</p>
          </motion.div>
          <div className="flex gap-2 mt-8">
            {pets.map((_, i) => (
              <button key={i} onClick={() => setCurrentPet(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentPet ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
