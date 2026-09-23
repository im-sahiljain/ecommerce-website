"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ProductListingForm from "@/components/admin/ProductListingForm";

function NewProductPage() {
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get("from") || undefined;
  return <ProductListingForm duplicateId={duplicateId} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-xs font-bold text-slate-500">
          Loading product form...
        </p>
      }
    >
      <NewProductPage />
    </Suspense>
  );
}
