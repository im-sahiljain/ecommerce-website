import './globals.css';
import React from 'react';
import StoreProvider from '../store/StoreProvider';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import CartDrawer from '../components/CartDrawer';
import WhatsappFloatingButton from '../components/WhatsappFloatingButton';

export const metadata = {
  title: 'Little Creators Craft & Candle Hub | Hand-painted Crafts & Wax Candles',
  description: 'Explore custom plaster craft kits, ready-to-paint figurines, and aesthetic scented wax candles.',
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
              <WhatsappFloatingButton />
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
