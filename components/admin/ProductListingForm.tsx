"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { adminFetch } from "@/config/adminAuth";
import { normalizeGallery, type ProductGallery } from "@/lib/gallery";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/components/home/homepageSections";

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
  gallery?: ProductGallery | null;
  description: string;
  stockQuantity?: number;
  isOrderingEnabled?: boolean;
  badge?: string;
  isNewLaunch?: boolean;
  isSellingFast?: boolean;
  size?: string;
  material?: string;
  isVisible?: boolean;
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

export default function ProductListingForm({
  productId,
  duplicateId,
}: {
  productId?: string;
  duplicateId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(productId);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [productLineId, setProductLineId] = useState("");
  const [category, setCategory] = useState("");
  const [theme, setTheme] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [isNonToxic, setIsNonToxic] = useState(true);
  const [isOrderingEnabled, setIsOrderingEnabled] = useState(true);
  const [isNewLaunch, setIsNewLaunch] = useState(false);
  const [isSellingFast, setIsSellingFast] = useState(false);
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [image, setImage] = useState("");
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [exampleFlags, setExampleFlags] = useState<boolean[]>([]);
  const [galleryNote, setGalleryNote] = useState("");
  const [includedLabel, setIncludedLabel] = useState("");
  const [exampleLabel, setExampleLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState(25);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [productRes, lineRes, categoryRes] = await Promise.all([
        adminFetch("/api/products")
          .then((res) => res.json())
          .catch(() => []),
        adminFetch("/api/product-lines")
          .then((res) => res.json())
          .catch(() => []),
        adminFetch("/api/categories")
          .then((res) => res.json())
          .catch(() => []),
      ]);
      const loadedProducts = Array.isArray(productRes) ? productRes : [];
      const loadedLines = Array.isArray(lineRes) ? lineRes : [];
      const loadedCategories = Array.isArray(categoryRes) ? categoryRes : [];

      const sourceId = productId || duplicateId;
      let source: Product | null = null;
      if (sourceId) {
        const res = await adminFetch(`/api/products/${sourceId}`);
        if (res.ok) source = await res.json();
        else if (productId) {
          if (!cancelled) {
            setMissing(true);
            setReady(true);
          }
          return;
        }
      }

      if (cancelled) return;
      setProducts(loadedProducts);
      setProductLines(loadedLines);
      setCategoriesList(loadedCategories);

      if (source) {
        fillFromProduct(source, Boolean(duplicateId));
      } else {
        const initialLine = loadedLines[0]?.id || "line-1";
        const initialCats = loadedCategories
          .filter((c) => !c.productLineId || c.productLineId === initialLine)
          .map((c) => c.name);
        setSku(`SKU-${Date.now().toString().slice(-6)}`);
        setProductLineId(initialLine);
        setCategory(initialCats[0] || "General");
      }
      setReady(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId, duplicateId]);

  const fillFromProduct = (p: Product, asCopy: boolean) => {
    setName(asCopy ? `${p.name} (Copy)` : p.name);
    setSku(
      asCopy
        ? `SKU-${Date.now().toString().slice(-6)}`
        : p.sku || `SKU-${Date.now().toString().slice(-6)}`,
    );
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setCostPrice(p.costPrice ? String(p.costPrice) : "");
    setProductLineId(p.productLineId || "line-1");
    setCategory(p.category);
    setTheme(p.theme || "");
    setAgeGroup(p.ageGroup || "");
    setIsNonToxic(p.isNonToxic);
    setIsOrderingEnabled(
      p.isOrderingEnabled !== undefined ? p.isOrderingEnabled : true,
    );
    setIsNewLaunch(
      p.isNewLaunch !== undefined
        ? Boolean(p.isNewLaunch)
        : Boolean(p.badge?.includes("New")),
    );
    setIsSellingFast(
      p.isSellingFast !== undefined
        ? Boolean(p.isSellingFast)
        : Boolean(p.badge?.includes("Selling")),
    );
    setSize(p.size || "");
    setMaterial(p.material || "");
    setIsVisible(p.isVisible !== false);
    setImage(p.image || "");
    const photos =
      p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
    const examples = new Set(p.gallery?.exampleIndexes || []);
    setImagesList(photos);
    setExampleFlags(photos.map((_, index) => examples.has(index)));
    setGalleryNote(p.gallery?.note || "");
    setIncludedLabel(p.gallery?.includedLabel || "");
    setExampleLabel(p.gallery?.exampleLabel || "");
    setDescription(p.description || "");
    setStockQuantity(p.stockQuantity !== undefined ? p.stockQuantity : 10);
  };

  const homepageThemeNames = DEFAULT_HOMEPAGE_SECTIONS.map(
    (section) => section.themeKeyword,
  ).filter(Boolean);

  const categoryNamesForLine = (lineId: string) => {
    const fromCategories = categoriesList
      .filter((c) => !c.productLineId || c.productLineId === lineId)
      .map((c) => c.name);
    if (fromCategories.length > 0) return Array.from(new Set(fromCategories));
    return Array.from(
      new Set(
        products
          .filter((p) => !p.productLineId || p.productLineId === lineId)
          .map((p) => p.category)
          .filter(Boolean),
      ),
    );
  };

  const themeNamesForLine = (lineId: string) =>
    Array.from(
      new Set([
        ...homepageThemeNames,
        ...products
          .filter((p) => !p.productLineId || p.productLineId === lineId)
          .map((p) => p.theme)
          .filter(Boolean),
      ]),
    );

  const availableCategories = categoryNamesForLine(productLineId);
  const availableThemes = themeNamesForLine(productLineId);

  const handleProductLineChange = (newLineId: string) => {
    setProductLineId(newLineId);
    const newCats = categoryNamesForLine(newLineId);
    setCategory((current) => (newCats.includes(current) ? current : ""));
    const newThemes = themeNamesForLine(newLineId);
    setTheme((current) =>
      current && newThemes.includes(current) ? current : "",
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      let fileToUpload = files[i];
      if (fileToUpload.size > 1.8 * 1024 * 1024) {
        try {
          fileToUpload = await imageCompression(fileToUpload, {
            maxSizeMB: 1.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
        } catch (compressErr) {
          console.warn("Auto compression notice:", compressErr);
        }
      }

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
        if (res.ok && data.url) uploadedUrls.push(data.url);
        else throw new Error(data.error || "Failed to upload image");
      } catch (err: any) {
        setUploadError(err.message || "Image upload error");
        setUploading(false);
        return;
      }
    }

    setImagesList((prev) => [...prev, ...uploadedUrls]);
    setExampleFlags((prev) => [...prev, ...uploadedUrls.map(() => false)]);
    if (uploadedUrls.length > 0 && !image) setImage(uploadedUrls[0]);
    setUploading(false);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setImagesList((prev) => [...prev, url]);
    setExampleFlags((prev) => [...prev, false]);
    if (!image) setImage(url);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const updated = imagesList.filter((_, i) => i !== index);
    setImagesList(updated);
    setExampleFlags((flags) => flags.filter((_, i) => i !== index));
    setImage(updated[0] || "");
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagesList.length) return;
    const updated = [...imagesList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImagesList(updated);
    setExampleFlags((flags) => {
      const next = imagesList.map((_, index) => Boolean(flags[index]));
      const [movedFlag] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedFlag);
      return next;
    });
    setImage(updated[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
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
      isNewLaunch,
      isSellingFast,
      size: size.trim() || undefined,
      material: material.trim() || undefined,
      isVisible,
      image: finalImages[0],
      images: finalImages,
      gallery:
        normalizeGallery({
          note: galleryNote,
          includedLabel,
          exampleLabel,
          exampleIndexes: exampleFlags.flatMap((flag, index) =>
            flag ? [index] : [],
          ),
        }) || null,
      description,
      stockQuantity: Number(stockQuantity),
      inStock: Number(stockQuantity) > 0,
    };

    const res = editing
      ? await adminFetch(`/api/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await adminFetch("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (res.ok) router.push("/admin/products");
  };

  if (!ready) {
    return (
      <p className="py-16 text-center text-xs font-bold text-neutral-500">
        Loading product form...
      </p>
    );
  }

  if (missing) {
    return (
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm font-bold text-neutral-700">
          This product was not found.
        </p>
        <Link href="/admin/products" className="text-xs font-bold text-primary">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Products
        </Link>
        <h1 className="mt-2 text-xl font-extrabold text-neutral-800 sm:text-2xl">
          {editing ? "Edit Product Listing" : "Add New Product Listing"}
        </h1>
      </div>

      <div className="space-y-4 rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-700">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lavender Soy Candle"
              required
              className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-700">
              SKU Code
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="CND-LAV-01"
              required
              className="w-full rounded-xl border bg-neutral-50 px-3 py-2 font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
          <h2 className="border-b pb-1 text-xs font-extrabold text-neutral-800">
            Catalog Classification
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-neutral-700">
                1. Product Line
              </label>
              <select
                value={productLineId}
                onChange={(e) => handleProductLineChange(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2 text-xs font-semibold focus:border-primary/70 focus:outline-hidden"
              >
                {productLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-neutral-700">
                2. Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2 text-xs font-semibold focus:border-primary/70 focus:outline-hidden"
              >
                {availableCategories.map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-neutral-700">
                3. Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2 text-xs font-semibold focus:border-primary/70 focus:outline-hidden"
              >
                <option value="">No theme</option>
                {availableThemes.map((themeName) => (
                  <option key={themeName} value={themeName}>
                    {themeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-700">
              Selling Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="499"
              required
              className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-700">
              Original Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="599"
              className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-700">
              Initial Stock Quantity
            </label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              required
              className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-xs font-bold"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/90 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-800">
                <ImageIcon className="h-4 w-4 text-primary" />
                Product Images Upload (Cloudinary)
              </h2>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Cloudinary Folder:{" "}
                <code className="rounded-sm bg-neutral-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-neutral-800">
                  Ecommerce / Products / {name.trim() || "(Product Name)"}
                </code>
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-primary/25 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
              Max 2 MB / file
            </span>
          </div>

          {uploadError && (
            <div className="flex items-center justify-between rounded-xl border border-danger-200 bg-danger-50 p-2.5 text-xs font-semibold text-danger-700">
              <span>{uploadError}</span>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-danger-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-neutral-300 bg-white p-4 text-center transition hover:border-primary/70">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center space-y-1">
              <Plus className="h-6 w-6 text-primary transition group-hover:scale-110" />
              <p className="text-xs font-bold text-neutral-700">
                {uploading
                  ? "Uploading to Cloudinary..."
                  : "Click or Drag & Drop Images to Upload"}
              </p>
              <p className="text-[10px] font-medium text-neutral-400">
                Supports PNG, JPG, WEBP (Limit 2 MB per image)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Or paste external image URL (https://...)"
              className="flex-1 rounded-xl border bg-white px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="rounded-xl bg-neutral-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-900"
            >
              Add URL
            </button>
          </div>

          {imagesList.length > 0 && (
            <div className="space-y-2 border-t border-neutral-200 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-neutral-800">
                  Product Gallery Sequence ({imagesList.length} images):
                </p>
                <span className="text-[10px] font-medium text-neutral-500">
                  Use the arrows to sort display order
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {imagesList.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className={`flex flex-col justify-between overflow-hidden rounded-2xl border-2 bg-white shadow-2xs ${
                      idx === 0
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-neutral-200"
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                      <img
                        src={imgUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-xs ${
                          idx === 0
                            ? "bg-primary text-white"
                            : "bg-neutral-900/80 text-white"
                        }`}
                      >
                        {idx === 0 ? "Main (#1)" : `#${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        aria-label="Delete image"
                        className="absolute right-1.5 top-1.5 rounded-full bg-danger-600/90 p-1.5 text-white hover:bg-danger-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 p-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, idx - 1)}
                        disabled={idx === 0}
                        className="rounded-lg border border-neutral-200 bg-white p-1 text-neutral-700 disabled:opacity-30"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      {idx !== 0 ? (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 0)}
                          className="flex items-center gap-1 rounded-lg bg-primary/15 px-2 py-1 text-[10px] font-extrabold text-primary hover:bg-primary/25"
                        >
                          <Star className="h-3 w-3 fill-current" />
                          Set Main
                        </button>
                      ) : (
                        <span className="px-1 text-[10px] font-extrabold text-primary">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, idx + 1)}
                        disabled={idx === imagesList.length - 1}
                        className="rounded-lg border border-neutral-200 bg-white p-1 text-neutral-700 disabled:opacity-30"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExampleFlags((flags) => {
                          const next = imagesList.map((_, index) =>
                            Boolean(flags[index]),
                          );
                          next[idx] = !next[idx];
                          return next;
                        })
                      }
                      className={`border-t px-2 py-1.5 text-[10px] font-extrabold ${
                        exampleFlags[idx]
                          ? "bg-warning-100 text-neutral-900"
                          : "bg-white text-neutral-500"
                      }`}
                    >
                      {exampleFlags[idx] ? "Example photo" : "Mark as example"}
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3">
                <label className="block text-[11px] font-extrabold text-neutral-800">
                  Buyer note
                </label>
                <textarea
                  value={galleryNote}
                  onChange={(e) => setGalleryNote(e.target.value)}
                  rows={2}
                  placeholder="Optional. Shown on the product page. Leave blank when every photo is the item that ships."
                  className="w-full rounded-xl border bg-white px-3 py-2 text-xs"
                />
                {exampleFlags.some(Boolean) && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="block text-[11px] font-bold text-neutral-700">
                      Label on photos that ship
                      <input
                        value={includedLabel}
                        onChange={(e) => setIncludedLabel(e.target.value)}
                        placeholder="In the Box"
                        className="mt-1 w-full rounded-xl border bg-white px-3 py-1.5 text-xs font-semibold"
                      />
                    </label>
                    <label className="block text-[11px] font-bold text-neutral-700">
                      Label on example photos
                      <input
                        value={exampleLabel}
                        onChange={(e) => setExampleLabel(e.target.value)}
                        placeholder="Example"
                        className="mt-1 w-full rounded-xl border bg-white px-3 py-1.5 text-xs font-semibold"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/90 p-4">
          <h2 className="border-b pb-1 text-xs font-extrabold text-neutral-800">
            Badges & Specifications
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-neutral-700">
                Card Corner Badges
              </label>
              <div className="space-y-1 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={isNewLaunch}
                    onChange={(e) => setIsNewLaunch(e.target.checked)}
                    className="rounded-sm text-primary"
                  />
                  🎀 New Launch
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={isSellingFast}
                    onChange={(e) => setIsSellingFast(e.target.checked)}
                    className="rounded-sm text-primary"
                  />
                  🔥 Selling Fast
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-neutral-700">
                Age Group / Tag (Optional)
              </label>
              <input
                type="text"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                placeholder="e.g. Ages 4+"
                className="w-full rounded-xl border bg-white px-3 py-2 text-xs font-medium"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-neutral-700">
                Dimensions / Size (Optional)
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 8.5 cm x 6 cm"
                className="w-full rounded-xl border bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-neutral-700">
                Material (Optional)
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Gypsum"
                className="w-full rounded-xl border bg-white px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-700">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the kit..."
            required
            className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-xs"
          />
        </div>

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-neutral-700">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="rounded-sm text-primary"
              />
              Product active and visible on the website
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-neutral-700">
              <input
                type="checkbox"
                checked={isOrderingEnabled}
                onChange={(e) => setIsOrderingEnabled(e.target.checked)}
                className="rounded-sm text-primary"
              />
              Online purchasing enabled for this item
            </label>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="rounded-xl bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
