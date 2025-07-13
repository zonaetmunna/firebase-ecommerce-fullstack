"use client";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import CartModal from "./_components/cart/cartModal";
import Footer from "./_components/footer";
import Navbar from "./_components/navigationBar/navbar";
import Providers from "./_components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false); //state for cart open and close
  const router = useRouter(); // Initialize the useRouter hook
  const pathname = usePathname();

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCartModalClose = () => {
    setIsCartOpen(false);
  };

  const isDashboardRoute = pathname.startsWith("/dashboard");

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Toaster />
          {!isDashboardRoute && <Navbar onCartClick={handleCartClick} />}
          <div>{children}</div>
          {isCartOpen && <CartModal onClose={handleCartModalClose} />}
          {!isDashboardRoute && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
