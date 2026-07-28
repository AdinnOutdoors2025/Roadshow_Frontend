// src/app/(client)/layout.tsx
import Navbar from '../../components/Client/Reusable_Components/Navbar';
import Footer from '../../components/Client/Reusable_Components/Footer';
import GlobalSmoothScroll from '@/components/GlobalSmoothScroll';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <> 
      <Navbar />
      <GlobalSmoothScroll>
      <div>
        {children}
      </div>
       </GlobalSmoothScroll>
      <Footer />
      
    </>
  );
}