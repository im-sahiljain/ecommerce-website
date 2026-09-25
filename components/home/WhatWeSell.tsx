export const whatWeSellBottomColor = "var(--color-blush)";

export default function WhatWeSell() {
  return (
    <section
      className="relative overflow-hidden px-6 pb-8 pt-16"
      style={{ backgroundImage: "linear-gradient(#ffffff, var(--color-blush))" }}
    >
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl duration-[6s]" />
      <div className="absolute bottom-24 left-0 -z-10 h-80 w-80 animate-pulse rounded-full bg-info-100/30 blur-3xl duration-[8s]" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary/15 text-primary tracking-wider uppercase">
            ✨ Discover Our Handcrafted Collections
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight">
            What do we sell?
          </h2>
          <p className="text-neutral-600 font-medium text-sm sm:text-base leading-relaxed">
            We sell the best{" "}
            <span className="font-bold text-secondary">POP painting kits</span>,
            ready-to-paint plaster figurines, and creative craft activity kits
            in India. Ignite your child’s imagination with child-safe, creative
            craft activity boxes, screen-free painting sets, and fun plaster
            figurines!
          </p>
        </div>
      </div>
    </section>
  );
}
