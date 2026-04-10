import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = 'text-primary',
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 mt-1 text-sm',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{change}%</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center bg-muted',
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
