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
  available?: boolean;
  sortOrder: number;
};

export type PaintBrush = {
  id: string;
  name: string;
  size?: string;
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

export type ProductKit = {
  paints: {
    included: boolean;
    show: boolean;
    showVolume: boolean;
    typeIds: string[];
    colorIds: string[];
    typeRules: KitTypeRule[];
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
    groups: KitPaintGroup[];
  };
  brushes?: {
    showSizes: boolean;
    includedCount: number;
    maxCount: number;
    extraPerBrush: number;
    items: { id: string; name: string; size?: string }[];
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
    const maxCount = count(rule.maxCount);
    byId.set(typeId, {
      typeId,
      includedCount: maxCount > 0 ? Math.min(count(rule.includedCount), maxCount) : count(rule.includedCount),
      maxCount,
      extraPerColor: money(rule.extraPerColor),
    });
  }
  return [...byId.values()];
}

function paintsWithRules(
  paints: ProductKit["paints"],
  typeRules: KitTypeRule[],
): ProductKit["paints"] {
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

  const colorCap = kit.paints.colorIds.length;
  if (colorCap > 0 && kit.paints.typeRules.length === 0) {
    kit.paints.maxCount = Math.min(kit.paints.maxCount || colorCap, colorCap);
    kit.paints.includedCount = Math.min(kit.paints.includedCount, kit.paints.maxCount);
  }
  const brushCap = kit.brushes.brushIds.length;
  if (brushCap > 0) {
    kit.brushes.maxCount = kit.brushes.maxCount || brushCap;
    kit.brushes.includedCount = Math.min(kit.brushes.includedCount, kit.brushes.maxCount);
  }
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
    const colorIds = new Set(normalized.paints.colorIds);
    const rules = new Map(normalized.paints.typeRules.map((rule) => [rule.typeId, rule]));
    const groups = supplies.types
      .filter((type) => type.available !== false && typeIds.has(type.id))
      .map((type) => {
        const colors = supplies.colors
          .filter(
            (color) =>
              color.available !== false &&
              color.colorTypeId === type.id &&
              colorIds.has(color.id),
          )
          .map((color) => ({
            id: color.id,
            name: color.name,
            hex: color.hex,
            volumeMl: color.volumeMl,
          }));
        const rule = rules.get(type.id);
        const maxCount = Math.min(rule?.maxCount ?? colors.length, colors.length);
        return {
          typeId: type.id,
          typeName: type.name,
          includedCount: Math.min(rule?.includedCount ?? 0, maxCount),
          maxCount,
          extraPerColor: rule?.extraPerColor ?? 0,
          colors,
        };
      })
      .filter((group) => group.colors.length > 0);
    if (groups.length > 0) {
      offer.paints = {
        showVolume: normalized.paints.showVolume,
        groups,
      };
    }
  }

  if (normalized.brushes.included && normalized.brushes.show) {
    const brushIds = new Set(normalized.brushes.brushIds);
    const items = supplies.brushes
      .filter((brush) => brush.available !== false && brushIds.has(brush.id))
      .map((brush) => ({ id: brush.id, name: brush.name, size: brush.size }));
    if (items.length > 0) {
      const maxCount = normalized.brushes.maxCount || items.length;
      offer.brushes = {
        showSizes: normalized.brushes.showSizes,
        includedCount: Math.min(normalized.brushes.includedCount, maxCount),
        maxCount,
        extraPerBrush: normalized.brushes.extraPerBrush,
        items,
      };
    }
  }

  if (!offer.paints && !offer.brushes) return undefined;
  return offer;
}

export function mergeKitOffers(offers: Array<KitOffer | undefined>): KitOffer | undefined {
  const present = offers.filter((offer): offer is KitOffer => Boolean(offer));
  if (!present.length) return undefined;
  const merged: KitOffer = {};

  const paintOffers = present.flatMap((offer) => (offer.paints ? [offer.paints] : []));
  if (paintOffers.length) {
    const groups = new Map<string, { typeId: string; typeName: string; colors: Map<string, KitColorChoice> }>();
    for (const paints of paintOffers) {
      for (const group of paints.groups) {
        const existing = groups.get(group.typeId) || {
          typeId: group.typeId,
          typeName: group.typeName,
          colors: new Map<string, KitColorChoice>(),
        };
        for (const color of group.colors) existing.colors.set(color.id, color);
        groups.set(group.typeId, existing);
      }
    }
    const mergedGroups = [...groups.values()]
      .map((group) => ({
        typeId: group.typeId,
        typeName: group.typeName,
        colors: [...group.colors.values()],
      }))
      .filter((group) => group.colors.length > 0);
    if (mergedGroups.length > 0) {
      merged.paints = {
        showVolume: paintOffers.some((paints) => paints.showVolume),
        groups: mergedGroups.map((group) => {
          const sources = paintOffers.flatMap((paints) =>
            paints.groups.filter((item) => item.typeId === group.typeId),
          );
          const maxCount = Math.min(
            group.colors.length,
            Math.max(...sources.map((item) => item.maxCount), 0),
          );
          return {
            ...group,
            includedCount: Math.min(
              maxCount,
              sources.length ? Math.min(...sources.map((item) => item.includedCount)) : 0,
            ),
            maxCount,
            extraPerColor: sources.length ? Math.max(...sources.map((item) => item.extraPerColor)) : 0,
          };
        }),
      };
    }
  }

  const brushOffers = present.flatMap((offer) => (offer.brushes ? [offer.brushes] : []));
  if (brushOffers.length) {
    const items = new Map<string, { id: string; name: string; size?: string }>();
    for (const brushes of brushOffers) {
      for (const item of brushes.items) items.set(item.id, item);
    }
    const brushItems = [...items.values()];
    if (brushItems.length) {
      const maxCount = Math.max(...brushOffers.map((brushes) => brushes.maxCount));
      merged.brushes = {
        showSizes: brushOffers.some((brushes) => brushes.showSizes),
        includedCount: Math.min(...brushOffers.map((brushes) => brushes.includedCount)),
        maxCount,
        extraPerBrush: Math.max(...brushOffers.map((brushes) => brushes.extraPerBrush)),
        items: brushItems,
      };
    }
  }

  if (!merged.paints && !merged.brushes) return undefined;
  return merged;
}

function chosenColorIds(group: KitPaintGroup, selection: KitSelection): string[] {
  const allowed = new Set(group.colors.map((color) => color.id));
  return selection.colorIds.filter((id) => allowed.has(id)).slice(0, group.maxCount);
}

export type PaintChargeLine = {
  typeId: string;
  typeName: string;
  count: number;
  amount: number;
};

export function paintCharge(
  groups: KitPaintGroup[],
  selection: KitSelection,
): { extra: number; allowanceTypeId: string | null; lines: PaintChargeLine[] } {
  const chosen = groups
    .map((group) => ({ group, count: chosenColorIds(group, selection).length }))
    .filter((item) => item.count > 0);
  if (!chosen.length) return { extra: 0, allowanceTypeId: null, lines: [] };

  let best: { extra: number; allowanceTypeId: string; lines: PaintChargeLine[] } | null = null;
  for (const allowance of groups) {
    const lines: PaintChargeLine[] = [];
    let extra = 0;
    for (const item of chosen) {
      const free = item.group.typeId === allowance.typeId ? item.group.includedCount : 0;
      const count = Math.max(0, item.count - free);
      if (count <= 0) continue;
      const amount = Math.round(count * item.group.extraPerColor * 100) / 100;
      extra += amount;
      lines.push({
        typeId: item.group.typeId,
        typeName: item.group.typeName,
        count,
        amount,
      });
    }
    extra = Math.round(extra * 100) / 100;
    if (!best || extra < best.extra) {
      best = { extra, allowanceTypeId: allowance.typeId, lines };
    }
  }
  return best || { extra: 0, allowanceTypeId: null, lines: [] };
}

export function kitExtraPerPiece(offer: KitOffer | undefined, selection: KitSelection): number {
  if (!offer) return 0;
  let extra = 0;
  if (offer.paints) extra += paintCharge(offer.paints.groups, selection).extra;
  if (offer.brushes) {
    const allowed = new Set(offer.brushes.items.map((item) => item.id));
    const chosen = selection.brushes.reduce(
      (sum, item) => (allowed.has(item.id) ? sum + Math.max(0, item.quantity) : sum),
      0,
    );
    const capped = Math.min(chosen, offer.brushes.maxCount);
    extra += Math.max(0, capped - offer.brushes.includedCount) * offer.brushes.extraPerBrush;
  }
  return Math.round(extra * 100) / 100;
}

export function cartLineId(productId: string, selection?: KitSelection): string {
  if (!selection) return productId;
  const colors = [...selection.colorIds].sort().join(",");
  const brushes = selection.brushes
    .filter((item) => item.quantity > 0)
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join(",");
  if (!colors && !brushes) return productId;
  return `${productId}__${colors}__${brushes}`;
}

export function selectionToCustomization(
  offer: KitOffer | undefined,
  selection: KitSelection,
): CartCustomization | undefined {
  if (!offer) return undefined;
  const colors = offer.paints
    ? offer.paints.groups.flatMap((group) => {
        const allowed = new Set(chosenColorIds(group, selection));
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
          const size = brush.size ? ` ${brush.size}` : "";
          const qty = brush.quantity > 1 ? ` ×${brush.quantity}` : "";
          return `${brush.name}${size}${qty}`;
        })
        .join(", ")}`,
    );
  }
  return parts.join(" · ");
}
