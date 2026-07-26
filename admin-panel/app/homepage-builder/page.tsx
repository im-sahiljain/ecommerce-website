"use me";
"use client";

import Link from "next/link";

export default function HomepageBuilderPage() {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md mx-auto my-12">
      <h2 className="text-xl font-extrabold text-slate-800">
        Homepage Layout Hardcoded
      </h2>
      <p className="text-xs text-slate-500">
        Homepage sections are now permanently fixed on the storefront page
        according to design spec. Product catalog content remains fully editable
        from the Products and Categories tabs.
      </p>
      <Link
        href="/products"
        className="inline-block px-5 py-2.5 bg-pink-500 text-white font-bold text-xs rounded-xl shadow-xs"
      >
        Go to Products Catalog →
      </Link>
    </div>
  );
}
