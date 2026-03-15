export function Skeleton({ lines }: { lines?: boolean }) {
  return (
    <div className="rounded-2xl border border-motion-border bg-motion-panel/70 p-5 shadow-glow">
      <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-10 w-full animate-pulse rounded bg-white/10" />
      {lines ? (
        <div className="mt-4 space-y-2">
          <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
        </div>
      ) : null}
    </div>
  );
}
