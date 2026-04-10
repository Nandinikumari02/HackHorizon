import { cn } from '@/lib/utils';

interface ResolutionRateBarProps {
  name: string;
  resolved: number;
  total: number;
}

export function ResolutionRateBar({ name, resolved, total }: ResolutionRateBarProps) {
  // Real Data Fix: Total 0 hone par NaN se bachne ke liye check
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {resolved}/{total} ({rate}%)
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-in-out',
            // Colors fallback (Agar success/warning define nahi hain)
            rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
          )}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

interface ResolutionRatesListProps {
  // Backend raw data handle karne ke liye generic type
  items: any[]; 
}

export function ResolutionRatesList({ items }: ResolutionRatesListProps) {
  return (
    <div className="space-y-5">
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <ResolutionRateBar
            // Key safety: name ke sath index use karna best hai
            key={`${item.name}-${index}`}
            name={item.name}
            // Prisma mapping compatibility check
            resolved={item.resolved ?? item.resolvedCount ?? 0}
            total={item._count?.issues ?? item.issues ?? item.total ?? 0}
          />
        ))
      ) : (
        <div className="py-8 text-center border rounded-lg border-dashed">
           <p className="text-xs text-muted-foreground italic">No resolution data available</p>
        </div>
      )}
    </div>
  );
}