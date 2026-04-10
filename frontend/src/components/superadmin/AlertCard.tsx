import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns'; // Time format ke liye (npm install date-fns)

interface Alert {
  id: string | number;
  type: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
}

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4 transition-all hover:bg-muted/50', // Added hover for better feel
        alert.type === 'critical' && 'border-l-destructive bg-destructive/5',
        alert.type === 'warning' && 'border-l-warning bg-warning/5',
        alert.type === 'info' && 'border-l-success bg-success/5'
      )}
    >
      <p className="text-sm font-medium line-clamp-2">{alert.message}</p>
      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
    </div>
  );
}

interface AlertsListProps {
  // Backend se aane wala raw data handle karne ke liye
  alerts: any[]; 
}

export function AlertsList({ alerts }: AlertsListProps) {
  // Backend issues ko Alerts format mein map karna
  const formattedAlerts = alerts.map((issue): Alert => {
    // 1. Priority/Status ke hisaab se type decide karna
    let alertType: 'critical' | 'warning' | 'info' = 'info';
    if (issue.priority === 'HIGH' || issue.status === 'EMERGENCY') alertType = 'critical';
    else if (issue.priority === 'MEDIUM') alertType = 'warning';

    return {
      id: issue.id,
      type: alertType,
      message: issue.title || issue.message,
      // 2. Date ko "2 hours ago" format mein convert karna
      time: issue.createdAt 
        ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })
        : 'Recently'
    };
  });

  return (
    <div className="space-y-3">
      {formattedAlerts.length > 0 ? (
        formattedAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))
      ) : (
        <div className="text-center py-6 border rounded-lg border-dashed">
          <p className="text-xs text-muted-foreground">No active alerts at the moment</p>
        </div>
      )}
    </div>
  );
}