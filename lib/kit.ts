export type PaintColorType = {
  id: string;
  name: string;
  available?: boolean;
  sortOrder: number;
};

export type PaintColor = {
  id: string;
  name: string;
  hex?: string;
  colorTypeId?: string;
  volumeMl?: number;
  price: number;
  available?: boolean;
  sortOrder: number;
};

export type PaintBrush = {
  id: string;
  name: string;
  size?: string;
  price: number;
  available?: boolean;
  sortOrder: number;
};

export type KitSupplies = {
  types: PaintColorType[];
  colors: PaintColor[];
  brushes: PaintBrush[];
};

export type KitTypeRule = {
  typeId: string;
  includedCount: number;
  maxCount: number;
  extraPerColor: number;
};

export type PaintLimitMode = "type" | "overall";

export type ProductKit = {
  paints: {
    included: boolean;
    show: boolean;
    showVolume: boolean;
    typeIds: string[];
    colorIds: string[];
    typeRules: KitTypeRule[];
    limitMode: PaintLimitMode;
    includedCount: number;
    maxCount: number;
    extraPerColor: number;
  };
  brushes: {
    included: boolean;
    show: boolean;
    showSizes: boolean;
    brushIds: string[];
    includedCount: number;
    maxCount: number;
    extraPerBrush: number;
  };
};

export type KitColorChoice = {
  id: string;
  name: string;
  hex?: string;
  volumeMl?: number;
  price: number;
};

export type KitPaintGroup = {
  typeId: string;
  typeName: string;
  includedCount: number;
  maxCount: number;
  extraPerColor: number;
  colors: KitColorChoice[];
};

export type KitOffer = {
  paints?: {
    showVolume: boolean;
    limitMode: PaintLimitMode;
    includedCount: number;
    maxCount: number;
    extraPerColor: number;
    groups: KitPaintGroup[];
  };
  brushes?: {
    showSizes: boolean;
    includedCount: number;
    maxCount: number;
    extraPerBrush: number;
    items: { id: string; name: string; size?: string; price: number; included: boolean }[];
  };
};

export type KitSelection = {
  colorIds: string[];
  brushes: { id: string; quantity: number }[];
};

export type CartCustomization = {
  colors: { id: string; name: string }[];
  brushes: { id: string; name: string; size?: string; quantity: number }[];
  extraPerPiece: number;
};

export function emptyProductKit(): ProductKit {
  return {
    paints: {
      included: false,
      show: true,
      showVolume: true,
      typeIds: [],
      colorIds: [],
      typeRules: [],
      limitMode: "type",
      includedCount: 0,
      maxCount: 0,
      extraPerColor: 0,
    },
    brushes: {
      included: false,
      show: true,
      showSizes: true,
      brushIds: [],
      includedCount: 0,
      maxCount: 0,
      extraPerBrush: 0,
    },
  };
}

export function emptyKitSelection(): KitSelection {
  return { colorIds: [], brushes: [] };
}

function idList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()),
    ),
  ];
}

function money(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100) / 100;
}

function count(value: unknown): number {
  const amount = Math.floor(Number(value));
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return amount;
}

function typeRulesFromRaw(value: unknown): KitTypeRule[] {
  if (!Array.isArray(value)) return [];
  const byId = new Map<string, KitTypeRule>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rule = item as Partial<KitTypeRule>;
    const typeId = typeof rule.typeId === "string" ? rule.typeId.trim() : "";
    if (!typeId) continue;
    const includedCount = count(rule.includedCount);
    byId.set(typeId, {
      typeId,
      includedCount,
      maxCount: count(rule.maxCount),
      extraPerColor: money(rule.extraPerColor),
    });
  }
  return [...byId.values()];
}

function paintsWithRules(
  paints: ProductKit["paints"],
  typeRules: KitTypeRule[],
): ProductKit["paints"] {
  if (paints.limitMode === "overall") {
    return { ...paints, typeRules };
  }
  return {
    ...paints,
    typeRules,
    includedCount: typeRules.reduce((sum, rule) => sum + rule.includedCount, 0),
    maxCount: typeRules.reduce((sum, rule) => sum + rule.maxCount, 0),
    extraPerColor: typeRules.reduce((highest, rule) => Math.max(highest, rule.extraPerColor), 0),
  };
}

export function normalizeKit(value: unknown): ProductKit | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as { paints?: Partial<ProductKit["paints"]>; brushes?: Partial<ProductKit["brushes"]> };
  const paints = raw.paints || {};
  const brushes = raw.brushes || {};
  const kit: ProductKit = {
    paints: {
      included: Boolean(paints.included),
      show: paints.show !== false,
      showVolume: paints.showVolume !== false,
      typeIds: idList(paints.typeIds),
      colorIds: idList(paints.colorIds),
      typeRules: [],
      limitMode: paints.limitMode === "overall" ? "overall" : "type",
      includedCount: count(paints.includedCount),
      maxCount: count(paints.maxCount),
      extraPerColor: money(paints.extraPerColor),
    },
    brushes: {
      included: Boolean(brushes.included),
      show: brushes.show !== false,
      showSizes: brushes.showSizes !== false,
      brushIds: idList(brushes.brushIds),
      includedCount: count(brushes.includedCount),
      maxCount: count(brushes.maxCount),
      extraPerBrush: money(brushes.extraPerBrush),
    },
  };

  if (!kit.paints.included) {
    kit.paints.typeIds = [];
    kit.paints.colorIds = [];
    kit.paints.typeRules = [];
  } else {
    const explicit = typeRulesFromRaw(paints.typeRules).filter((rule) =>
      kit.paints.typeIds.includes(rule.typeId),
    );
    const typeRules =
      explicit.length > 0
        ? kit.paints.typeIds.map(
            (typeId) =>
              explicit.find((rule) => rule.typeId === typeId) || {
                typeId,
                includedCount: 0,
                maxCount: 0,
                extraPerColor: kit.paints.extraPerColor,
              },
          )
        : kit.paints.typeIds.map((typeId) => ({
            typeId,
            includedCount: kit.paints.includedCount,
            maxCount: kit.paints.maxCount,
            extraPerColor: kit.paints.extraPerColor,
          }));
    Object.assign(kit, { paints: paintsWithRules(kit.paints, typeRules) });
  }
  if (!kit.brushes.included) kit.brushes.brushIds = [];
  if (!kit.paints.included && !kit.brushes.included) return undefined;
  return kit;
}

export function toKitOffer(
  kit: ProductKit | null | undefined,
  supplies: KitSupplies,
): KitOffer | undefined {
  const normalized = normalizeKit(kit);
  if (!normalized) return undefined;
  const offer: KitOffer = {};

  if (normalized.paints.included && normalized.paints.show) {
    const typeIds = new Set(normalized.paints.typeIds);
    const rules = new Map(normalized.paints.typeRules.map((rule) => [rule.typeId, rule]));
    const groups = supplies.types
      .filter((type) => type.available !== false && typeIds.has(type.id))
      .map((type) => {
        const colors = supplies.colors
          .filter(
            (color) => color.available !== false && color.colorTypeId === type.id,
          )
          .map((color) => ({
            id: color.id,
            name: color.name,
            hex: color.hex,
            volumeMl: color.volumeMl,
            price: color.price || 0,
          }));
        const rule = rules.get(type.id);
        const perType = normalized.paints.limitMode !== "overall";
        return {
          typeId: type.id,
          typeName: type.name,
          includedCount: perType ? (rule?.includedCount ?? 0) : 0,
          maxCount: colors.length,
          extraPerColor: perType ? (rule?.extraPerColor ?? 0) : normalized.paints.extraPerColor,
          colors,
        };
      })
      .filter((group) => group.colors.length > 0);
    if (groups.length > 0) {
      const paletteSize = groups.reduce((sum, group) => sum + group.colors.length, 0);
      offer.paints = {
        showVolume: normalized.paints.showVolume,
        limitMode: normalized.paints.limitMode,
        includedCount:
          normalized.paints.limitMode === "overall"
            ? normalized.paints.includedCount
            : groups.reduce((sum, group) => sum + group.includedCount, 0),
        maxCount: paletteSize,
        extraPerColor: normalized.paints.extraPerColor,
        groups,
      };
    }
  }

  if (normalized.brushes.included && normalized.brushes.show) {
    const includedIds = new Set(normalized.brushes.brushIds);
    const items = supplies.brushes
      .filter((brush) => brush.available !== false)
      .map((brush) => ({
        id: brush.id,
        name: brush.name,
        size: brush.size,
        price: brush.price || 0,
        included: includedIds.has(brush.id),
      }));
    if (items.length > 0) {
      offer.brushes = {
        showSizes: normalized.brushes.showSizes,
        includedCount: items.filter((brush) => brush.included).length,
        maxCount: items.length,
        extraPerBrush: normalized.brushes.extraPerBrush,
        items,
      };
    }
  }

  if (!offer.paints && !offer.brushes) return undefined;
  return offer;
}

function chosenColorIds(group: KitPaintGroup, selection: KitSelection): string[] {
  const allowed = new Set(group.colors.map((color) => color.id));
  return selection.colorIds.filter((id) => allowed.has(id));
}

export function selectedPaintTypeId(
  paints: NonNullable<KitOffer["paints"]>,
  selection: KitSelection,
): string | null {
  for (const id of selection.colorIds) {
    const group = paints.groups.find((item) => item.colors.some((color) => color.id === id));
    if (group) return group.typeId;
  }
  return null;
}

function acceptedColorIds(paints: NonNullable<KitOffer["paints"]>, selection: KitSelection): string[] {
  if (paints.limitMode === "overall") {
    const allowed = new Set(paints.groups.flatMap((group) => group.colors.map((color) => color.id)));
    return selection.colorIds.filter((id) => allowed.has(id));
  }
  const typeId = selectedPaintTypeId(paints, selection);
  const group = paints.groups.find((item) => item.typeId === typeId);
  return group ? chosenColorIds(group, selection) : [];
}

export type PaintChargeLine = {
  typeId: string;
  typeName: string;
  count: number;
  amount: number;
};

function chargedAfterAllowance<T extends { price: number; name: string }>(items: T[], included: number): T[] {
  return [...items]
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name))
    .slice(Math.max(0, included));
}

function linesFromCharged(items: { id: string; name: string; price: number }[]): PaintChargeLine[] {
  const grouped = new Map<string, PaintChargeLine>();
  for (const item of items) {
    const current = grouped.get(item.id) || {
      typeId: item.id,
      typeName: item.name,
      count: 0,
      amount: 0,
    };
    current.count += 1;
    current.amount = Math.round((current.amount + item.price) * 100) / 100;
    grouped.set(item.id, current);
  }
  return [...grouped.values()];
}

function sumCharge(lines: PaintChargeLine[]) {
  return Math.round(lines.reduce((sum, line) => sum + line.amount, 0) * 100) / 100;
}

export function paintCharge(
  paints: NonNullable<KitOffer["paints"]>,
  selection: KitSelection,
): { extra: number; allowanceTypeId: string | null; lines: PaintChargeLine[] } {
  const priced = (group: KitPaintGroup, ids: string[]) => {
    const chosen = new Set(ids);
    return group.colors
      .filter((color) => chosen.has(color.id))
      .map((color) => ({ id: color.id, name: color.name, price: color.price || 0 }));
  };

  if (paints.limitMode === "overall") {
    const byId = new Map(
      paints.groups.flatMap((group) => group.colors.map((color) => [color.id, color])),
    );
    const accepted = acceptedColorIds(paints, selection).flatMap((id) => {
      const color = byId.get(id);
      return color ? [{ id: color.id, name: color.name, price: color.price || 0 }] : [];
    });
    const lines = linesFromCharged(chargedAfterAllowance(accepted, paints.includedCount));
    return { extra: sumCharge(lines), allowanceTypeId: null, lines };
  }

  const typeId = selectedPaintTypeId(paints, selection);
  const group = paints.groups.find((item) => item.typeId === typeId);
  if (!group) return { extra: 0, allowanceTypeId: null, lines: [] };
  const lines = linesFromCharged(
    chargedAfterAllowance(priced(group, chosenColorIds(group, selection)), group.includedCount),
  );
  return { extra: sumCharge(lines), allowanceTypeId: group.typeId, lines };
}

export function brushCharge(
  brushes: NonNullable<KitOffer["brushes"]>,
  selection: KitSelection,
): { extra: number; lines: PaintChargeLine[] } {
  const kept: { id: string; name: string; price: number }[] = [];
  for (const item of selection.brushes) {
    const brush = brushes.items.find((entry) => entry.id === item.id);
    if (!brush || item.quantity <= 0 || brush.included) continue;
    for (let index = 0; index < item.quantity; index += 1) {
      kept.push({ id: brush.id, name: brush.name, price: brush.price || 0 });
    }
  }
  const lines = linesFromCharged(kept);
  return { extra: sumCharge(lines), lines };
}

export function kitExtraPerPiece(offer: KitOffer | undefined, selection: KitSelection): number {
  if (!offer) return 0;
  let extra = 0;
  if (offer.paints) extra += paintCharge(offer.paints, selection).extra;
  if (offer.brushes) extra += brushCharge(offer.brushes, selection).extra;
  return Math.round(extra * 100) / 100;
}

export function cartLineId(productId: string): string {
  return productId;
}

export function customizationToSelection(
  customization: CartCustomization | undefined,
  offer?: KitOffer,
): KitSelection {
  const included = (offer?.brushes?.items ?? [])
    .filter((brush) => brush.included)
    .map((brush) => ({ id: brush.id, quantity: 1 }));
  const selected = (customization?.brushes ?? [])
    .filter((brush) => brush.quantity > 0)
    .map((brush) => ({ id: brush.id, quantity: brush.quantity }));
  const selectedIds = new Set(selected.map((brush) => brush.id));
  return {
    colorIds: (customization?.colors ?? []).map((color) => color.id),
    brushes: [
      ...selected,
      ...included.filter((brush) => !selectedIds.has(brush.id)),
    ],
  };
}

export function selectionToCustomization(
  offer: KitOffer | undefined,
  selection: KitSelection,
): CartCustomization | undefined {
  if (!offer) return undefined;
  const colors = offer.paints
    ? offer.paints.groups.flatMap((group) => {
        const allowed = new Set(acceptedColorIds(offer.paints!, selection));
        return group.colors
          .filter((color) => allowed.has(color.id))
          .map((color) => ({ id: color.id, name: color.name }));
      })
    : [];
  const brushes: CartCustomization["brushes"] = [];
  if (offer.brushes) {
    for (const item of selection.brushes) {
      if (item.quantity <= 0) continue;
      const brush = offer.brushes.items.find((entry) => entry.id === item.id);
      if (!brush) continue;
      brushes.push({
        id: brush.id,
        name: brush.name,
        size: brush.size,
        quantity: item.quantity,
      });
    }
  }
  const extraPerPiece = kitExtraPerPiece(offer, selection);
  if (colors.length === 0 && brushes.length === 0) return undefined;
  return { colors, brushes, extraPerPiece };
}

export function formatExtraCharge(
  customization?: { extraPerPiece?: number } | null,
): string {
  const extra = Number(customization?.extraPerPiece) || 0;
  if (extra <= 0) return "";
  return `Extra charge ₹${extra.toFixed(2)}`;
}

export function formatCustomization(
  customization?: {
    colors?: { name: string }[];
    brushes?: { name: string; size?: string; quantity: number }[];
  } | null,
): string {
  if (!customization) return "";
  const parts: string[] = [];
  if (customization.colors?.length) {
    parts.push(`Colors: ${customization.colors.map((color) => color.name).join(", ")}`);
  }
  if (customization.brushes?.length) {
    parts.push(
      `Brushes: ${customization.brushes
        .map((brush) => {
          const size = brush.size ? ` size ${brush.size}` : "";
          const qty = brush.quantity > 1 ? ` ×${brush.quantity}` : "";
          return `${brush.name}${size}${qty}`;
        })
        .join(", ")}`,
    );
  }
  return parts.join(" · ");
}
