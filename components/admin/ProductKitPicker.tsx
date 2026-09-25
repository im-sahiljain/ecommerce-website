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
  heading = "Paints & brushes",
  description = "Choose the color types, then type how many colors are included. The buyer can pick any colors from those types.",
}: {
  value: ProductKit;
  onChange: (kit: ProductKit) => void;
  heading?: string;
  description?: string;
}) {
  const [supplies, setSupplies] = useState<KitSupplies>({
    types: [],
    colors: [],
    brushes: [],
  });

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

  const paints = {
    ...value.paints,
    typeRules: value.paints.typeRules || [],
    limitMode: value.paints.limitMode === "overall" ? "overall" : "type",
  } as ProductKit["paints"];
  const brushes = value.brushes;

  const toggleType = (typeId: string) => {
    const selected = paints.typeIds.includes(typeId);
    const typeIds = selected
      ? paints.typeIds.filter((id) => id !== typeId)
      : [...paints.typeIds, typeId];
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
        colorIds: [],
        typeRules,
      }),
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
    const brushIds = selected
      ? brushes.brushIds.filter((id) => id !== brushId)
      : [...brushes.brushIds, brushId];
    onChange({
      ...value,
      brushes: { ...brushes, brushIds, includedCount: brushIds.length },
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-extrabold text-neutral-800">{heading}</h2>
          <p className="mt-0.5 text-[11px] text-neutral-500">{description}</p>
        </div>
        <Link
          href="/admin/supplies"
          className="shrink-0 text-[11px] font-bold text-primary"
        >
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
              paints: {
                ...emptyProductKit().paints,
                ...paints,
                included: e.target.checked,
              },
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
              onChange={(show) =>
                onChange({ ...value, paints: { ...paints, show } })
              }
            />
            <ShowBox
              label="Show ml"
              checked={paints.showVolume}
              onChange={(showVolume) =>
                onChange({ ...value, paints: { ...paints, showVolume } })
              }
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] font-bold text-neutral-600">
              Color limit
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    paints: syncPaintRules({ ...paints, limitMode: "overall" }),
                  })
                }
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold ${
                  paints.limitMode === "overall"
                    ? "bg-primary text-white"
                    : "border border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                Any color type
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    paints: syncPaintRules({ ...paints, limitMode: "type" }),
                  })
                }
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold ${
                  paints.limitMode === "type"
                    ? "bg-primary text-white"
                    : "border border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                Per color type
              </button>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              {paints.limitMode === "overall"
                ? "Type a number, such as 5. The buyer can choose any colors from the types below. Extra colors are charged at each color's price."
                : "Each color type has its own included amount. The buyer chooses any colors of that type, and extras are charged at each color's price."}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-bold text-neutral-600">
              Color type
            </p>
            <div className="flex flex-wrap gap-2">
              {supplies.types
                .filter((type) => type.available !== false)
                .map((type) => {
                  const on = paints.typeIds.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type.id)}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold ${
                        on
                          ? "bg-primary text-white"
                          : "border border-neutral-200 bg-white text-neutral-700"
                      }`}
                    >
                      {type.name}
                    </button>
                  );
                })}
              {supplies.types.length === 0 && (
                <p className="text-[11px] text-neutral-400">
                  Add a color type in Colors & Brushes first.
                </p>
              )}
            </div>
          </div>
          {paints.limitMode === "type" &&
            paints.typeIds.map((typeId) => {
              const type = supplies.types.find((item) => item.id === typeId);
              const rule = paints.typeRules.find(
                (item) => item.typeId === typeId,
              ) || {
                typeId,
                includedCount: 0,
                maxCount: 0,
                extraPerColor: 0,
              };
              return (
                <NumberField
                  key={typeId}
                  label={`${type?.name || "Colors"} included in the kit`}
                  value={rule.includedCount}
                  onChange={(includedCount) =>
                    updateTypeRule(typeId, { includedCount })
                  }
                />
              );
            })}
          {paints.limitMode === "overall" && (
            <NumberField
              label="Colors included in the kit"
              value={paints.includedCount}
              onChange={(includedCount) =>
                onChange({
                  ...value,
                  paints: syncPaintRules({
                    ...paints,
                    includedCount,
                    colorIds: [],
                  }),
                })
              }
            />
          )}
        </div>
      )}

      <label className="flex items-center gap-2 text-xs font-bold text-neutral-800">
        <input
          type="checkbox"
          checked={brushes.included}
          onChange={(e) =>
            onChange({
              ...value,
              brushes: {
                ...emptyProductKit().brushes,
                ...brushes,
                included: e.target.checked,
              },
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
              onChange={(show) =>
                onChange({ ...value, brushes: { ...brushes, show } })
              }
            />
            <ShowBox
              label="Show sizes"
              checked={brushes.showSizes}
              onChange={(showSizes) =>
                onChange({ ...value, brushes: { ...brushes, showSizes } })
              }
            />
          </div>
          <p className="text-[11px] text-neutral-500">
            Selected brushes are included in the kit. The buyer can add any
            other brush at that brush's price.
          </p>
          <div className="flex flex-wrap gap-2">
            {supplies.brushes
              .filter((brush) => brush.available !== false)
              .map((brush) => {
                const on = brushes.brushIds.includes(brush.id);
                return (
                  <button
                    key={brush.id}
                    type="button"
                    onClick={() => toggleBrush(brush.id)}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold ${
                      on
                        ? "border-primary bg-primary/10 text-neutral-900"
                        : "border-neutral-200 bg-white text-neutral-600"
                    }`}
                  >
                    {brush.name}
                    {brush.size ? ` · Size ${brush.size}` : ""}
                    {` · ₹${Number(brush.price) || 0}`}
                  </button>
                );
              })}
            {supplies.brushes.length === 0 && (
              <p className="text-[11px] text-neutral-400">
                Add brushes in Colors & Brushes first.
              </p>
            )}
          </div>
          <NumberField
            label="Brushes included in the price"
            value={brushes.includedCount}
            onChange={(includedCount) =>
              onChange({
                ...value,
                brushes: { ...brushes, includedCount },
              })
            }
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
  const typeRules = (paints.typeRules || []).filter((rule) =>
    paints.typeIds.includes(rule.typeId),
  );
  if (paints.limitMode === "overall") {
    return { ...paints, typeRules };
  }
  return {
    ...paints,
    typeRules,
    includedCount: typeRules.reduce((sum, rule) => sum + rule.includedCount, 0),
    maxCount: typeRules.reduce((sum, rule) => sum + rule.maxCount, 0),
    extraPerColor: typeRules.reduce(
      (highest, rule) => Math.max(highest, rule.extraPerColor),
      0,
    ),
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
