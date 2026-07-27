"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  Palette,
  Layout,
  Layers,
  Save,
  RotateCcw,
} from "lucide-react";
import { adminFetch } from "../../config/auth";

export interface DecorationItem {
  id: string;
  type: "emoji" | "image";
  content: string;
  imageUrl?: string;
  style?: Record<string, any>;
  className?: string;
}

export interface HomepageSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  themeKeyword?: string;
  titleLayout?: "left" | "center" | "right";
  bgColor?: string;
  textColor?: string;
  topDividerFill?: string;
  cardSize?: "large" | "small";
  layoutTemplate: string;
  productLineId?: string;
  categoryId?: string;
  decorations?: DecorationItem[];
  isVisible: boolean;
  sortOrder: number;
}

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New section form state
  const [newTitle, setNewTitle] = useState("");
  const [newThemeKeyword, setNewThemeKeyword] = useState("General");
  const [newTitleLayout, setNewTitleLayout] = useState<"left" | "center" | "right">("left");
  const [newBgColor, setNewBgColor] = useState("#2D366D");
  const [newTextColor, setNewTextColor] = useState("#FFFFFF");

  const fetchSections = () => {
    adminFetch("/api/homepage-sections")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSections(data.sort((a, b) => a.sortOrder - b.sortOrder));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggleVisibility = async (id: string, currentVal: boolean) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !currentVal } : s)),
    );
    await adminFetch(`/api/homepage-sections/${id}`, {
      method: "PUT",
      body: JSON.stringify({ isVisible: !currentVal }),
    });
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    const updated = newSections.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setSections(updated);

    await adminFetch("/api/homepage-sections/reorder", {
      method: "PUT",
      body: JSON.stringify({ orderedIds: updated.map((s) => s.id) }),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this homepage section?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    await adminFetch(`/api/homepage-sections/${id}`, {
      method: "DELETE",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSection) return;
    setSections((prev) =>
      prev.map((s) => (s.id === editingSection.id ? editingSection : s)),
    );
    await adminFetch(`/api/homepage-sections/${editingSection.id}`, {
      method: "PUT",
      body: JSON.stringify(editingSection),
    });
    setEditingSection(null);
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const payload = {
      type: "theme_section",
      title: newTitle,
      themeKeyword: newThemeKeyword,
      titleLayout: newTitleLayout,
      bgColor: newBgColor,
      textColor: newTextColor,
      cardSize: "large",
      layoutTemplate: "carousel",
      isVisible: true,
      sortOrder: sections.length + 1,
    };

    const res = await adminFetch("/api/homepage-sections", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setNewTitle("");
      setIsAddingNew(false);
      fetchSections();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold">
        Loading Homepage Sections...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="inline-flex items-center space-x-1.5 text-xs font-black text-pink-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Homepage Section CMS</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">
            Homepage Layout Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            Reorder, toggle, or customize homepage sections, background colors,
            title layouts, and theme keywords in real-time.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition active:scale-95 flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAddingNew ? "Close Form" : "Add New Section"}</span>
        </button>
      </div>

      {/* Add New Section Modal / Form */}
      {isAddingNew && (
        <form
          onSubmit={handleCreateNew}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6"
        >
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-pink-500" />
            <span>Add New Theme Section</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Ocean Explorers"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Theme Filter Keyword
              </label>
              <input
                type="text"
                value={newThemeKeyword}
                onChange={(e) => setNewThemeKeyword(e.target.value)}
                placeholder="e.g. Space, Garden, Wild, Ocean"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Title Alignment
              </label>
              <select
                value={newTitleLayout}
                onChange={(e: any) => setNewTitleLayout(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
              >
                <option value="left">Left Title Alignment</option>
                <option value="center">Center Title Alignment</option>
                <option value="right">Right Title Alignment</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newBgColor}
                    onChange={(e) => setNewBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newBgColor}
                    onChange={(e) => setNewBgColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newTextColor}
                    onChange={(e) => setNewTextColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTextColor}
                    onChange={(e) => setNewTextColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-xl shadow transition"
            >
              Save New Section
            </button>
          </div>
        </form>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        <h2 className="font-black text-slate-800 text-lg flex items-center space-x-2">
          <Layers className="w-5 h-5 text-pink-500" />
          <span>Active Homepage Sections ({sections.length})</span>
        </h2>

        {sections.map((section, index) => {
          const isEditing = editingSection?.id === section.id;

          return (
            <div
              key={section.id}
              className={`bg-white rounded-3xl border transition p-5 shadow-sm space-y-4 ${
                section.isVisible ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Section Title & Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
                    </button>
                    <button
                      disabled={index === sections.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
                    </button>
                  </div>

                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-xs shrink-0"
                    style={{
                      backgroundColor: section.bgColor || "#F1E4F7",
                      color: section.textColor || "#3C2A21",
                    }}
                  >
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-base text-slate-800">
                        {section.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {section.themeKeyword || "General"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Layout: <span className="font-bold text-slate-700 uppercase">{section.titleLayout || "left"}</span> • Bg Color:{" "}
                      <span className="font-mono text-slate-700">{section.bgColor || "#FFFFFF"}</span>
                    </p>
                  </div>
                </div>

                {/* Section Action Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleVisibility(section.id, section.isVisible)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      section.isVisible
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {section.isVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setEditingSection(isEditing ? null : { ...section })
                    }
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inline Section Edit Form */}
              {isEditing && editingSection && (
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingSection.title}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, title: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Theme Keyword
                    </label>
                    <input
                      type="text"
                      value={editingSection.themeKeyword || ""}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, themeKeyword: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Title Layout
                    </label>
                    <select
                      value={editingSection.titleLayout || "left"}
                      onChange={(e: any) =>
                        setEditingSection({ ...editingSection, titleLayout: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    >
                      <option value="left">Left Title</option>
                      <option value="center">Center Title</option>
                      <option value="right">Right Title</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Background Hex Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={editingSection.bgColor || "#FFFFFF"}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, bgColor: e.target.value })
                        }
                        className="w-8 h-8 rounded border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingSection.bgColor || "#FFFFFF"}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, bgColor: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Text Hex Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={editingSection.textColor || "#3C2A21"}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, textColor: e.target.value })
                        }
                        className="w-8 h-8 rounded border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingSection.textColor || "#3C2A21"}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, textColor: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-end justify-end space-x-2 sm:col-span-1">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
