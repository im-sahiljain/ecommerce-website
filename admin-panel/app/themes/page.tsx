'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Trash2 } from 'lucide-react';
import { adminFetch } from '../../config/auth';

interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎨');

  const fetchThemes = () => {
    adminFetch('/api/themes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setThemes(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await adminFetch('/api/themes', {
      method: 'POST',
      body: JSON.stringify({ name, description, icon })
    });
    setName('');
    setDescription('');
    fetchThemes();
  };

  const handleDelete = async (id: string) => {
    await adminFetch(`/api/themes/${id}`, { method: 'DELETE' });
    fetchThemes();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-800">Themes Management</h1>
        <p className="text-slate-500 text-xs mt-1">Manage Craft Hub themes (Space Adventures, Secret Garden, Fairytale Magic, Wild Kingdom).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-fit">
          <h3 className="font-bold text-sm text-slate-800">Add New Theme</h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Theme Title</label>
              <input
                type="text"
                placeholder="e.g. Under the Sea"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Icon Emoji</label>
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Description</label>
              <input
                type="text"
                placeholder="Theme description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs shadow transition"
            >
              + Create Theme
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
              <tr>
                <th className="p-4">Icon</th>
                <th className="p-4">Theme Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {themes.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4 text-xl">{t.icon || '🎨'}</td>
                  <td className="p-4 font-bold text-slate-800">{t.name}</td>
                  <td className="p-4 text-slate-500">{t.slug}</td>
                  <td className="p-4 text-slate-600">{t.description || '-'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
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
