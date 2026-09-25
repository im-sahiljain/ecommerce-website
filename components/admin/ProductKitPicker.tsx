"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/config/adminAuth";
import {
  emptyProductKit,
  type KitSupplies,
  type KitTypeRule,
  type ProductKit,
} from "@/lib/kit";

export default function ProductKitPicker({
  value,
  onChange,
}: {
  value: ProductKit;
  onChange: (kit: ProductKit) => void;
}) {
  const [supplies, setSupplies] = useState<KitSupplies>({ types: [], colors: [], brushes: [] });

  useEffect(() => {
    Promise.all([
      adminFetch("/api/paint-color-types").then((res) => res.json()),
      adminFetch("/api/paint-colors").then((res) => res.json()),
      adminFetch("/api/paint-brushes").then((res) => res.json()),
    ])
      .then(([types, colors, brushes]) => {
        setSupplies({
          types: Array.isArray(types) ? types : [],
          colors: Array.isArray(colors) ? colors : [],
          brushes: Array.isArray(brushes) ? brushes : [],
        });
      })
      .catch(() => {});
  }, []);

  const paints = { ...value.paints, typeRules: value.paints.typeRules || [] };
  const brushes = value.brushes;
  const availableTypeIds = new Set(
    supplies.types.filter((type) => type.available !== false).map((type) => type.id),
  );
  const colorsForTypes = supplies.colors.filter(
    (color) =>
      color.available !== false &&
      availableTypeIds.has(color.colorTypeId || "") &&
      paints.typeIds.includes(color.colorTypeId || ""),
  );

  const colorsOfType = (typeId: string) =>
    supplies.colors.filter((color) => color.available !== false && color.colorTypeId === typeId);

  const selectedCount = (typeId: string, colorIds = paints.colorIds) =>
    colorsOfType(typeId).filter((color) => colorIds.includes(color.id)).length;

  const toggleType = (typeId: string) => {
    const selected = paints.typeIds.includes(typeId);
    const typeIds = selected
      ? paints.typeIds.filter((id) => id !== typeId)
      : [...paints.typeIds, typeId];
    const allowed = new Set(
      supplies.colors
        .filter((color) => typeIds.includes(color.colorTypeId || ""))
        .map((color) => color.id),
    );
    const typeRules = selected
      ? paints.typeRules.filter((rule) => rule.typeId !== typeId)
      : [
          ...paints.typeRules,
          {
            typeId,
            includedCount: 0,
            maxCount: 0,
            extraPerColor: 0,
          },
        ];
    onChange({
      ...value,
      paints: syncPaintRules({
        ...paints,
        typeIds,
        colorIds: paints.colorIds.filter((id) => allowed.has(id)),
        typeRules,
      }),
    });
  };

  const toggleColor = (colorId: string) => {
    const color = supplies.colors.find((item) => item.id === colorId);
    const typeId = color?.colorTypeId || "";
    const selected = paints.colorIds.includes(colorId);
    const prevCount = selectedCount(typeId);
    const colorIds = selected
      ? paints.colorIds.filter((id) => id !== colorId)
      : [...paints.colorIds, colorId];
    const nextCount = selectedCount(typeId, colorIds);
    const current = paints.typeRules.find((rule) => rule.typeId === typeId) || {
      typeId,
      includedCount: prevCount,
      maxCount: prevCount,
      extraPerColor: 0,
    };
    const maxWasAll = current.maxCount === 0 || current.maxCount === prevCount;
    const includedWasAll = current.includedCount === prevCount;
    const maxCount = maxWasAll ? nextCount : Math.min(current.maxCount, nextCount);
    const includedCount = includedWasAll ? nextCount : Math.min(current.includedCount, maxCount);
    const typeRules = upsertRule(paints.typeRules, {
      ...current,
      typeId,
      maxCount,
      includedCount,
    });
    onChange({
      ...value,
      paints: syncPaintRules({ ...paints, colorIds, typeRules }),
    });
  };

  const updateTypeRule = (typeId: string, patch: Partial<KitTypeRule>) => {
    const current = paints.typeRules.find((rule) => rule.typeId === typeId) || {
      typeId,
      includedCount: 0,
      maxCount: 0,
      extraPerColor: 0,
    };
    const next = { ...current, ...patch, typeId };
    if (next.maxCount > 0) next.includedCount = Math.min(next.includedCount, next.maxCount);
    onChange({
      ...value,
      paints: syncPaintRules({
        ...paints,
        typeRules: upsertRule(paints.typeRules, next),
      }),
    });
  };

  const toggleBrush = (brushId: string) => {
    const selected = brushes.brushIds.includes(brushId);
    const prevCount = brushes.brushIds.length;
    const brushIds = selected
      ? brushes.brushIds.filter((id) => id !== brushId)
      : [...brushes.brushIds, brushId];
    const nextCount = brushIds.length;
    const maxWasAll = brushes.maxCount === 0 || brushes.maxCount === prevCount;
    const includedWasAll = brushes.includedCount === prevCount;
    const maxCount = maxWasAll ? nextCount : Math.min(brushes.maxCount, nextCount);
    const includedCount = includedWasAll ? nextCount : Math.min(brushes.includedCount, maxCount);
    onChange({
      ...value,
      brushes: { ...brushes, brushIds, maxCount, includedCount },
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-extrabold text-neutral-800">Paints & brushes</h2>
          <p className="mt-0.5 text-[11px] text-neutral-500">
            Each color type has its own included amount, maximum, and extra charge. The price includes one allowance, such as 4 watercolor or 2 oil color. Colors outside that allowance are charged at their type's extra rate.
          </p>
        </div>
        <Link href="/admin/supplies" className="shrink-0 text-[11px] font-bold text-primary">
          Manage catalog
        </Link>
      </div>

      <label className="flex items-center gap-2 text-xs font-bold text-neutral-800">
        <input
          type="checkbox"
          checked={paints.included}
          onChange={(e) =>
            onChange({
              ...value,
              paints: { ...emptyProductKit().paints, ...paints, included: e.target.checked },
            })
          }
          className="rounded-sm text-primary"
        />
        Includes paints
      </label>

      {paints.included && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <ShowBox
              label="Show on product page"
              checked={paints.show}
              onChange={(show) => onChange({ ...value, paints: { ...paints, show } })}
            />
            <ShowBox
              label="Show ml"
              checked={paints.showVolume}
              onChange={(showVolume) => onChange({ ...value, paints: { ...paints, showVolume } })}
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] font-bold text-neutral-600">Color type</p>
            <div className="flex flex-wrap gap-2">
              {supplies.types.filter((type) => type.available !== false).map((type) => {
                const on = paints.typeIds.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleType(type.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      on ? "bg-primary text-white" : "border border-neutral-200 bg-white text-neutral-700"
                    }`}
                  >
                    {type.name}
                  </button>
                );
              })}
              {supplies.types.length === 0 && (
                <p className="text-[11px] text-neutral-400">Add a color type in Colors & Brushes first.</p>
              )}
            </div>
          </div>
          {paints.typeIds.map((typeId) => {
            const type = supplies.types.find((item) => item.id === typeId);
            const colors = colorsForTypes.filter((color) => color.colorTypeId === typeId);
            const rule = paints.typeRules.find((item) => item.typeId === typeId) || {
              typeId,
              includedCount: 0,
              maxCount: 0,
              extraPerColor: 0,
            };
            return (
              <div key={typeId} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-[11px] font-extrabold text-neutral-800">{type?.name || "Color type"}</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const on = paints.colorIds.includes(color.id);
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => toggleColor(color.id)}
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                          on ? "border-primary bg-primary/10 text-neutral-900" : "border-neutral-200 bg-white text-neutral-600"
                        }`}
                      >
                        <span className="h-3.5 w-3.5 rounded-full border" style={{ background: color.hex || "#ddd" }} />
                        {color.name}
                        {color.volumeMl != null ? ` · ${color.volumeMl} ml` : ""}
                      </button>
                    );
                  })}
                  {colors.length === 0 && (
                    <p className="text-[11px] text-neutral-400">No colors for this type yet.</p>
                  )}
                </div>
                <LimitFields
                  included={rule.includedCount}
                  max={rule.maxCount}
                  extra={rule.extraPerColor}
                  includedLabel={`${type?.name || "Colors"} included in the price`}
                  maxLabel={`Max ${type?.name || "colors"} the buyer can choose`}
                  extraLabel={`Extra charge per ${type?.name || "color"}, per piece (₹)`}
                  onIncluded={(includedCount) => updateTypeRule(typeId, { includedCount })}
                  onMax={(maxCount) => updateTypeRule(typeId, { maxCount })}
                  onExtra={(extraPerColor) => updateTypeRule(typeId, { extraPerColor })}
                />
              </div>
            );
          })}
        </div>
      )}

      <label className="flex items-center gap-2 text-xs font-bold text-neutral-800">
        <input
          type="checkbox"
          checked={brushes.included}
          onChange={(e) =>
            onChange({
              ...value,
              brushes: { ...emptyProductKit().brushes, ...brushes, included: e.target.checked },
            })
          }
          className="rounded-sm text-primary"
        />
        Includes brushes
      </label>

      {brushes.included && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <ShowBox
              label="Show on product page"
              checked={brushes.show}
              onChange={(show) => onChange({ ...value, brushes: { ...brushes, show } })}
            />
            <ShowBox
              label="Show sizes"
              checked={brushes.showSizes}
              onChange={(showSizes) => onChange({ ...value, brushes: { ...brushes, showSizes } })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {supplies.brushes.filter((brush) => brush.available !== false).map((brush) => {
              const on = brushes.brushIds.includes(brush.id);
              return (
                <button
                  key={brush.id}
                  type="button"
                  onClick={() => toggleBrush(brush.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    on ? "border-primary bg-primary/10 text-neutral-900" : "border-neutral-200 bg-white text-neutral-600"
                  }`}
                >
                  {brush.name}
                  {brush.size ? ` · ${brush.size}` : ""}
                </button>
              );
            })}
            {supplies.brushes.length === 0 && (
              <p className="text-[11px] text-neutral-400">Add brushes in Colors & Brushes first.</p>
            )}
          </div>
          <LimitFields
            included={brushes.includedCount}
            max={brushes.maxCount}
            extra={brushes.extraPerBrush}
            includedLabel="Brushes included in the price"
            maxLabel="Max brushes the buyer can add"
            extraLabel="Extra charge per brush, per piece (₹)"
            onIncluded={(includedCount) =>
              onChange({
                ...value,
                brushes: { ...brushes, includedCount: Math.min(includedCount, brushes.maxCount || includedCount) },
              })
            }
            onMax={(maxCount) =>
              onChange({
                ...value,
                brushes: {
                  ...brushes,
                  maxCount,
                  includedCount: Math.min(brushes.includedCount, maxCount),
                },
              })
            }
            onExtra={(extraPerBrush) => onChange({ ...value, brushes: { ...brushes, extraPerBrush } })}
          />
        </div>
      )}
    </div>
  );
}

function upsertRule(rules: KitTypeRule[], rule: KitTypeRule): KitTypeRule[] {
  const next = rules.filter((item) => item.typeId !== rule.typeId);
  next.push(rule);
  return next;
}

function syncPaintRules(paints: ProductKit["paints"]): ProductKit["paints"] {
  const typeRules = (paints.typeRules || []).filter((rule) => paints.typeIds.includes(rule.typeId));
  return {
    ...paints,
    typeRules,
    includedCount: typeRules.reduce((sum, rule) => sum + rule.includedCount, 0),
    maxCount: typeRules.reduce((sum, rule) => sum + rule.maxCount, 0),
    extraPerColor: typeRules.reduce((highest, rule) => Math.max(highest, rule.extraPerColor), 0),
  };
}

function ShowBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] font-bold text-neutral-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded-sm text-primary"
      />
      {label}
    </label>
  );
}

function LimitFields({
  included,
  max,
  extra,
  includedLabel,
  maxLabel,
  extraLabel,
  onIncluded,
  onMax,
  onExtra,
}: {
  included: number;
  max: number;
  extra: number;
  includedLabel: string;
  maxLabel: string;
  extraLabel: string;
  onIncluded: (value: number) => void;
  onMax: (value: number) => void;
  onExtra: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <NumberField label={includedLabel} value={included} onChange={onIncluded} />
      <NumberField label={maxLabel} value={max} onChange={onMax} />
      <NumberField label={extraLabel} value={extra} onChange={onExtra} step="0.01" />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <label className="block text-[11px] font-bold text-neutral-600">
      {label}
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-xs font-bold"
      />
    </label>
  );
}
