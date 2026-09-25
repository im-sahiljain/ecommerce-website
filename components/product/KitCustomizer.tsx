"use client";

import type { KitOffer, KitPaintGroup, KitSelection } from "@/lib/kit";
import {
  brushCharge,
  kitExtraPerPiece,
  paintCharge,
  selectedPaintTypeId,
} from "@/lib/kit";

export default function KitCustomizer({
  offer,
  selection,
  onChange,
}: {
  offer: KitOffer;
  selection: KitSelection;
  onChange: (selection: KitSelection) => void;
}) {
  const extra = kitExtraPerPiece(offer, selection);
  const charge = offer.paints ? paintCharge(offer.paints, selection) : null;
  const brushesCharged = offer.brushes
    ? brushCharge(offer.brushes, selection)
    : null;

  const overall = offer.paints?.limitMode === "overall";
  const activeTypeId =
    !overall && offer.paints
      ? selectedPaintTypeId(offer.paints, selection)
      : null;

  const toggleColor = (group: KitPaintGroup, colorId: string) => {
    if (selection.colorIds.includes(colorId)) {
      onChange({
        ...selection,
        colorIds: selection.colorIds.filter((id) => id !== colorId),
      });
      return;
    }
    if (!overall && activeTypeId && group.typeId !== activeTypeId) return;
    const colorIds =
      !overall && offer.paints
        ? selection.colorIds.filter((id) =>
            group.colors.some((color) => color.id === id),
          )
        : selection.colorIds;
    onChange({ ...selection, colorIds: [...colorIds, colorId] });
  };

  const clearColors = () => onChange({ ...selection, colorIds: [] });

  const clearBrushes = () => {
    const included = new Set(
      offer.brushes?.items
        .filter((brush) => brush.included)
        .map((brush) => brush.id) ?? [],
    );
    onChange({
      ...selection,
      brushes: selection.brushes.filter((item) => included.has(item.id)),
    });
  };

  const addedBrush =
    offer.brushes?.items.some(
      (brush) =>
        !brush.included &&
        selection.brushes.some(
          (item) => item.id === brush.id && item.quantity > 0,
        ),
    ) ?? false;

  const toggleBrush = (brushId: string) => {
    if (
      offer.brushes?.items.some(
        (brush) => brush.id === brushId && brush.included,
      )
    )
      return;
    const selected = selection.brushes.some(
      (item) => item.id === brushId && item.quantity > 0,
    );
    const brushes = selection.brushes.filter((item) => item.id !== brushId);
    if (!selected) brushes.push({ id: brushId, quantity: 1 });
    onChange({ ...selection, brushes });
  };

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
        {offer.paints && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500">
                Choose colors
              </h3>
              {selection.colorIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearColors}
                  className="cursor-pointer text-sm font-bold text-primary"
                >
                  Clear all
                </button>
              )}
            </div>
            {overall && offer.paints && (
              <p className="text-sm font-extrabold leading-relaxed text-primary">
                {offer.paints.includedCount}{" "}
                {offer.paints.includedCount === 1 ? "color is" : "colors are"}{" "}
                included. Any other color is charged at its price.
              </p>
            )}
            {offer.paints.groups.map((group) => {
              const scopeColors = overall
                ? offer.paints!.groups.flatMap((item) => item.colors)
                : group.colors;
              const selectedInScope = scopeColors.filter((color) =>
                selection.colorIds.includes(color.id),
              );
              const includedInScope = overall
                ? offer.paints!.includedCount
                : group.includedCount;
              const coveredIds = new Set(
                [...selectedInScope]
                  .sort(
                    (a, b) =>
                      a.price - b.price || a.name.localeCompare(b.name),
                  )
                  .slice(0, Math.max(0, includedInScope))
                  .map((color) => color.id),
              );
              const allowanceReached =
                selectedInScope.length >= includedInScope;
              return (
                <div key={group.typeId} className="space-y-1.5">
                  <p className="text-sm font-extrabold leading-relaxed text-neutral-700">
                    {group.typeName}
                    {!overall && (
                      <span className="text-primary">
                        {" "}
                        - {group.includedCount} included. Each extra color is
                        charged at its own price.
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.colors.map((color) => {
                      const selected = selection.colorIds.includes(color.id);
                      const locked =
                        !overall &&
                        Boolean(activeTypeId) &&
                        group.typeId !== activeTypeId;
                      const showPrice =
                        allowanceReached &&
                        !coveredIds.has(color.id) &&
                        color.price > 0;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          disabled={locked}
                          onClick={() => toggleColor(group, color.id)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                            selected
                              ? "border-primary bg-primary text-white"
                              : locked
                                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                                : "cursor-pointer border-neutral-200 bg-white text-neutral-700 hover:bg-primary hover:text-white"
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-white/40"
                            style={{ background: color.hex || "#ddd" }}
                          />
                          {color.name}
                          {offer.paints?.showVolume && color.volumeMl != null
                            ? ` · ${color.volumeMl} ml`
                            : ""}
                          {showPrice ? ` · ₹${rupees(color.price)}` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {charge && charge.lines.length > 0 && (
              <div className="space-y-0.5">
                {charge.lines.map((line) => (
                  <p
                    key={line.typeId}
                    className="text-sm font-bold text-primary"
                  >
                    {line.count > 1
                      ? `${line.typeName} ×${line.count}`
                      : line.typeName}{" "}
                    · ₹{line.amount.toFixed(2)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="space-y-4 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
        {offer.brushes && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500">
                Choose Brushes
              </h3>
              {addedBrush && (
                <button
                  type="button"
                  onClick={clearBrushes}
                  className="cursor-pointer text-sm font-bold text-primary"
                >
                  Clear all
                </button>
              )}
            </div>
            <p className="text-sm font-semibold leading-relaxed text-primary">
              {offer.brushes.includedCount > 0
                ? `${offer.brushes.includedCount} ${offer.brushes.includedCount === 1 ? "brush is" : "brushes are"}
                included. Any other brush is charged at its price.`
                : `${offer.brushes.items.length} ${offer.brushes.items.length === 1 ? "brush is" : "brushes are"}
                included. Any other brush is charged at its price.`}
            </p>
            <div className="flex flex-wrap gap-2">
              {offer.brushes.items.map((brush) => {
                const selected = selection.brushes.some(
                  (item) => item.id === brush.id && item.quantity > 0,
                );
                const selectedBrushCount = selection.brushes.filter(
                  (item) => item.quantity > 0,
                ).length;
                const showPrice =
                  !brush.included &&
                  brush.price > 0 &&
                  (offer.brushes!.includedCount <= 0 ||
                    selectedBrushCount > offer.brushes!.includedCount);
                return (
                  <button
                    key={brush.id}
                    type="button"
                    disabled={brush.included}
                    onClick={() => toggleBrush(brush.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                      brush.included
                        ? "cursor-not-allowed border-primary bg-primary text-white disabled:opacity-100"
                        : selected
                          ? "cursor-pointer border-primary bg-primary text-white"
                          : "cursor-pointer border-neutral-200 bg-white text-neutral-700 hover:bg-primary hover:text-white"
                    }`}
                  >
                    {brush.name}
                    {offer.brushes?.showSizes && brush.size
                      ? ` · Size ${brush.size}`
                      : ""}
                    {brush.included
                      ? " · Included"
                      : showPrice
                        ? ` · ₹${rupees(brush.price)}`
                        : ""}
                  </button>
                );
              })}
            </div>
            {brushesCharged && brushesCharged.lines.length > 0 && (
              <div className="space-y-0.5">
                {brushesCharged.lines.map((line) => (
                  <p
                    key={line.typeId}
                    className="text-sm font-bold text-primary"
                  >
                    {line.count > 1
                      ? `${line.typeName} ×${line.count}`
                      : line.typeName}{" "}
                    · ₹{line.amount.toFixed(2)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>{" "}
      <div className="space-y-4 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
        {
          <p className="text-sm font-extrabold text-neutral-800">
            Extra charge: ₹{extra.toFixed(2)}
          </p>
        }
      </div>
    </>
  );
}

function rupees(amount: number) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
