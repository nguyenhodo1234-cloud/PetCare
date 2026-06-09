import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const socials = [
    { n: 'FB', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { n: 'IG', d: 'M12 0C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { n: 'YT', d: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  ];
  return (
    <footer id="footer" className="bg-slate-800 text-slate-300">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <a href="#home" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-heal-500 to-heal-200 rounded-xl flex items-center justify-center"><Heart size={20} className="text-white" fill="white" /></div>
              <span className="text-xl font-bold text-white">Pet<span className="text-heal-400">Healing</span></span>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{t('footer.desc')}</p>
            <div className="flex items-center gap-2">
              {socials.map((s, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-slate-700 hover:bg-heal-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300" aria-label={s.n}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d={s.d} /></svg>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {['services.telehealth', 'services.energyHealing', 'services.nutrition', 'services.emergency'].map((k, i) => <li key={i}><a href="#services" className="hover:text-heal-400 transition-colors">{t(k)}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {['footer.about', 'footer.careers', 'footer.blog', 'footer.contact'].map((k, i) => <li key={i}><a href="#" className="hover:text-heal-400 transition-colors">{t(k)}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('nav.contact')}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>📧 hello@pethealing.com</li>
              <li>📞 +84 1900 8888</li>
              <li>📍 123 Healing St, HCMC</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-700">
        <div className="container-max px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-slate-300">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
