'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, Edit2, Layers } from 'lucide-react';
import { adminFetch } from "@/config/adminAuth";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productLineId?: string;
  isVisible?: boolean;
}

interface ProductLine {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productLineId, setProductLineId] = useState('line-1');
  const [isVisible, setIsVisible] = useState(true);

  const fetchCategories = () => {
    adminFetch('/api/categories')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});

    adminFetch('/api/product-lines')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProductLines(data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await adminFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description, productLineId, isVisible })
    });
    setName('');
    setDescription('');
    setIsVisible(true);
    fetchCategories();
  };

  const handleToggleVisibility = async (cat: Category) => {
    const updated = !cat.isVisible;
    await adminFetch(`/api/categories/${cat.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isVisible: updated })
    });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    await adminFetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Categories & Facets Management</h1>
        <p className="text-neutral-500 text-xs mt-1">Organize products into nested category trees linked to product lines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4 h-fit">
          <h3 className="font-extrabold text-sm text-neutral-800 border-b pb-2">Add New Category</h3>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Product Line Scope</label>
              <select
                value={productLineId}
                onChange={e => setProductLineId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border rounded-xl text-xs font-semibold"
              >
                {productLines.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Scented Candles"
                required
                className="w-full px-3 py-2 bg-neutral-50 border rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief category summary..."
                className="w-full px-3 py-2 bg-neutral-50 border rounded-xl text-xs"
              />
            </div>

            <label className="flex items-center space-x-2 text-xs font-bold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={e => setIsVisible(e.target.checked)}
                className="rounded-sm text-primary"
              />
              <span>Visible on Website</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 bg-neutral-50 border-b font-extrabold text-xs text-neutral-700 uppercase tracking-wider">
              Active Category Tree ({categories.length})
            </div>
            <div className="divide-y divide-neutral-100">
              {categories.map(cat => {
                const line = productLines.find(l => l.id === cat.productLineId);
                const active = cat.isVisible !== false;
                return (
                  <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/80 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-neutral-800">{cat.name}</span>
                        {line && (
                          <span className="px-2.5 py-0.5 bg-info-100 text-info-800 text-[10px] font-bold rounded-full">
                            {line.name}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-500'}`}>
                          {active ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{cat.description || 'No description'}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleVisibility(cat)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${active ? 'border-warning-200 bg-warning-50 text-warning-700 hover:bg-warning-100' : 'border-success-200 bg-success-50 text-success-700 hover:bg-success-100'}`}
                      >
                        {active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 bg-danger-50 hover:bg-danger-100 text-danger-600 rounded-lg text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
