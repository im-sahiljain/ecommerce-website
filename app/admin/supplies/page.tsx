"use client";

import { useEffect, useState } from "react";
import { Palette, Paintbrush, Plus, Trash2 } from "lucide-react";
import { adminFetch } from "@/config/adminAuth";
import type { PaintBrush, PaintColor, PaintColorType } from "@/lib/kit";

const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800";

export default function SuppliesAdminPage() {
  const [types, setTypes] = useState<PaintColorType[]>([]);
  const [colors, setColors] = useState<PaintColor[]>([]);
  const [brushes, setBrushes] = useState<PaintBrush[]>([]);
  const [error, setError] = useState("");

  const [typeName, setTypeName] = useState("");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#e11d48");
  const [colorTypeId, setColorTypeId] = useState("");
  const [colorMl, setColorMl] = useState("");
  const [colorPrice, setColorPrice] = useState("");
  const [editingColorId, setEditingColorId] = useState<string | null>(null);

  const [brushName, setBrushName] = useState("");
  const [brushSize, setBrushSize] = useState("");
  const [brushPrice, setBrushPrice] = useState("");
  const [editingBrushId, setEditingBrushId] = useState<string | null>(null);

  const load = async () => {
    const [typeRes, colorRes, brushRes] = await Promise.all([
      adminFetch("/api/paint-color-types"),
      adminFetch("/api/paint-colors"),
      adminFetch("/api/paint-brushes"),
    ]);
    const typeData = await typeRes.json();
    const colorData = await colorRes.json();
    const brushData = await brushRes.json();
    if (Array.isArray(typeData)) setTypes(typeData);
    if (Array.isArray(colorData)) setColors(colorData);
    if (Array.isArray(brushData)) setBrushes(brushData);
  };

  useEffect(() => {
    load().catch(() => setError("Could not load colors and brushes."));
  }, []);

  const saveType = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await adminFetch(
      editingTypeId ? `/api/paint-color-types/${editingTypeId}` : "/api/paint-color-types",
      {
        method: editingTypeId ? "PUT" : "POST",
        body: JSON.stringify({ name: typeName }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save color type.");
      return;
    }
    setTypeName("");
    setEditingTypeId(null);
    await load();
  };

  const saveColor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: colorName,
      hex: colorHex,
      colorTypeId,
      volumeMl: colorMl,
      price: colorPrice,
    };
    const res = await adminFetch(
      editingColorId ? `/api/paint-colors/${editingColorId}` : "/api/paint-colors",
      {
        method: editingColorId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save color.");
      return;
    }
    setColorName("");
    setColorMl("");
    setColorPrice("");
    setEditingColorId(null);
    await load();
  };

  const saveBrush = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await adminFetch(
      editingBrushId ? `/api/paint-brushes/${editingBrushId}` : "/api/paint-brushes",
      {
        method: editingBrushId ? "PUT" : "POST",
        body: JSON.stringify({ name: brushName, size: brushSize, price: brushPrice }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save brush.");
      return;
    }
    setBrushName("");
    setBrushSize("");
    setBrushPrice("");
    setEditingBrushId(null);
    await load();
  };

  const typeNameFor = (id?: string) => types.find((type) => type.id === id)?.name || "No type";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold text-neutral-800">Colors & Brushes</h1>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Manage color types, then each color and brush with its own price. Extra colors and brushes on a product or kit are charged at these prices.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-2 text-xs font-bold text-danger-700">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
        <h2 className="text-sm font-extrabold text-neutral-800">Color types</h2>
        <p className="mt-1 text-[11px] text-neutral-500">Watercolor, oil color, acrylic, and any other medium.</p>
        <form onSubmit={saveType} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="e.g. Watercolor"
            className={fieldClass}
            required
          />
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white">
            {editingTypeId ? "Save type" : "Add type"}
          </button>
        </form>
        <ul className="mt-4 divide-y divide-neutral-100">
          {types.map((type) => (
            <li
              key={type.id}
              className={`flex items-center justify-between gap-3 py-2 ${type.available === false ? "opacity-50" : ""}`}
            >
              <button
                type="button"
                onClick={() => {
                  setEditingTypeId(type.id);
                  setTypeName(type.name);
                }}
                className="text-left text-xs font-bold text-neutral-800"
              >
                {type.name}
              </button>
              <div className="flex items-center gap-2">
                <AvailabilitySwitch
                  on={type.available !== false}
                  onToggle={async () => {
                    const available = type.available === false;
                    setTypes((current) =>
                      current.map((item) => (item.id === type.id ? { ...item, available } : item)),
                    );
                    const res = await adminFetch(`/api/paint-color-types/${type.id}`, {
                      method: "PUT",
                      body: JSON.stringify({ available }),
                    });
                    if (!res.ok) await load();
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Delete ${type.name}?`)) return;
                    const res = await adminFetch(`/api/paint-color-types/${type.id}`, { method: "DELETE" });
                    const data = await res.json();
                    if (!res.ok) setError(data.error || "Could not delete color type.");
                    else await load();
                  }}
                  className="text-neutral-400 hover:text-danger-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {types.length === 0 && <p className="text-xs text-neutral-400">No color types yet.</p>}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-neutral-800">
            <Palette className="h-4 w-4 text-primary" />
            Colors
          </h2>
          <form onSubmit={saveColor} className="mt-4 grid grid-cols-2 gap-3">
            <input
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="Color name"
              className={`${fieldClass} col-span-2`}
              required
            />
            <select
              value={colorTypeId}
              onChange={(e) => setColorTypeId(e.target.value)}
              className={fieldClass}
              required
            >
              <option value="">Color type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.1"
              value={colorMl}
              onChange={(e) => setColorMl(e.target.value)}
              placeholder="ml per pot"
              className={fieldClass}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={colorPrice}
              onChange={(e) => setColorPrice(e.target.value)}
              placeholder="Price (₹)"
              className={fieldClass}
            />
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-600">
              <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="h-8 w-10 rounded-md border" />
              Swatch
            </label>
            <button type="submit" className="col-span-2 flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-extrabold text-white">
              <Plus className="h-3.5 w-3.5" />
              {editingColorId ? "Save color" : "Add color"}
            </button>
          </form>
          <ul className="mt-4 divide-y divide-neutral-100">
            {colors.map((color) => (
              <li
                key={color.id}
                className={`flex items-center justify-between gap-3 py-2 ${color.available === false ? "opacity-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditingColorId(color.id);
                    setColorName(color.name);
                    setColorHex(color.hex || "#e11d48");
                    setColorTypeId(color.colorTypeId || "");
                    setColorMl(color.volumeMl != null ? String(color.volumeMl) : "");
                    setColorPrice(color.price ? String(color.price) : "");
                  }}
                  className="flex items-center gap-2 text-left"
                >
                  <span className="h-5 w-5 rounded-full border border-neutral-200" style={{ background: color.hex || "#ddd" }} />
                  <span>
                    <span className="block text-xs font-bold text-neutral-800">{color.name}</span>
                    <span className="block text-[10px] text-neutral-400">
                      {typeNameFor(color.colorTypeId)}
                      {color.volumeMl != null ? ` · ${color.volumeMl} ml` : ""}
                      {` · ₹${Number(color.price) || 0}`}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <AvailabilitySwitch
                    on={color.available !== false}
                    onToggle={async () => {
                      const available = color.available === false;
                      setColors((current) =>
                        current.map((item) => (item.id === color.id ? { ...item, available } : item)),
                      );
                      const res = await adminFetch(`/api/paint-colors/${color.id}`, {
                        method: "PUT",
                        body: JSON.stringify({ available }),
                      });
                      if (!res.ok) await load();
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Delete ${color.name}?`)) return;
                      await adminFetch(`/api/paint-colors/${color.id}`, { method: "DELETE" });
                      await load();
                    }}
                    className="text-neutral-400 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-neutral-800">
            <Paintbrush className="h-4 w-4 text-primary" />
            Brushes
          </h2>
          <form onSubmit={saveBrush} className="mt-4 grid grid-cols-2 gap-3">
            <input
              value={brushName}
              onChange={(e) => setBrushName(e.target.value)}
              placeholder="Brush name, e.g. Round"
              className={fieldClass}
              required
            />
            <input
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
              placeholder="Size, e.g. 2"
              className={fieldClass}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={brushPrice}
              onChange={(e) => setBrushPrice(e.target.value)}
              placeholder="Price (₹)"
              className={`${fieldClass} col-span-2`}
            />
            <button type="submit" className="col-span-2 flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-extrabold text-white">
              <Plus className="h-3.5 w-3.5" />
              {editingBrushId ? "Save brush" : "Add brush"}
            </button>
          </form>
          <ul className="mt-4 divide-y divide-neutral-100">
            {brushes.map((brush) => (
              <li
                key={brush.id}
                className={`flex items-center justify-between gap-3 py-2 ${brush.available === false ? "opacity-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditingBrushId(brush.id);
                    setBrushName(brush.name);
                    setBrushSize(brush.size || "");
                    setBrushPrice(brush.price ? String(brush.price) : "");
                  }}
                  className="text-left"
                >
                  <span className="block text-xs font-bold text-neutral-800">{brush.name}</span>
                  <span className="block text-[10px] text-neutral-400">
                    {brush.size ? `Size ${brush.size}` : "No size"}
                    {` · ₹${Number(brush.price) || 0}`}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <AvailabilitySwitch
                    on={brush.available !== false}
                    onToggle={async () => {
                      const available = brush.available === false;
                      setBrushes((current) =>
                        current.map((item) => (item.id === brush.id ? { ...item, available } : item)),
                      );
                      const res = await adminFetch(`/api/paint-brushes/${brush.id}`, {
                        method: "PUT",
                        body: JSON.stringify({ available }),
                      });
                      if (!res.ok) await load();
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Delete ${brush.name}?`)) return;
                      await adminFetch(`/api/paint-brushes/${brush.id}`, { method: "DELETE" });
                      await load();
                    }}
                    className="text-neutral-400 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function AvailabilitySwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-primary" : "bg-neutral-300"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${on ? "left-4" : "left-0.5"}`} />
        <span className="sr-only">{on ? "Available" : "Unavailable"}</span>
      </button>
      <span className="w-16 text-[10px] font-bold text-neutral-500">{on ? "Available" : "Not avail."}</span>
    </>
  );
}
