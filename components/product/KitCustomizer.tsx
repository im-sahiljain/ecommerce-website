"use client";

import type { KitOffer, KitPaintGroup, KitSelection } from "@/lib/kit";
import { kitExtraPerPiece, paintCharge } from "@/lib/kit";

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
  const charge = offer.paints
    ? paintCharge(offer.paints.groups, selection)
    : null;
  const brushCount = offer.brushes
    ? selection.brushes.reduce((sum, item) => {
        return offer.brushes?.items.some((brush) => brush.id === item.id)
          ? sum + item.quantity
          : sum;
      }, 0)
    : 0;

  const chosenIn = (group: KitPaintGroup) =>
    selection.colorIds.filter((id) =>
      group.colors.some((color) => color.id === id),
    ).length;

  const toggleColor = (group: KitPaintGroup, colorId: string) => {
    if (selection.colorIds.includes(colorId)) {
      onChange({
        ...selection,
        colorIds: selection.colorIds.filter((id) => id !== colorId),
      });
      return;
    }
    if (chosenIn(group) >= group.maxCount) return;
    onChange({ ...selection, colorIds: [...selection.colorIds, colorId] });
  };

  const setBrushQty = (brushId: string, quantity: number) => {
    if (!offer.brushes) return;
    const current =
      selection.brushes.find((item) => item.id === brushId)?.quantity || 0;
    const nextTotal = brushCount - current + quantity;
    if (quantity < 0 || nextTotal > offer.brushes.maxCount) return;
    const brushes = selection.brushes.filter((item) => item.id !== brushId);
    if (quantity > 0) brushes.push({ id: brushId, quantity });
    onChange({ ...selection, brushes });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
      {offer.paints && (
        <div className="space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            Choose colors
          </h3>
          {offer.paints.groups.map((group) => {
            const chosen = chosenIn(group);
            const limit = group.includedCount || group.maxCount;
            return (
              <div key={group.typeId} className="space-y-1.5">
                <p className="text-[11px] font-extrabold leading-relaxed text-neutral-700">
                  {group.typeName} -{" "}
                  <span className="text-primary">
                    {" "}
                    Choose max {limit} {limit === 1 ? "color" : "colors"}. Rs{" "}
                    {rupees(group.extraPerColor)} for extra color
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.colors.map((color) => {
                    const selected = selection.colorIds.includes(color.id);
                    const blocked = !selected && chosen >= group.maxCount;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        disabled={blocked}
                        onClick={() => toggleColor(group, color.id)}
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold cursor-pointer transition-colors${
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-neutral-200 bg-white text-neutral-700 disabled:opacity-40 hover:bg-primary hover:text-white"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/40"
                          style={{ background: color.hex || "#ddd" }}
                        />
                        {color.name}
                        {offer.paints?.showVolume && color.volumeMl != null
                          ? ` · ${color.volumeMl} ml`
                          : ""}
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
                  className="text-[11px] font-bold text-primary"
                >
                  {line.count} extra {line.typeName.toLowerCase()} · ₹
                  {line.amount.toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {offer.brushes && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              Brushes
            </h3>
            <span className="text-[11px] font-bold text-neutral-500">
              {brushCount} / {offer.brushes.maxCount}
            </span>
          </div>
          <p className="text-[11px] font-semibold leading-relaxed text-neutral-500">
            {offer.brushes.includedCount} included in the price.
            {offer.brushes.extraPerBrush > 0
              ? ` Each extra brush is ₹${offer.brushes.extraPerBrush.toFixed(2)} per piece.`
              : ""}
          </p>
          <div className="space-y-2">
            {offer.brushes.items.map((brush) => {
              const quantity =
                selection.brushes.find((item) => item.id === brush.id)
                  ?.quantity || 0;
              return (
                <div
                  key={brush.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
                >
                  <span className="text-xs font-bold text-neutral-800">
                    {brush.name}
                    {offer.brushes?.showSizes && brush.size
                      ? ` · ${brush.size}`
                      : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBrushQty(brush.id, quantity - 1)}
                      className="h-7 w-7 rounded-full border border-neutral-200 text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-xs font-extrabold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBrushQty(brush.id, quantity + 1)}
                      disabled={brushCount >= offer.brushes!.maxCount}
                      className="h-7 w-7 rounded-full border border-neutral-200 text-sm font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {extra > 0 && (
        <p className="text-xs font-extrabold text-neutral-800">
          Extra charge: ₹{extra.toFixed(2)}
        </p>
      )}
    </div>
  );
}

function rupees(amount: number) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
