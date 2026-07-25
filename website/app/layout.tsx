import './globals.css';
import React from 'react';
import StoreProvider from '../store/StoreProvider';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import CartDrawer from '../components/CartDrawer';

export const metadata = {
  title: 'Little Creators Craft Hub | Ready-to-Paint Plaster Craft Kits for Kids',
  description: 'Spark joy with safe, non-toxic, ready-to-paint plaster craft kits for curious young minds. Explore Space Adventures, Fairytale Magic, Secret Garden & Wild Kingdom themes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              <div>
                <Navbar />
                <main>{children}</main>
              </div>
              <Footer />
              <AuthModal />
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
