import type { CartCustomization } from "@/lib/kit";

export default function KitSelectionSummary({
  customization,
  className = "",
}: {
  customization?: CartCustomization | null;
  className?: string;
}) {
  const colors = customization?.colors ?? [];
  const brushes = customization?.brushes ?? [];
  const extra = Number(customization?.extraPerPiece) || 0;
  if (!colors.length && !brushes.length && extra <= 0) return null;

  return (
    <div className={`space-y-1 text-sm leading-relaxed text-neutral-600 ${className}`}>
      {colors.length > 0 && (
        <p className="wrap-break-word">
          <span className="font-bold text-neutral-800">Colors: </span>
          {colors.map((color) => color.name).join(", ")}
        </p>
      )}
      {brushes.length > 0 && (
        <p className="wrap-break-word">
          <span className="font-bold text-neutral-800">Brushes: </span>
          {brushes
            .map((brush) => {
              const size = brush.size ? ` size ${brush.size}` : "";
              const quantity = brush.quantity > 1 ? ` ×${brush.quantity}` : "";
              return `${brush.name}${size}${quantity}`;
            })
            .join(", ")}
        </p>
      )}
      {extra > 0 && (
        <p className="wrap-break-word font-bold text-neutral-800">
          Extra charge ₹{extra.toFixed(2)}
        </p>
      )}
    </div>
  );
}
