import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Video, Sparkles, Apple, Siren } from "lucide-react";
import type { Service } from "../types";

const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = { Video, Sparkles, Apple, Siren };
const data: Service[] = [
  {
    id: "1",
    icon: "Video",
    titleKey: "services.telehealth",
    descKey: "services.telehealthDesc",
  },
  {
    id: "2",
    icon: "Sparkles",
    titleKey: "services.energyHealing",
    descKey: "services.energyHealingDesc",
  },
  {
    id: "3",
    icon: "Apple",
    titleKey: "services.nutrition",
    descKey: "services.nutritionDesc",
  },
  {
    id: "4",
    icon: "Siren",
    titleKey: "services.emergency",
    descKey: "services.emergencyDesc",
  },
];

export default function Services() {
  const { t } = useTranslation();
  return (
    <section
      id="services"
      className="section-padding bg-white dark:bg-slate-900"
    >
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-heal-50 dark:bg-heal-500/10 text-heal-600 dark:text-heal-400 text-sm font-medium rounded-full mb-4">
            {t("services.title")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
            {t("services.title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            {t("services.subtitle")}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((s, i) => {
            const Icon = iconMap[s.icon];
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="card p-6 text-center group cursor-pointer"
              >
                <div className="w-14 h-14 bg-heal-50 dark:bg-heal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-heal-100 dark:group-hover:bg-heal-500/20 group-hover:scale-110 transition-all duration-300">
                  {Icon && (
                    <Icon
                      size={28}
                      className="text-heal-600 dark:text-heal-400"
                    />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {t(s.titleKey)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(s.descKey)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
