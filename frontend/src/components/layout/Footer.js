'use client';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer__status">
        <span className="footer__status-dot" />
        {t('systemOnline')} | {t('lastSync')}
      </div>
      <div className="footer__links">
        <Link href="/terms-of-service">{t('terms')}</Link>
        <Link href="/privacy-policy">{t('privacy')}</Link>
      </div>
    </footer>
  );
}
