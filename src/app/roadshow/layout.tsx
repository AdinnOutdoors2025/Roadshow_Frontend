// src/app/(client)/layout.tsx
import Navbar from '../../components/Client/Reusable_Components/Navbar';
import Footer from '../../components/Client/Reusable_Components/Footer';
import GlobalSmoothScroll from '@/components/GlobalSmoothScroll';
import { SmoothScroll } from "../../components/Client/HomePageSections/SmoothScroll";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navbar portals itself to document.body (see Navbar.tsx), so it
          deliberately sits outside GlobalSmoothScroll — ScrollSmoother puts a
          transform on #smooth-content, and a transformed ancestor breaks
          `position: fixed` for everything inside it. */}
      <Navbar />
    <SmoothScroll>

      {/* Smooth scrolling for every public-site page */}
      <GlobalSmoothScroll>
        <div>
          {children}
        </div>
        <Footer />
      </GlobalSmoothScroll>
    </SmoothScroll>

    </>
  );
}