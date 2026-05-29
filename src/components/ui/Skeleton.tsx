export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-warm-beige ${className}`} />;
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}
