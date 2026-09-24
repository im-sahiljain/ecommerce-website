"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import {
  Sparkles,
  Check,
  Plus,
  ShoppingBag,
  Tag,
  Ticket,
  X,
  Info,
  ArrowRight,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  theme: string;
  category: string;
  productLineId?: string;
  isNonToxic?: boolean;
}

interface BundleTier {
  quantity: number;
  discountType: "percentage" | "flat";
  discountValue: number;
}

interface BundleRule {
  id: string;
  name: string;
  description?: string;
  applicableScope: "all" | "productLine" | "category" | "theme";
  scopeValue?: string;
  requirementMode?: "exact" | "min_threshold";
  tiers: BundleTier[];
  isActive: boolean;
}

export default function BundlesPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [bundleRules, setBundleRules] = useState<BundleRule[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then((res) => res.json()),
      fetch('/api/bundles').then((res) => res.json()),
    ])
      .then(([prodsData, bundlesData]) => {
        if (Array.isArray(bundlesData)) {
          const active = bundlesData.filter((r: any) => r.isActive !== false);
          setBundleRules(active);
          if (active.length > 0) setSelectedBundleId(active[0].id);
        }
        if (Array.isArray(prodsData)) {
          setProducts(prodsData.filter((p: any) => p.isVisible !== false));
        }
      })
      .catch((err) => console.error("Error loading bundle data:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeBundle =
    bundleRules.find((b) => b.id === selectedBundleId) || bundleRules[0];
  const count = selectedProducts.length;

  // Filter products matching active bundle scope
  const filteredProducts = products.filter((p) => {
    if (
      !activeBundle ||
      !activeBundle.applicableScope ||
      activeBundle.applicableScope === "all"
    )
      return true;
    if (activeBundle.applicableScope === "theme") {
      return p.theme
        .toLowerCase()
        .includes((activeBundle.scopeValue || "").toLowerCase());
    }
    if (activeBundle.applicableScope === "category") {
      return p.category
        .toLowerCase()
        .includes((activeBundle.scopeValue || "").toLowerCase());
    }
    if (activeBundle.applicableScope === "productLine") {
      return p.productLineId === activeBundle.scopeValue;
    }
    return true;
  });

  // Calculate discount based on exact mode or min_threshold mode
  const mode = activeBundle?.requirementMode || "exact";
  const tiers =
    activeBundle?.tiers && activeBundle.tiers.length > 0
      ? [...activeBundle.tiers].sort((a, b) => a.quantity - b.quantity)
      : [
          {
            quantity: 3,
            discountType: "percentage" as const,
            discountValue: 10,
          },
          {
            quantity: 5,
            discountType: "percentage" as const,
            discountValue: 15,
          },
        ];

  const getApplicableDiscount = () => {
    if (!activeBundle) return 0;
    if (mode === "exact") {
      const matchedTier = tiers.find((t) => t.quantity === count);
      return matchedTier ? matchedTier.discountValue : 0;
    } else {
      const matchedTier = [...tiers]
        .sort((a, b) => b.quantity - a.quantity)
        .find((t) => count >= t.quantity);
      return matchedTier ? matchedTier.discountValue : 0;
    }
  };

  const discountPercent = getApplicableDiscount();

  const subtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalPrice = subtotal - discountAmount;

  // Toggle selection (No Plus / Minus)
  const toggleSelectProduct = (product: Product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleSelectBundle = (ruleId: string) => {
    setSelectedBundleId(ruleId);
    setSelectedProducts([]);
    setIsCouponModalOpen(false);
  };

  const handleAddBundleToCart = () => {
    selectedProducts.forEach((p) => {
      addToCart(
        {
          id: p.id,
          name: p.name,
          price: p.price * (1 - discountPercent / 100),
          image: p.image,
        },
        1,
      );
    });
    setSelectedProducts([]);
  };

  const targetQty = tiers[0]?.quantity || 3;
  const isExactMatched =
    mode === "exact"
      ? tiers.some((t) => t.quantity === count)
      : count >= targetQty;
  const isValidToCheckout = count > 0 && discountPercent > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-100 via-yellow-100 to-sky-100 p-8 rounded-3xl border border-slate-100 soft-shadow mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-white/80 backdrop-blur-xs rounded-full text-xs font-extrabold text-pink-600 shadow-xs mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Custom Package Builder</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              {activeBundle
                ? activeBundle.name
                : "Mix & Match Craft & Candle Bundles"}
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {activeBundle?.description ||
                "Select items to build your custom package and save on bulk orders."}
            </p>
          </div>

          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <Ticket className="w-4 h-4 text-amber-300" />
            <span>See Available Bundles ({bundleRules.length})</span>
          </button>
        </div>

        {/* Selected Bundle Details Strip */}
        {activeBundle && (
          <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
            <span className="px-3 py-1 bg-white rounded-full text-slate-800 shadow-2xs border">
              Active Offer:{" "}
              <strong className="text-pink-600">{activeBundle.name}</strong>
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              Scope: {activeBundle.applicableScope.toUpperCase()}{" "}
              {activeBundle.scopeValue ? `(${activeBundle.scopeValue})` : ""}
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              Requirement:{" "}
              {activeBundle.requirementMode === "exact"
                ? "EXACT Quantity Match"
                : "Minimum Item Threshold"}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Selection Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <span>Select Items for Your Package</span>
              <span className="text-xs text-slate-400 font-semibold">
                ({filteredProducts.length} Eligible Items)
              </span>
            </h2>
            <span className="text-xs font-extrabold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
              {count} items selected
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-3xl border border-slate-100 bg-white animate-pulse flex space-x-3 items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border text-slate-500 font-bold text-xs">
              No products found matching this bundle scope. Try selecting
              another bundle from "See Available Bundles".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.some(
                  (p) => p.id === product.id,
                );

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleSelectProduct(product)}
                    className={`p-4 rounded-3xl border cursor-pointer transition relative flex space-x-3 items-center ${
                      isSelected
                        ? "border-pink-500 bg-pink-50/70 shadow-md ring-2 ring-pink-300"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider">
                        {product.theme || product.category}
                      </span>
                      <h3 className="font-extrabold text-xs text-slate-800 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        ₹{product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Single Select Button (NO PLUS / MINUS) */}
                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="px-3 py-1.5 bg-pink-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow-2xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition">
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                          <span>Select</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bundle Summary Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow h-fit space-y-6 sticky top-24">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-800">
                Package Summary
              </h3>
              <span className="text-xs font-extrabold text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full">
                {count} items
              </span>
            </div>

            {/* Requirement Mode Validation Card */}
            <div className="mt-4 space-y-2">
              {mode === "exact" ? (
                /* EXACT QUANTITY MODE STATUS */
                discountPercent > 0 ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <p className="text-xs font-extrabold text-emerald-800 flex items-center space-x-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>
                        Exact {count} Items Selected — {discountPercent}% OFF
                        Unlocked!
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <p className="text-xs font-bold text-amber-800 flex items-center space-x-1.5">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {count === 0
                          ? `Select EXACTLY ${targetQty} items to get discount.`
                          : `Select ${targetQty - count > 0 ? `${targetQty - count} more item(s)` : "exact tier items"} for this offer.`}
                      </span>
                    </p>
                  </div>
                )
              ) : /* MIN THRESHOLD MODE STATUS */
              discountPercent > 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <p className="text-xs font-extrabold text-emerald-800 flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>
                      Threshold Reached! {discountPercent}% OFF Applied!
                    </span>
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-pink-50 border border-pink-100 rounded-2xl">
                  <p className="text-xs font-bold text-pink-700 flex items-center space-x-1.5">
                    <Tag className="w-4 h-4 text-pink-500" />
                    <span>
                      Add {targetQty - count} more item(s) to reach minimum{" "}
                      {targetQty} items!
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Items List */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Selected Items
            </h4>
            {selectedProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Click "Select" on any product on the left.
              </p>
            ) : (
              selectedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center text-xs pb-2 border-b border-slate-50"
                >
                  <span className="font-bold text-slate-700 truncate max-w-44">
                    {p.name}
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{p.price.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Subtotal ({count} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Bundle Discount ({discountPercent}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-2 border-t border-slate-100">
              <span>Final Package Price</span>
              <span className="text-pink-600">₹{finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleAddBundleToCart}
            disabled={!isValidToCheckout}
            className="w-full py-4 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center justify-center space-x-2 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              Add Package to Basket ({count} items) — ₹{finalPrice.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {/* SEE AVAILABLE BUNDLES COUPONS MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <div className="flex items-center space-x-2">
                <Ticket className="w-6 h-6 text-pink-500" />
                <h3 className="font-extrabold text-lg text-slate-800">
                  Available Bundle Coupons & Deals
                </h3>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundleRules.map((rule) => {
                const isCurrent = rule.id === selectedBundleId;

                return (
                  <div
                    key={rule.id}
                    className={`p-5 rounded-3xl border space-y-3 flex flex-col justify-between transition ${
                      isCurrent
                        ? "border-pink-500 bg-pink-50/50 shadow-md ring-2 ring-pink-300"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-sm text-slate-800">
                          {rule.name}
                        </h4>
                        {isCurrent && (
                          <span className="px-2.5 py-0.5 bg-pink-500 text-white font-extrabold text-[10px] rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {rule.description || "Special category bundle offer."}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-extrabold">
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                          Scope: {rule.applicableScope.toUpperCase()}{" "}
                          {rule.scopeValue ? `(${rule.scopeValue})` : ""}
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                          {rule.requirementMode === "exact"
                            ? "EXACT Qty Mode"
                            : "Min Threshold Mode"}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t space-y-1 text-xs font-bold text-slate-700">
                        {rule.tiers.map((t, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {rule.requirementMode === "exact"
                                ? `Buy EXACTLY ${t.quantity} items`
                                : `Buy ${t.quantity}+ items`}
                              :
                            </span>
                            <span className="text-pink-600 font-extrabold">
                              {t.discountValue}% OFF
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectBundle(rule.id)}
                      disabled={isCurrent}
                      className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition ${
                        isCurrent
                          ? "bg-pink-200 text-pink-800 cursor-default"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                      }`}
                    >
                      {isCurrent ? (
                        "Bundle Selected"
                      ) : (
                        <span className="inline-flex items-center space-x-1.5">
                          <span>Select This Bundle Offer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
