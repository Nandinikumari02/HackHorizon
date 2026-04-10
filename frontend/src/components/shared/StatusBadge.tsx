import { cn } from '@/lib/utils';
import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Backend statuses usually look like these
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

interface StatusBadgeProps {
  // string use kar rahe hain taaki backend se PENDING ya pending dono handle ho sakein
  status: any; 
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // 1. Normalize status (lowercase conversion safe check)
  const s = String(status || 'pending').toLowerCase();

  // 2. Dynamic Config Map (Switch ki jagah Map use karna zyada fast aur safe hai)
  const statusConfig: Record<string, any> = {
    pending: {
      icon: Clock,
      style: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    in_progress: {
      icon: Loader2,
      style: 'bg-blue-100 text-blue-700 border-blue-200',
      animate: true
    },
    resolved: {
      icon: CheckCircle2,
      style: 'bg-green-100 text-green-700 border-green-200',
    },
    rejected: {
      icon: AlertCircle,
      style: 'bg-red-100 text-red-700 border-red-200',
    }
  };

  // 3. Fallback logic: Agar backend se koi anjaan status aaye toh 'pending' wala style dikhao
  const config = statusConfig[s] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all',
      config.style,
      className
    )}>
      <Icon className={cn('h-3.5 w-3.5', config.animate && 'animate-spin')} />
      <span className="whitespace-nowrap">
        {STATUS_LABELS[s] || s.replace('_', ' ').toUpperCase()}
      </span>
    </span>
  );
}