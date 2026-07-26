'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { adminFetch } from '../../config/auth';

interface ProductLine {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  icon?: string;
  isVisible: boolean;
  sortOrder: number;
}

export default function ProductLinesPage() {
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ProductLine | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [icon, setIcon] = useState('📦');
  const [isVisible, setIsVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = () => {
    adminFetch('/api/product-lines')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProductLines(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const openAddModal = () => {
    setEditingLine(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImage('');
    setIcon('📦');
    setIsVisible(true);
    setSortOrder(productLines.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (line: ProductLine) => {
    setEditingLine(line);
    setName(line.name);
    setSlug(line.slug);
    setDescription(line.description || '');
    setCoverImage(line.coverImage || '');
    setIcon(line.icon || '📦');
    setIsVisible(line.isVisible);
    setSortOrder(line.sortOrder || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      coverImage,
      icon,
      isVisible,
      sortOrder: Number(sortOrder)
    };

    try {
      const url = editingLine
        ? `/api/product-lines/${editingLine.id}`
        : '/api/product-lines';
      const method = editingLine ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchLines();
      }
    } catch (err) {
      console.warn('Save product line failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product line?')) return;
    try {
      const res = await adminFetch(`/api/product-lines/${id}`, { method: 'DELETE' });
      if (res.ok) fetchLines();
    } catch (err) {
      console.warn('Delete product line failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Product Lines Management</h1>
          <p className="text-slate-500 text-xs mt-1">Manage top-level channels (e.g. POP Figurines, Wax Candles, DIY Craft Kits).</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product Line</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 font-bold">Loading product lines...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productLines.map(line => (
            <div key={line.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{line.icon || '📦'}</span>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800">{line.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{line.slug}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full flex items-center space-x-1 ${
                  line.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {line.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{line.isVisible ? 'Active' : 'Hidden'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{line.description || 'No description provided.'}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Sort Order: {line.sortOrder}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(line)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(line.id)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-extrabold text-base text-slate-800 border-b pb-3">
              {editingLine ? 'Edit Product Line' : 'Add New Product Line'}
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Icon Emoji</label>
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  placeholder="📦"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-center"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Line Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ceramic Craft Sets"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of product line..."
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={e => setIsVisible(e.target.checked)}
                  className="rounded text-pink-500"
                />
                <span>Visible in Storefront & Navigation</span>
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
                  Save Line
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
