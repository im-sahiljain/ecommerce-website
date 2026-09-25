"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Edit, Plus, Sliders, Trash2 } from "lucide-react";
import { adminFetch } from "@/config/adminAuth";

interface Product {
  id: string;
  sku?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  theme: string;
  productLineId?: string;
  stockQuantity?: number;
  isOrderingEnabled?: boolean;
}

interface ProductLine {
  id: string;
  name: string;
}

export default function ProductsManagerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockChangeAmount, setStockChangeAmount] = useState(5);
  const [stockReason, setStockReason] = useState("Restock inventory");

  const fetchProducts = () => {
    adminFetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});

    adminFetch("/api/product-lines")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductLines(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product listing?")) {
      await adminFetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;

    try {
      const res = await adminFetch(
        `/api/products/${stockModalProduct.id}/stock-adjustment`,
        {
          method: "POST",
          body: JSON.stringify({
            changeAmount: Number(stockChangeAmount),
            reason: stockReason,
            updatedBy: "Admin",
          }),
        },
      );

      if (res.ok) {
        setStockModalProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.warn("Stock adjustment failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-800 sm:text-2xl">
            Products Catalog Management
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Granular product CRUD, SKU management, line and category assignment,
            and stock adjustments.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Craft / Candle Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-neutral-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-200/80 bg-neutral-50 font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-4">Product Info</th>
              <th className="p-4">Product Line</th>
              <th className="p-4">Category & Theme</th>
              <th className="p-4">Price (₹)</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Ordering</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((p) => {
              const stock = p.stockQuantity !== undefined ? p.stockQuantity : 10;
              const isOrderOn = p.isOrderingEnabled !== false;
              const line = productLines.find((l) => l.id === p.productLineId);
              return (
                <tr key={p.id} className="transition hover:bg-neutral-50/80">
                  <td className="flex items-center gap-3 p-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-10 w-10 rounded-xl border object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-neutral-800">{p.name}</p>
                      <p className="font-mono text-[10px] text-neutral-400">{p.sku || p.id}</p>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-neutral-800">
                    <span className="rounded-full bg-info-100 px-2.5 py-1 text-[10px] text-info-800">
                      {line
                        ? line.name
                        : p.productLineId === "line-2"
                          ? "Wax Candles"
                          : "POP Figurines"}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-neutral-700">
                    <span className="block font-bold text-neutral-800">{p.category}</span>
                    <span className="text-[11px] font-bold text-primary">{p.theme}</span>
                  </td>
                  <td className="p-4 font-extrabold text-neutral-800">₹{p.price.toFixed(2)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setStockModalProduct(p)}
                      className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-extrabold text-neutral-800 hover:bg-neutral-200"
                    >
                      <span>{stock} units</span>
                      <Sliders className="h-3 w-3 text-neutral-500" />
                    </button>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        isOrderOn
                          ? "bg-success-100 text-success-800"
                          : "bg-warning-100 text-warning-800"
                      }`}
                    >
                      {isOrderOn ? "Enabled" : "WhatsApp Only"}
                    </span>
                  </td>
                  <td className="space-x-1.5 p-4 text-right">
                    <Link
                      href={`/admin/products/new?from=${p.id}`}
                      title="Duplicate product"
                      className="inline-flex rounded-lg bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}`}
                      title="Edit product"
                      className="inline-flex rounded-lg bg-neutral-100 p-1.5 text-neutral-700 hover:bg-neutral-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Delete product"
                      className="rounded-lg bg-danger-50 p-1.5 text-danger-600 hover:bg-danger-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleStockAdjustment}
            className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h3 className="border-b pb-2 text-base font-extrabold text-neutral-800">
              Adjust Stock for {stockModalProduct.name}
            </h3>
            <p className="text-xs text-neutral-500">
              Current Stock:{" "}
              <strong className="text-neutral-800">
                {stockModalProduct.stockQuantity !== undefined
                  ? stockModalProduct.stockQuantity
                  : 10}{" "}
                units
              </strong>
            </p>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">
                Adjustment Quantity (+ to add, - to reduce)
              </label>
              <input
                type="number"
                value={stockChangeAmount}
                onChange={(e) => setStockChangeAmount(Number(e.target.value))}
                required
                className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">
                Reason / Note (Audit Trail)
              </label>
              <input
                type="text"
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
                placeholder="Restock from warehouse"
                required
                className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                className="rounded-xl bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-neutral-800"
              >
                Save Stock Change
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
