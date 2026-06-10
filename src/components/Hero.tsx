import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Star } from "lucide-react";

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-heal-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute top-20 left-10 w-80 h-80 bg-heal-200/30 dark:bg-heal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 dark:bg-heal-500/5 rounded-full blur-3xl" />
      </div>
      <div className="container-max px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-heal-100 dark:bg-heal-500/20 text-heal-700 dark:text-heal-300 text-sm font-medium rounded-full mb-6"
            >
              <Heart size={14} fill="currentColor" /> Holistic Pet Care
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white leading-tight mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="#vet-finder"
                className="btn-primary text-lg !px-8 !py-3.5"
              >
                {t("hero.cta1")} <ArrowRight size={20} />
              </a>
              <a href="#services" className="btn-outline text-lg !px-8 !py-3.5">
                {t("hero.cta2")}
              </a>
            </div>
            <div className="flex items-center gap-3 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Trusted by 10,000+ pet owners
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-heal-400/30 to-heal-200/20 dark:from-heal-500/20 dark:to-heal-400/10 rounded-full blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=700&h=700&fit=crop"
                  alt="Vet"
                  className="w-full aspect-square object-cover"
                />
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-3 -left-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                  <Heart
                    size={18}
                    className="text-green-600 dark:text-green-400"
                    fill="currentColor"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    24/7
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Emergency Care
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
