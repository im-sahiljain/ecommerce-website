'use me';
'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = () => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    setName('');
    setDescription('');
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-800">Categories Management</h1>
        <p className="text-slate-500 text-xs mt-1">Organize products by craft categories (e.g. Painting Kits, Party Packs).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-fit">
          <h3 className="font-bold text-sm text-slate-800">Add New Category</h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Clay Models"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Description</label>
              <input
                type="text"
                placeholder="Short summary"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow transition"
            >
              + Create Category
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{c.name}</td>
                  <td className="p-4 text-slate-500">{c.slug}</td>
                  <td className="p-4 text-slate-600">{c.description || '-'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
