import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import type { Lang } from "../types";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const langs: { code: Lang; flag: string; label: string }[] = [
    { code: "en", flag: "🇺🇸", label: t("lang.en") },
    { code: "vi", flag: "🇻🇳", label: t("lang.vi") },
  ];
  const cur = langs.find((l) => l.code === i18n.language) || langs[0];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Globe size={14} />
        <span>{cur.flag}</span>
        <span className="hidden sm:inline">{cur.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                i18n.changeLanguage(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${i18n.language === l.code ? "text-heal-600 dark:text-heal-400 font-semibold bg-heal-50 dark:bg-heal-500/10" : "text-slate-700 dark:text-slate-200"}`}
            >
              <span className="text-lg">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
