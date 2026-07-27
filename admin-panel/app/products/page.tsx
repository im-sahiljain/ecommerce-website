"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  X,
  Image as ImageIcon,
  Sliders,
  ArrowLeft,
  ArrowRight,
  Star,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { adminFetch } from "../../config/auth";

interface Product {
  id: string;
  sku?: string;
  name: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  productLineId?: string;
  isNonToxic: boolean;
  image: string;
  images?: string[];
  description: string;
  inStock: boolean;
  stockQuantity?: number;
  isOrderingEnabled?: boolean;
  status?: "Draft" | "Published" | "Hidden" | "Archived";
  createdAt?: string;
  updatedAt?: string;
}

interface ProductLine {
  id: string;
  name: string;
}

interface CategoryItem {
  id: string;
  name: string;
  productLineId?: string;
}

export default function ProductsManagerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [themesList, setThemesList] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(
    null,
  );
  const [stockChangeAmount, setStockChangeAmount] = useState(5);
  const [stockReason, setStockReason] = useState("Restock inventory");

  // Dynamic Form State (Initializes 100% dynamically from Database APIs)
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [productLineId, setProductLineId] = useState("");
  const [category, setCategory] = useState("");
  const [theme, setTheme] = useState("");

  // Filter Categories by selected Product Line dynamically
  const filteredCatList = categoriesList.filter(
    (c) => !c.productLineId || c.productLineId === productLineId,
  );
  const availableCategories = Array.from(
    new Set(
      filteredCatList.length > 0
        ? filteredCatList.map((c) => c.name)
        : products
            .filter((p) => !p.productLineId || p.productLineId === productLineId)
            .map((p) => p.category)
            .filter(Boolean),
    ),
  );

  // Filter Themes combining /api/themes database records & product themes dynamically
  const dbThemeNames = themesList.map((t) => t.name).filter(Boolean);
  const prodThemeNames = products
    .filter((p) => !p.productLineId || p.productLineId === productLineId)
    .map((p) => p.theme)
    .filter(Boolean);
  const availableThemes = Array.from(
    new Set([...dbThemeNames, ...prodThemeNames]),
  );

  const handleProductLineChange = (newLineId: string) => {
    setProductLineId(newLineId);

    const dbCats = categoriesList
      .filter((c) => !c.productLineId || c.productLineId === newLineId)
      .map((c) => c.name);
    const prodCats = products
      .filter((p) => !p.productLineId || p.productLineId === newLineId)
      .map((p) => p.category)
      .filter(Boolean);
    const newCats = Array.from(new Set([...dbCats, ...prodCats]));
    if (newCats.length > 0) {
      setCategory(newCats[0]);
    }

    const newThemes = Array.from(
      new Set([
        ...dbThemeNames,
        ...products
          .filter((p) => !p.productLineId || p.productLineId === newLineId)
          .map((p) => p.theme)
          .filter(Boolean),
      ]),
    );
    if (newThemes.length > 0) {
      setTheme(newThemes[0]);
    }
  };
  const [ageGroup, setAgeGroup] = useState("Ages 4+");
  const [isNonToxic, setIsNonToxic] = useState(true);
  const [isOrderingEnabled, setIsOrderingEnabled] = useState(true);
  const [image, setImage] = useState("");
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState(25);

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

    adminFetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategoriesList(data);
      })
      .catch(() => {});

    adminFetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setThemesList(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setSku(`SKU-${Date.now().toString().slice(-6)}`);
    setPrice("");
    setOriginalPrice("");
    setCostPrice("");

    const initialLine = productLines[0]?.id || "line-1";
    const initialCats = categoriesList
      .filter((c) => !c.productLineId || c.productLineId === initialLine)
      .map((c) => c.name);
    const initialThemes = Array.from(
      new Set([
        ...themesList.map((t) => t.name),
        ...products.map((p) => p.theme).filter(Boolean),
      ]),
    );

    setProductLineId(initialLine);
    setCategory(initialCats[0] || "General");
    setTheme(initialThemes[0] || "General");
    setAgeGroup("Ages 4+");
    setIsNonToxic(true);
    setIsOrderingEnabled(true);
    setImage("");
    setImagesList([]);
    setUploadError(null);
    setNewImageUrl("");
    setDescription("");
    setStockQuantity(25);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setSku(p.sku || `SKU-${Date.now().toString().slice(-6)}`);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setCostPrice(p.costPrice ? String(p.costPrice) : "");
    setProductLineId(p.productLineId || "line-1");
    setCategory(p.category);
    setTheme(p.theme);
    setAgeGroup(p.ageGroup);
    setIsNonToxic(p.isNonToxic);
    setIsOrderingEnabled(
      p.isOrderingEnabled !== undefined ? p.isOrderingEnabled : true,
    );
    setImage(p.image);
    setImagesList(
      p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
    );
    setUploadError(null);
    setNewImageUrl("");
    setDescription(p.description);
    setStockQuantity(p.stockQuantity !== undefined ? p.stockQuantity : 10);
    setIsModalOpen(true);
  };

  const openDuplicateModal = (p: Product) => {
    setEditingId(null);
    setName(`${p.name} (Copy)`);
    setSku(`SKU-${Date.now().toString().slice(-6)}`);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setCostPrice(p.costPrice ? String(p.costPrice) : "");
    setProductLineId(p.productLineId || "line-1");
    setCategory(p.category);
    setTheme(p.theme);
    setAgeGroup(p.ageGroup);
    setIsNonToxic(p.isNonToxic);
    setIsOrderingEnabled(
      p.isOrderingEnabled !== undefined ? p.isOrderingEnabled : true,
    );
    setImage(p.image);
    setImagesList(
      p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
    );
    setUploadError(null);
    setNewImageUrl("");
    setDescription(p.description);
    setStockQuantity(p.stockQuantity !== undefined ? p.stockQuantity : 10);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploading(true);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      let fileToUpload = files[i];

      // Auto-compress images larger than 1.8 MB using browser-image-compression
      if (fileToUpload.size > 1.8 * 1024 * 1024) {
        try {
          const options = {
            maxSizeMB: 1.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          fileToUpload = await imageCompression(fileToUpload, options);
        } catch (compressErr) {
          console.warn("Auto compression notice:", compressErr);
        }
      }

      // Final Size Validation (2 MB limit)
      if (fileToUpload.size > 2 * 1024 * 1024) {
        setUploadError(
          `File "${fileToUpload.name}" is too large even after compression (${(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller image.`,
        );
        setUploading(false);
        return;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToUpload);
        });

        const res = await adminFetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({
            image: base64,
            productName: name || "General",
          }),
        });

        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          throw new Error(data.error || "Failed to upload image");
        }
      } catch (err: any) {
        setUploadError(err.message || "Image upload error");
        setUploading(false);
        return;
      }
    }

    setImagesList((prev) => [...prev, ...uploadedUrls]);
    if (uploadedUrls.length > 0 && (!image || image === "")) {
      setImage(uploadedUrls[0]);
    }
    setUploading(false);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setImagesList((prev) => [...prev, url]);
    if (!image) setImage(url);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const updated = imagesList.filter((_, i) => i !== index);
    setImagesList(updated);
    if (updated.length > 0) {
      setImage(updated[0]);
    } else {
      setImage("");
    }
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagesList.length) return;
    const updated = [...imagesList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImagesList(updated);
    setImage(updated[0]);
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    handleMoveImage(index, 0);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product listing?")) {
      await adminFetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages =
      imagesList.length > 0
        ? imagesList
        : image
          ? [image]
          : [
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500",
            ];

    const payload = {
      sku,
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      productLineId,
      category,
      theme,
      ageGroup,
      isNonToxic,
      isOrderingEnabled,
      image: finalImages[0],
      images: finalImages,
      description,
      stockQuantity: Number(stockQuantity),
      inStock: Number(stockQuantity) > 0,
    };

    if (editingId) {
      await adminFetch(`/api/products/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await adminFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    setIsModalOpen(false);
    fetchProducts();
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

  // Filter categories by selected product line
  const filteredCategories = categoriesList.filter(
    (c) => !c.productLineId || c.productLineId === productLineId,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Products Catalog Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Granular product CRUD, SKU management, line & category assignment,
            and stock adjustments.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Craft / Candle Product</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
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
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const stock =
                p.stockQuantity !== undefined ? p.stockQuantity : 10;
              const isOrderOn = p.isOrderingEnabled !== false;
              const line = productLines.find((l) => l.id === p.productLineId);
              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 flex items-center space-x-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover border"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {p.sku || p.id}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-[10px]">
                      {line
                        ? line.name
                        : p.productLineId === "line-2"
                          ? "Wax Candles"
                          : "POP Figurines"}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    <span className="font-bold block text-slate-800">
                      {p.category}
                    </span>
                    <span className="text-[11px] text-pink-500 font-bold">
                      {p.theme}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-slate-800">
                    ₹{p.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setStockModalProduct(p)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1"
                    >
                      <span>{stock} units</span>
                      <Sliders className="w-3 h-3 text-slate-500" />
                    </button>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isOrderOn
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isOrderOn ? "Enabled" : "WhatsApp Only"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => openDuplicateModal(p)}
                      title="Duplicate / Clone Product"
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      title="Edit Product"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Delete Product"
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 w-full max-w-xl space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingId ? "Edit Product Listing" : "Add New Product Listing"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lavender Soy Candle"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SKU Code
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="CND-LAV-01"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* PRODUCT LINE, CATEGORY & THEME SELECTORS */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-800 border-b pb-1">
                Catalog Classification
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    1. Product Line
                  </label>
                  <select
                    value={productLineId}
                    onChange={(e) => handleProductLineChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                  >
                    {productLines.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    2. Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                  >
                    {availableCategories.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    3. Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400"
                  >
                    {availableThemes.map((themeName) => (
                      <option key={themeName} value={themeName}>
                        {themeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="499"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="599"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {/* MULTIPLE IMAGES UPLOAD (CLOUDINARY 2MB LIMIT & FOLDER STRUCTURE) */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>Product Images Upload (Cloudinary)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cloudinary Folder:{" "}
                    <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-800 font-bold">
                      Ecommerce / Products /{" "}
                      {name ? name.trim() : "(Product Name)"}
                    </code>
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full border border-pink-200">
                  Max 2 MB / file
                </span>
              </div>

              {/* Upload error alert */}
              {uploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center justify-between">
                  <span>⚠️ {uploadError}</span>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-rose-500 hover:text-rose-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Dropzone File Picker */}
              <div className="border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white rounded-xl p-4 text-center transition cursor-pointer relative group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center space-y-1">
                  <Plus className="w-6 h-6 text-pink-500 group-hover:scale-110 transition" />
                  <p className="text-xs font-bold text-slate-700">
                    {uploading
                      ? "Uploading to Cloudinary..."
                      : "Click or Drag & Drop Images to Upload"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Supports PNG, JPG, WEBP (Limit 2 MB per image)
                  </p>
                </div>
              </div>

              {/* URL Input Fallback */}
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Or paste external image URL (https://...)"
                  className="flex-1 px-3 py-1.5 bg-white border rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
                >
                  Add URL
                </button>
              </div>

              {/* Thumbnail Gallery Preview Grid & Sequence Controls */}
              {imagesList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-extrabold text-slate-800">
                      Product Gallery Sequence ({imagesList.length} images):
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Use ◀ / ▶ arrows to sort display order
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imagesList.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-2xl overflow-hidden border-2 bg-white flex flex-col justify-between shadow-xs transition ${
                          idx === 0
                            ? "border-pink-500 ring-2 ring-pink-200"
                            : "border-slate-200"
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />

                          {/* Sequence Badge */}
                          <span
                            className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm ${
                              idx === 0
                                ? "bg-pink-500 text-white"
                                : "bg-slate-900/80 backdrop-blur-xs text-white"
                            }`}
                          >
                            {idx === 0 ? "⭐ Main (#1)" : `#${idx + 1}`}
                          </span>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            aria-label="Delete image"
                            className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600/90 text-white rounded-full transition hover:bg-rose-700 hover:scale-110 shadow-xs cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Sequence & Main Control Bar */}
                        <div className="p-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                          {/* Move Left Button */}
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, idx - 1)}
                            disabled={idx === 0}
                            title="Move left in display order"
                            className={`p-1 rounded-lg border transition ${
                              idx === 0
                                ? "opacity-30 border-slate-200 text-slate-400 cursor-not-allowed"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                            }`}
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Set Main Button */}
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 text-[10px] font-extrabold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                            >
                              <Star className="w-3 h-3 fill-current" />
                              <span>Set Main</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-extrabold text-pink-600 px-1">
                              Primary
                            </span>
                          )}

                          {/* Move Right Button */}
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, idx + 1)}
                            disabled={idx === imagesList.length - 1}
                            title="Move right in display order"
                            className={`p-1 rounded-lg border transition ${
                              idx === imagesList.length - 1
                                ? "opacity-30 border-slate-200 text-slate-400 cursor-not-allowed"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                            }`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of craft set or wax candle..."
                required
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOrderingEnabled}
                  onChange={(e) => setIsOrderingEnabled(e.target.checked)}
                  className="rounded text-pink-500"
                />
                <span>Online Purchasing Enabled for this item</span>
              </label>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleStockAdjustment}
            className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="font-extrabold text-base text-slate-800 border-b pb-2">
              Adjust Stock for {stockModalProduct.name}
            </h3>

            <p className="text-xs text-slate-500">
              Current Stock:{" "}
              <strong className="text-slate-800">
                {stockModalProduct.stockQuantity !== undefined
                  ? stockModalProduct.stockQuantity
                  : 10}{" "}
                units
              </strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adjustment Quantity (+ to add, - to reduce)
              </label>
              <input
                type="number"
                value={stockChangeAmount}
                onChange={(e) => setStockChangeAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Note (Audit Trail)
              </label>
              <input
                type="text"
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
                placeholder="Restock from warehouse"
                required
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
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
