import './globals.css';
import React from 'react';
import AdminAuthGuard from '../components/AdminAuthGuard';

export const metadata = {
  title: 'Little Creators Admin Control Panel',
  description: 'Generic Multi-Category Catalog, Product Lines, Bundles, Analytics, Homepage CMS Builder & Settings.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </body>
    </html>
  );
}
