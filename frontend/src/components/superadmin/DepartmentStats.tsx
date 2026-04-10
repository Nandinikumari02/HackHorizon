import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Department {
  name: string;
  issues: number;
  resolved: number;
  color?: string;
}

interface DepartmentStatsItemProps {
  department: Department;
}

export function DepartmentStatsItem({ department }: DepartmentStatsItemProps) {
  // Real Data Check: Agar issues 0 hain toh rate 0 dikhao (Division by zero fix)
  const rate = department.issues > 0 
    ? Math.round((department.resolved / department.issues) * 100) 
    : 0;

  return (
    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        {/* Status indicator color */}
        <div className={cn('h-2 w-2 rounded-full shadow-sm', department.color || 'bg-primary')} />
        <span className="text-sm font-medium text-foreground/90">{department.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {department.resolved} / {department.issues}
        </span>
        <Badge 
          variant={rate > 80 ? "default" : "outline"} 
          className={cn(
            "text-[10px] px-1.5 h-5 min-w-[38px] justify-center",
            rate < 40 && "text-destructive border-destructive"
          )}
        >
          {rate}%
        </Badge>
      </div>
    </div>
  );
}

interface DepartmentStatsListProps {
  // 'any' isliye taaki backend ka raw array accept kar sake
  departments: any[]; 
  limit?: number;
}

export function DepartmentStatsList({ departments, limit }: DepartmentStatsListProps) {
  // Backend Mapping: Agar data Prisma se aa raha hai toh use format karein
  const formattedDepts = departments.map((d) => ({
    name: d.name || 'Unknown',
    // Backend mein _count.issues hota hai
    issues: d._count?.issues ?? d.issues ?? 0,
    // Agar backend resolved count nahi bhej raha toh default 0
    resolved: d.resolvedCount ?? d.resolved ?? 0,
    color: d.color || 'bg-blue-500'
  }));

  const displayDepartments = limit ? formattedDepts.slice(0, limit) : formattedDepts;

  return (
    <div className="space-y-1">
      {displayDepartments.length > 0 ? (
        displayDepartments.map((dept, index) => (
          <DepartmentStatsItem key={`${dept.name}-${index}`} department={dept} />
        ))
      ) : (
        <p className="text-xs text-center text-muted-foreground py-4 italic">
          No department data found.
        </p>
      )}
    </div>
  );
}