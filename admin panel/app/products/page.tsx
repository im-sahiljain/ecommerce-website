'use me';
'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, ShieldCheck, X, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  isNonToxic: boolean;
  image: string;
  description: string;
  inStock: boolean;
}

export default function ProductsManagerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [theme, setTheme] = useState('Space Adventures');
  const [category, setCategory] = useState('Painting Kits');
  const [ageGroup, setAgeGroup] = useState('Ages 4+');
  const [isNonToxic, setIsNonToxic] = useState(true);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setOriginalPrice('');
    setTheme('Space Adventures');
    setCategory('Painting Kits');
    setAgeGroup('Ages 4+');
    setIsNonToxic(true);
    setImage('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    setTheme(p.theme);
    setCategory(p.category);
    setAgeGroup(p.ageGroup);
    setIsNonToxic(p.isNonToxic);
    setImage(p.image);
    setDescription(p.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      theme,
      category,
      ageGroup,
      isNonToxic,
      image: image || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500',
      description
    };

    if (editingId) {
      await fetch(`http://localhost:5000/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    setIsModalOpen(false);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Products Catalog CRUD</h1>
          <p className="text-slate-500 text-xs mt-1">Add, update, or remove ready-to-paint craft kits.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Craft Kit</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="p-4">Product Kit</th>
              <th className="p-4">Theme</th>
              <th className="p-4">Category</th>
              <th className="p-4">Age</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition">
                <td className="p-4 flex items-center space-x-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                    {p.isNonToxic && <span className="text-[10px] text-emerald-600 font-semibold">100% Non-Toxic</span>}
                  </div>
                </td>
                <td className="p-4 font-semibold text-slate-700">{p.theme}</td>
                <td className="p-4 font-semibold text-slate-600">{p.category}</td>
                <td className="p-4 font-semibold text-slate-600">{p.ageGroup}</td>
                <td className="p-4 font-bold text-slate-800">${p.price.toFixed(2)}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-600 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative border border-slate-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingId ? 'Edit Craft Kit' : 'Add New Craft Kit'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Kit Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Theme</label>
                  <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-2 py-2 bg-slate-50 border rounded-xl">
                    <option value="Space Adventures">Space Adventures</option>
                    <option value="Secret Garden (Floral)">Secret Garden (Floral)</option>
                    <option value="Fairytale Magic">Fairytale Magic</option>
                    <option value="Wild Kingdom">Wild Kingdom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-2 py-2 bg-slate-50 border rounded-xl">
                    <option value="Painting Kits">Painting Kits</option>
                    <option value="Party Packs">Party Packs</option>
                    <option value="Plaster Sets">Plaster Sets</option>
                    <option value="New Arrivals">New Arrivals</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Age Group</label>
                  <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className="w-full px-2 py-2 bg-slate-50 border rounded-xl">
                    <option value="Ages 2-4">Ages 2-4</option>
                    <option value="Ages 4+">Ages 4+</option>
                    <option value="Ages 8+">Ages 8+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Image URL (Cloudinary / Unsplash)</label>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl h-20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="nonToxic"
                  checked={isNonToxic}
                  onChange={e => setIsNonToxic(e.target.checked)}
                  className="w-4 h-4 text-pink-500 rounded"
                />
                <label htmlFor="nonToxic" className="font-semibold text-slate-700">100% Non-Toxic Certified Badge</label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs shadow transition mt-2"
              >
                {editingId ? 'Save Changes' : 'Create Craft Kit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
