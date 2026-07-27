"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Edit2, Plus, Save, Palette, Sparkles, Check, X } from "lucide-react";
import { adminFetch } from "../../config/auth";

interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  productLineId?: string;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🎨");
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  const fetchThemes = () => {
    adminFetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setThemes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await adminFetch("/api/themes", {
      method: "POST",
      body: JSON.stringify({ name, description, icon }),
    });
    setName("");
    setDescription("");
    setIcon("🎨");
    fetchThemes();
  };

  const handleUpdate = async () => {
    if (!editingTheme) return;
    await adminFetch(`/api/themes/${editingTheme.id}`, {
      method: "PUT",
      body: JSON.stringify(editingTheme),
    });
    setEditingTheme(null);
    fetchThemes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theme?")) return;
    await adminFetch(`/api/themes/${id}`, { method: "DELETE" });
    fetchThemes();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold">
        Loading Themes Catalog...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <span className="inline-flex items-center space-x-1.5 text-xs font-black text-purple-400 uppercase tracking-widest">
            <Palette className="w-4 h-4" />
            <span>Theme Catalog Management</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">
            Themes & Design Styles
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            Create, edit, and categorize product themes (Space Adventures, Secret Garden, Fairytale Magic, Wild Kingdom).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-base text-slate-800 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-purple-500" />
            <span>Add New Theme</span>
          </h3>

          <form onSubmit={handleAdd} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Theme Title
              </label>
              <input
                type="text"
                placeholder="e.g. Under the Sea"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Icon Emoji
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-16 px-3 py-2 text-center text-lg bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <div className="flex flex-wrap gap-1">
                  {["🪐", "🌿", "🏰", "🦁", "🌊", "🦄", "🎨", "🕯️"].map((eItem) => (
                    <button
                      key={eItem}
                      type="button"
                      onClick={() => setIcon(eItem)}
                      className="w-7 h-7 bg-slate-100 hover:bg-purple-100 rounded-lg text-sm transition"
                    >
                      {eItem}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Brief theme description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md transition"
            >
              + Create New Theme
            </button>
          </form>
        </div>

        {/* Themes Table / Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-800">
            Active Themes ({themes.length})
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {themes.map((t) => {
              const isEditing = editingTheme?.id === t.id;

              if (isEditing && editingTheme) {
                return (
                  <div
                    key={t.id}
                    className="p-4 bg-purple-50/50 space-y-3 border-l-4 border-purple-500"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Theme Name
                        </label>
                        <input
                          type="text"
                          value={editingTheme.name}
                          onChange={(e) =>
                            setEditingTheme({ ...editingTheme, name: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Icon Emoji
                        </label>
                        <input
                          type="text"
                          value={editingTheme.icon || "🎨"}
                          onChange={(e) =>
                            setEditingTheme({ ...editingTheme, icon: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-center text-base"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editingTheme.description || ""}
                          onChange={(e) =>
                            setEditingTheme({
                              ...editingTheme,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setEditingTheme(null)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-1.5 bg-purple-600 text-white font-extrabold text-xs rounded-lg shadow flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={t.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-xl font-extrabold shadow-2xs">
                      {t.icon || "🎨"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        {t.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Slug: <span className="font-mono text-slate-700">{t.slug}</span>
                        {t.description && ` • ${t.description}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingTheme({ ...t })}
                      className="p-2 bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 rounded-xl transition"
                      title="Edit Theme"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-xl transition"
                      title="Delete Theme"
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
  );
}
