"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import CartDrawer from "./CartDrawer";
import WhatsappFloatingButton from "./WhatsappFloatingButton";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <div>
        <Navbar />
        <main>{children}</main>
      </div>
      <Footer />
      <AuthModal />
      <CartDrawer />
      <WhatsappFloatingButton />
    </>
  );
}
