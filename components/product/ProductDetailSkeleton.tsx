export default function ProductDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse px-4 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading product</span>
      <div className="grid grid-cols-1 gap-10 sm:[box-shadow:0px_10px_30px_rgba(30,41,59,0.05)] sm:rounded-3xl sm:border sm:border-neutral-100 sm:bg-white sm:p-10 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-neutral-200" />
          <div className="flex gap-3">
            <div className="h-16 w-16 rounded-2xl bg-neutral-200" />
            <div className="h-16 w-16 rounded-2xl bg-neutral-200" />
            <div className="h-16 w-16 rounded-2xl bg-neutral-200" />
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-4 w-40 rounded-full bg-neutral-200" />
          <div className="h-9 w-3/4 rounded-xl bg-neutral-200" />
          <div className="h-10 w-48 rounded-xl bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded-lg bg-neutral-200" />
            <div className="h-4 w-11/12 rounded-lg bg-neutral-200" />
            <div className="h-4 w-2/3 rounded-lg bg-neutral-200" />
          </div>
          <div className="h-28 rounded-3xl bg-neutral-200" />
          <div className="space-y-3 rounded-2xl bg-neutral-100 p-4">
            <div className="h-4 w-32 rounded-full bg-neutral-200" />
            <div className="flex flex-wrap gap-2">
              <div className="h-9 w-28 rounded-full bg-neutral-200" />
              <div className="h-9 w-24 rounded-full bg-neutral-200" />
              <div className="h-9 w-32 rounded-full bg-neutral-200" />
              <div className="h-9 w-20 rounded-full bg-neutral-200" />
            </div>
          </div>
          <div className="space-y-3 rounded-2xl bg-neutral-100 p-4">
            <div className="h-4 w-36 rounded-full bg-neutral-200" />
            <div className="flex flex-wrap gap-2">
              <div className="h-9 w-36 rounded-full bg-neutral-200" />
              <div className="h-9 w-40 rounded-full bg-neutral-200" />
              <div className="h-9 w-32 rounded-full bg-neutral-200" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-11 rounded-full bg-neutral-200" />
            <div className="h-11 rounded-full bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
