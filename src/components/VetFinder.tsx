import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Star, MapPin, Circle } from "lucide-react";
import type { Vet } from "../types";

const vets: Vet[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialtyKey: "vetFinder.specialty2",
    rating: 4.9,
    reviews: 128,
    locationKey: "vetFinder.location1",
    available: true,
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialtyKey: "vetFinder.specialty1",
    rating: 4.8,
    reviews: 95,
    locationKey: "vetFinder.location2",
    available: true,
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Dr. Emily Parker",
    specialtyKey: "vetFinder.specialty3",
    rating: 4.7,
    reviews: 156,
    locationKey: "vetFinder.location3",
    available: false,
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialtyKey: "vetFinder.specialty4",
    rating: 4.9,
    reviews: 203,
    locationKey: "vetFinder.location1",
    available: true,
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop",
  },
];

export default function VetFinder() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [loc, setLoc] = useState("");
  const [spec, setSpec] = useState("");

  const filtered = vets.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (loc && v.locationKey !== loc) return false;
    if (spec && v.specialtyKey !== spec) return false;
    return true;
  });

  return (
    <section
      id="vet-finder"
      className="section-padding bg-slate-50 dark:bg-slate-800/50"
    >
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-heal-50 dark:bg-heal-500/10 text-heal-600 dark:text-heal-400 text-sm font-medium rounded-full mb-4">
            {t("vetFinder.title")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
            {t("vetFinder.title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {t("vetFinder.subtitle")}
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("vetFinder.search")}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/30 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
          <select
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-heal-500/30"
          >
            <option value="">{t("vetFinder.location")}</option>
            <option value="vetFinder.location1">
              {t("vetFinder.location1")}
            </option>
            <option value="vetFinder.location2">
              {t("vetFinder.location2")}
            </option>
            <option value="vetFinder.location3">
              {t("vetFinder.location3")}
            </option>
          </select>
          <select
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-heal-500/30"
          >
            <option value="">{t("vetFinder.specialty")}</option>
            <option value="vetFinder.specialty1">
              {t("vetFinder.specialty1")}
            </option>
            <option value="vetFinder.specialty2">
              {t("vetFinder.specialty2")}
            </option>
            <option value="vetFinder.specialty3">
              {t("vetFinder.specialty3")}
            </option>
            <option value="vetFinder.specialty4">
              {t("vetFinder.specialty4")}
            </option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="card p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="relative">
                  <img
                    src={v.avatar}
                    alt={v.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${v.available ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                    {v.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(v.specialtyKey)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {v.rating}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      ({v.reviews} {t("vetFinder.reviews")})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <MapPin size={12} /> {t(v.locationKey)}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${v.available ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}
                >
                  <Circle size={8} fill="currentColor" />
                  {v.available
                    ? t("vetFinder.available")
                    : t("vetFinder.unavailable")}
                </span>
                <button className="px-4 py-2 bg-heal-500 hover:bg-heal-600 text-white text-sm font-medium rounded-lg transition-colors">
                  {t("vetFinder.bookNow")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
