export type ProductGallery = {
  note?: string;
  includedLabel?: string;
  exampleLabel?: string;
  exampleIndexes?: number[];
};

export function normalizeGallery(value: unknown): ProductGallery | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as ProductGallery;
  const note = typeof raw.note === "string" ? raw.note.trim() : "";
  const includedLabel =
    typeof raw.includedLabel === "string" ? raw.includedLabel.trim() : "";
  const exampleLabel =
    typeof raw.exampleLabel === "string" ? raw.exampleLabel.trim() : "";
  const exampleIndexes = Array.isArray(raw.exampleIndexes)
    ? [
        ...new Set(
          raw.exampleIndexes.filter(
            (index) => Number.isInteger(index) && index >= 0,
          ),
        ),
      ]
    : [];

  if (!note && exampleIndexes.length === 0) return undefined;
  return {
    note: note || undefined,
    includedLabel: includedLabel || undefined,
    exampleLabel: exampleLabel || undefined,
    exampleIndexes: exampleIndexes.length ? exampleIndexes : undefined,
  };
}

export function imageCaption(
  gallery: ProductGallery | undefined,
  index: number,
): string | null {
  const examples = gallery?.exampleIndexes || [];
  if (!examples.length) return null;
  if (examples.includes(index)) return gallery?.exampleLabel || "Example";
  return gallery?.includedLabel || "In the Box";
}
