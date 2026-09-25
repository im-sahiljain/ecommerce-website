"use client";

import React, { useState, useEffect } from "react";
import { Boxes, Plus, Edit2, Trash2, CheckSquare, Square, Search, Sparkles, Image as ImageIcon } from "lucide-react";
import { adminFetch } from "@/config/adminAuth";
import { API_BASE_URL } from "@/config/api";
import { slugify } from "@/lib/slug";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  productLineId?: string;
}

interface Pack {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  image?: string;
  productIds: string[];
  productLineId?: string;
  categoryId?: string;
  inStock: boolean;
  featured?: boolean;
}

interface ProductLine {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  productLineId?: string;
}

export default function PacksAdminPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [price, setPrice] = useState<number | "">("");
  const [showOriginalPrice, setShowOriginalPrice] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productLineId, setProductLineId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packsRes, prodsRes, linesRes, catsRes] = await Promise.all([
        adminFetch("/api/packs"),
        adminFetch("/api/products"),
        adminFetch("/api/product-lines"),
        adminFetch("/api/categories"),
      ]);

      const packsData = await packsRes.json();
      const prodsData = await prodsRes.json();
      const linesData = await linesRes.json();
      const catsData = await catsRes.json();

      if (Array.isArray(packsData)) setPacks(packsData);
      if (Array.isArray(prodsData)) setProducts(prodsData);
      if (Array.isArray(linesData)) setProductLines(linesData);
      if (Array.isArray(catsData)) setCategories(catsData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPack(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setPrice("");
    setShowOriginalPrice(false);
    setDescription("");
    setImage("");
    setSelectedProductIds([]);
    setProductLineId("");
    setCategoryId("");
    setInStock(true);
    setFeatured(false);
    setProductSearch("");
    setIsModalOpen(true);
  };

  const openEditModal = (pack: Pack) => {
    setEditingPack(pack);
    setName(pack.name);
    setSlug(pack.slug || "");
    setSlugTouched(true);
    setPrice(pack.price);
    setShowOriginalPrice(Boolean(pack.originalPrice));
    setDescription(pack.description || "");
    setImage(pack.image || "");
    setSelectedProductIds(pack.productIds || []);
    setProductLineId(pack.productLineId || "");
    setCategoryId(pack.categoryId || "");
    setInStock(pack.inStock !== false);
    setFeatured(Boolean(pack.featured));
    setProductSearch("");
    setIsModalOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const calculatedOriginalPrice = selectedProductIds.reduce((sum, id) => {
    const product = products.find((item) => item.id === id);
    return sum + (product ? Number(product.price) || 0 : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || selectedProductIds.length === 0) {
      alert("Please provide a kit title, price, and select at least 1 product.");
      return;
    }

    const payload = {
      name,
      slug: slugify(slug) || slugify(name),
      price: Number(price),
      originalPrice:
        showOriginalPrice && calculatedOriginalPrice > 0
          ? calculatedOriginalPrice
          : null,
      description,
      image,
      productIds: selectedProductIds,
      productLineId: productLineId || undefined,
      categoryId: categoryId || undefined,
      inStock,
      featured,
    };

    try {
      const url = editingPack ? `/api/packs/${editingPack.id}` : "/api/packs";
      const method = editingPack ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save kit");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save kit");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this kit?")) return;
    try {
      const res = await adminFetch(`/api/packs/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div className="space-y-8 font-sans text-neutral-800">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-warning-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
              Kits
            </h1>
          </div>
          <p className="text-neutral-500 text-xs mt-1">
            Group existing catalog products into kits (for example, a kit of 4 or a kit of 10) with special pricing. No duplicate uploads required!
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-warning-500 hover:bg-warning-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Kit</span>
        </button>
      </div>

      {/* Packs Grid / Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-neutral-200 text-center">
          <div className="w-8 h-8 border-4 border-warning-500/30 border-t-warning-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Loading kits...
          </p>
        </div>
      ) : packs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-neutral-300 text-center space-y-3">
          <Boxes className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-extrabold text-neutral-700 text-base">
            No kits yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Click "+ Create New Kit" to group existing products into a kit.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-warning-500 text-white text-xs font-extrabold rounded-xl hover:bg-warning-600 transition"
          >
            Create your first kit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => {
            const includedProds = products.filter((p) =>
              pack.productIds.includes(p.id),
            );
            return (
              <div
                key={pack.id}
                className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-warning-50 text-warning-600 font-extrabold text-[10px] uppercase tracking-wider rounded-lg mb-1">
                        Kit of {pack.productIds.length}
                      </span>
                      <h3 className="font-extrabold text-neutral-800 text-base leading-snug">
                        {pack.name}
                      </h3>
                      {pack.slug && (
                        <p className="mt-0.5 text-[11px] font-semibold text-neutral-400">
                          /product/{pack.slug}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-neutral-900">
                        ₹{pack.price}
                      </p>
                      {pack.originalPrice && (
                        <p className="text-xs font-semibold text-neutral-400 line-through">
                          ₹{pack.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  {pack.description && (
                    <p className="text-xs text-neutral-500 line-clamp-2">
                      {pack.description}
                    </p>
                  )}

                  {/* Included Items Thumbnails */}
                  <div>
                    <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2">
                      Included Products ({includedProds.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {includedProds.slice(0, 6).map((p) => (
                        <div
                          key={p.id}
                          className="w-9 h-9 rounded-xl border border-neutral-100 bg-neutral-50 overflow-hidden relative group/img"
                          title={p.name}
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {includedProds.length > 6 && (
                        <div className="w-9 h-9 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center font-extrabold text-xs border border-warning-100">
                          +{includedProds.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      pack.inStock
                        ? "bg-success-100 text-success-700"
                        : "bg-danger-100 text-danger-700"
                    }`}
                  >
                    {pack.inStock ? "In Stock" : "Out of Stock"}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(pack)}
                      className="p-2 text-neutral-600 hover:text-warning-600 hover:bg-warning-50 rounded-xl transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pack.id)}
                      className="p-2 text-neutral-600 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 p-4 backdrop-blur-xs">
          <div className="mx-auto my-8 w-full max-w-2xl space-y-6 rounded-3xl border border-neutral-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-2">
                <Boxes className="w-6 h-6 text-warning-500" />
                <h2 className="text-lg font-extrabold text-neutral-800">
                  {editingPack ? "Edit kit" : "New kit"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pack Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                    Kit title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Space Figurines - Kit of 5"
                    value={name}
                    onChange={(e) => {
                      const next = e.target.value;
                      setName(next);
                      if (!slugTouched) setSlug(slugify(next));
                    }}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:outline-hidden focus:border-warning-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                    Page link
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 focus-within:border-warning-500 focus-within:bg-white">
                    <span className="shrink-0 pl-4 text-sm font-semibold text-neutral-400">/product/</span>
                    <input
                      type="text"
                      required
                      placeholder="kit-of-5"
                      value={slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setSlug(e.target.value.toLowerCase());
                      }}
                      onBlur={() => setSlug((value) => slugify(value))}
                      className="w-full bg-transparent px-1 py-2.5 text-sm font-semibold text-neutral-800 focus:outline-hidden"
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-neutral-400">
                    This is the kit URL. Changing it replaces the old link.
                  </p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                    Kit price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="799"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:outline-hidden focus:border-warning-500 focus:bg-white"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider">
                      Original Price (₹)
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold normal-case tracking-normal text-neutral-600">
                      <input
                        type="checkbox"
                        checked={showOriginalPrice}
                        onChange={(e) => setShowOriginalPrice(e.target.checked)}
                        className="rounded-sm text-warning-500"
                      />
                      Show
                    </label>
                  </div>
                  <input
                    type="number"
                    readOnly
                    value={calculatedOriginalPrice}
                    className="w-full px-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700"
                  />
                  <p className="mt-1 text-[10px] font-semibold text-neutral-400">
                    Sum of selected product prices
                  </p>
                </div>

                {/* Product Line */}
                <div>
                  <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                    Product Line (Optional)
                  </label>
                  <select
                    value={productLineId}
                    onChange={(e) => setProductLineId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:outline-hidden focus:border-warning-500 focus:bg-white"
                  >
                    <option value="">Select Product Line...</option>
                    {productLines.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                    Category (Optional)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:outline-hidden focus:border-warning-500 focus:bg-white"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short summary of what's inside this kit..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:outline-hidden focus:border-warning-500 focus:bg-white"
                  />
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                    Cover image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:outline-hidden focus:border-warning-500 focus:bg-white"
                  />
                  <p className="mt-1 text-[10px] font-semibold text-neutral-400">
                    Optional. Uses the first selected product photo when empty.
                  </p>
                </div>
              </div>

              {/* PRODUCT SELECTION CHECKLIST */}
              <div className="space-y-3 border-t border-neutral-100 pt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="block text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
                      Select products for this kit *
                    </label>
                    <p className="text-[11px] font-semibold text-warning-600">
                      {selectedProductIds.length} products selected · Total ₹
                      {calculatedOriginalPrice}
                    </p>
                  </div>

                  {/* Search Products */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 focus:outline-hidden focus:border-warning-500"
                    />
                  </div>
                </div>

                {/* Products List Checklist */}
                <div className="max-h-56 overflow-y-auto border border-neutral-200 rounded-2xl p-2 space-y-1.5 bg-neutral-50">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductSelection(p.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? "bg-warning-50 border border-warning-200 text-warning-900 font-bold"
                            : "bg-white border border-neutral-100 hover:bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-warning-600 shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-neutral-300 shrink-0" />
                          )}
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover border border-neutral-200 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-extrabold leading-tight">
                              {p.name}
                            </p>
                            <span className="text-[10px] text-neutral-400 font-medium">
                              {p.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-neutral-800">
                          ₹{p.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-neutral-500 font-bold text-xs hover:bg-neutral-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-warning-500 hover:bg-warning-600 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  {editingPack ? "Update kit" : "Save kit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
