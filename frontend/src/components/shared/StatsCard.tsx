import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'gradient-primary text-white',
    success: 'gradient-success text-white',
    warning: 'bg-[hsl(var(--warning-light))] border-[hsl(var(--warning))] text-black',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-white/20 text-white',
    success: 'bg-white/20 text-white',
    warning: 'bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]',
  };
  return (
    <div
      className={cn(
        'rounded-xl p-5 border shadow-card card-hover',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'default' ? 'text-muted-foreground' : 'text-white/80',
              variant === 'warning' && 'text-black/70',
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p
              className={cn(
                'text-xs',
                variant === 'default' ? 'text-muted-foreground' : 'text-white/70'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
