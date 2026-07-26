"use client";

import React, { useState, useEffect } from "react";
import { Gift, Plus, Edit2, Trash2 } from "lucide-react";
import { adminFetch } from "../../config/auth";
import { API_BASE_URL } from "../../config/api";

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
  priority: number;
}

export default function BundlesAdminPage() {
  const [rules, setRules] = useState<BundleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BundleRule | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [applicableScope, setApplicableScope] = useState<
    "all" | "productLine" | "category" | "theme"
  >("all");
  const [scopeValue, setScopeValue] = useState("");
  const [requirementMode, setRequirementMode] = useState<
    "exact" | "min_threshold"
  >("exact");
  const [tier1Qty, setTier1Qty] = useState(3);
  const [tier1Value, setTier1Value] = useState(10);
  const [tier2Qty, setTier2Qty] = useState(5);
  const [tier2Value, setTier2Value] = useState(15);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = () => {
    adminFetch('/api/bundles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRules(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const openAddModal = () => {
    setEditingRule(null);
    setName("");
    setDescription("");
    setApplicableScope("all");
    setScopeValue("");
    setRequirementMode("exact");
    setTier1Qty(3);
    setTier1Value(10);
    setTier2Qty(5);
    setTier2Value(15);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: BundleRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description || "");
    setApplicableScope(rule.applicableScope || "all");
    setScopeValue(rule.scopeValue || "");
    setRequirementMode(rule.requirementMode || "exact");
    if (rule.tiers && rule.tiers.length > 0) {
      setTier1Qty(rule.tiers[0].quantity);
      setTier1Value(rule.tiers[0].discountValue);
    }
    if (rule.tiers && rule.tiers.length > 1) {
      setTier2Qty(rule.tiers[1].quantity);
      setTier2Value(rule.tiers[1].discountValue);
    }
    setIsActive(rule.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      applicableScope,
      scopeValue,
      requirementMode,
      tiers: [
        {
          quantity: Number(tier1Qty),
          discountType: "percentage",
          discountValue: Number(tier1Value),
        },
        {
          quantity: Number(tier2Qty),
          discountType: "percentage",
          discountValue: Number(tier2Value),
        },
      ].filter((t) => t.quantity > 0 && t.discountValue > 0),
      isActive,
      priority: 1,
    };

    try {
      const url = editingRule
        ? `/api/bundles/${editingRule.id}`
        : '/api/bundles';
      const method = editingRule ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchRules();
      }
    } catch (err) {
      console.warn("Save bundle rule failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle offer?")) return;
    try {
      const res = await adminFetch(`/api/bundles/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchRules();
    } catch (err) {
      console.warn("Delete rule failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Bundle Rules & Coupon Engine
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Create exact-quantity or minimum-threshold bundles for storewide,
            product lines, categories, or themes.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bundle Coupon</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 font-bold">
          Loading bundle rules...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 bg-pink-100 text-pink-600 rounded-xl">
                      <Gift className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800">
                        {rule.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {rule.description || "Special package bundle discount"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                      rule.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {rule.isActive ? "Active Coupon" : "Disabled"}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-extrabold">
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
                    Scope: {rule.applicableScope.toUpperCase()}{" "}
                    {rule.scopeValue ? `(${rule.scopeValue})` : ""}
                  </span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                    Mode:{" "}
                    {rule.requirementMode === "exact"
                      ? "Exact Item Count"
                      : "Minimum Threshold"}
                  </span>
                </div>

                {/* Tiers List */}
                <div className="mt-4 pt-3 border-t space-y-1.5">
                  {rule.tiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs font-bold text-slate-700"
                    >
                      <span>
                        {rule.requirementMode === "exact"
                          ? `Buy Exactly ${tier.quantity} items`
                          : `Buy ${tier.quantity}+ items`}
                        :
                      </span>
                      <span className="text-pink-600 font-extrabold">
                        {tier.discountValue}% OFF
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t pt-3">
                <button
                  onClick={() => openEditModal(rule)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Bundle</span>
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-extrabold text-base text-slate-800 border-b pb-3">
              {editingRule
                ? `Edit Bundle Coupon: ${editingRule.name}`
                : "Create New Bundle Coupon"}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bundle Offer Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Space Explorer 3-Pack Deal"
                required
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Subtitle
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Select 3 Space theme kits to get 15% OFF!"
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Applicable Scope
                </label>
                <select
                  value={applicableScope}
                  onChange={(e) => setApplicableScope(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold"
                >
                  <option value="all">Storewide (All Products)</option>
                  <option value="productLine">Product Line Specific</option>
                  <option value="category">Category Specific</option>
                  <option value="theme">Theme Specific</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scope Value (ID / Name)
                </label>
                <input
                  type="text"
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  placeholder="e.g. Space Adventures or line-2"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requirement Mode
              </label>
              <select
                value={requirementMode}
                onChange={(e) => setRequirementMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold"
              >
                <option value="exact">
                  Exact Item Quantity (Must pick EXACT N items)
                </option>
                <option value="min_threshold">
                  Minimum Item Threshold (At least N items)
                </option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800">
                Discount Tiers
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tier 1 Item Qty
                  </label>
                  <input
                    type="number"
                    value={tier1Qty}
                    onChange={(e) => setTier1Qty(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tier 1 Discount %
                  </label>
                  <input
                    type="number"
                    value={tier1Value}
                    onChange={(e) => setTier1Value(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border rounded-xl text-xs font-bold text-pink-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tier 2 Item Qty (Optional)
                  </label>
                  <input
                    type="number"
                    value={tier2Qty}
                    onChange={(e) => setTier2Qty(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tier 2 Discount %
                  </label>
                  <input
                    type="number"
                    value={tier2Value}
                    onChange={(e) => setTier2Value(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border rounded-xl text-xs font-bold text-pink-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-pink-500"
                />
                <span>Active Bundle Offer</span>
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
                  Save Bundle Offer
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
