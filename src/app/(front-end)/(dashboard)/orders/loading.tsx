export default function Loading() {
  return (
    <div aria-label="Loading orders" className="animate-pulse">
      <div className="mb-6 h-8 w-40 rounded bg-gray-200" />
      <div className="mb-4 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-8 w-20 shrink-0 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg border bg-white" />
        ))}
      </div>
    </div>
  );
}
