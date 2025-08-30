
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import HreflangLinks from '@/components/seo/HreflangLinks';
import CookieConsent from '@/components/consent/CookieConsent';
import GSCVerification from '@/components/seo/GSCVerification';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useScrollToTop();

  return (
    <div className="min-h-screen flex flex-col">
      {/* WCAG 2.1 AA - Skip to main content for screen readers */}
      <a href="#main-content" className="skip-to-main">
        Przejdź do głównej treści
      </a>
      
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <HreflangLinks />
        <GSCVerification />
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Layout;
