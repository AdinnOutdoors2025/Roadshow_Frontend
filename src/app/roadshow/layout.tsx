// src/app/(client)/layout.tsx
import Navbar from '../../components/Client/Reusable_Components/Navbar';
import Footer from '../../components/Client/Reusable_Components/Footer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div>
        {children}
      </div>
      <Footer />
    </>
  );
}