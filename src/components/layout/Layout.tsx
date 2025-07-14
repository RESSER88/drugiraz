
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useScrollToTop();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
