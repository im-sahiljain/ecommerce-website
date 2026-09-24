import React from "react";
import type { Metadata } from "next";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const metadata: Metadata = {
  title: { absolute: "Admin Panel | Kits and Craft" },
  description: "Admin Control Center for Kits and Craft Management",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
