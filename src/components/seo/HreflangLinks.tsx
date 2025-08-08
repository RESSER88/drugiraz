import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const SUPPORTED_LANGS = ['pl','en','cs','sk','de'] as const;

const HreflangLinks = () => {
  const location = useLocation();
  const { language } = useLanguage();
 
  const pathname = location.pathname;
  // Strip leading language if present
  const firstSeg = pathname.split('/')[1];
  const basePath = SUPPORTED_LANGS.includes(firstSeg as any)
    ? pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
    : pathname;

  const makeUrl = (lang: string) => {
    const suffix = basePath === '/' ? '' : basePath;
    return `https://stakerpol.pl/${lang}${suffix}`;
  };

  return (
    <Helmet>
      {SUPPORTED_LANGS.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={makeUrl(lang)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={makeUrl('pl')} />
      {/* Ensure canonical reflects current language if not set elsewhere */}
      {/* Fallback canonical */}
      {!/\/products\//.test(basePath) && (
        <link rel="canonical" href={`https://stakerpol.pl/${language}${basePath === '/' ? '' : basePath}`} />
      )}
    </Helmet>
  );
};

export default HreflangLinks;
