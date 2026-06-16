import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Heart } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import type { NavLink } from "../types";

const links: NavLink[] = [
  { labelKey: "nav.home", href: "#home" },
  { labelKey: "nav.services", href: "#services" },
  { labelKey: "nav.findVet", href: "#vet-finder" },
  { labelKey: "nav.community", href: "#community" },
  { labelKey: "nav.contact", href: "#footer" },
];

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-100 dark:border-slate-800" : "bg-transparent"}`}
    >
      <div className="container-max px-4 flex items-center justify-between py-3">
        <a
          href="#home"
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#home");
          }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-heal-500 to-heal-200 rounded-xl flex items-center justify-center shadow-lg shadow-heal-500/20">
            <Heart size={20} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white">
            Pet<span className="text-heal-500">Healing</span>
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(l.href);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-heal-600 dark:hover:text-heal-400 hover:bg-heal-50 dark:hover:bg-heal-500/10 rounded-lg transition-colors"
            >
              {t(l.labelKey)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <a
            href="/login"
            className="hidden sm:inline-flex btn-primary text-sm !py-2.5 !px-5"
          >
            Đăng nhập
          </a>
          <a
            href="/partner-register"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200"
            style={{ background: "#0E9F6E" }}
          >
            Đăng ký đối tác
          </a>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl p-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-slate-800 dark:text-white">
                Pet<span className="text-heal-500">Healing</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(l.href);
                  }}
                  className="px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-heal-50 dark:hover:bg-heal-500/10 hover:text-heal-600 dark:hover:text-heal-400"
                >
                  {t(l.labelKey)}
                </a>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <a
                  href="/login"
                  className="btn-primary w-full text-center block"
                >
                  Đăng nhập
                </a>
                <a
                  href="/partner-register"
                  className="mt-3 w-full text-center block py-3 rounded-xl font-semibold text-white text-sm"
                  style={{ background: "#0E9F6E" }}
                >
                  Đăng ký đối tác
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
