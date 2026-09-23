"use client";

import { useParams } from "next/navigation";
import ProductListingForm from "@/components/admin/ProductListingForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  return <ProductListingForm productId={params.id} />;
}
