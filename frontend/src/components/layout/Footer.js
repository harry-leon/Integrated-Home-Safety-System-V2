'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer__status">
        <span className="footer__status-dot" />
        {t('systemOnline')} | {t('lastSync')}
      </div>
      <div className="footer__links">
        <a href="#">{t('terms')}</a>
        <a href="#">{t('privacy')}</a>
      </div>
    </footer>
  );
}
