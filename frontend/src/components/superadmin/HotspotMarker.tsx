import { cn } from '@/lib/utils';

interface HotspotMarkerProps {
  name: string;
  issues: number;
  severity: 'high' | 'medium' | 'low';
  position: { top: string; left: string };
  onClick?: () => void;
}

export function HotspotMarker({ name, issues, severity, position, onClick }: HotspotMarkerProps) {
  const getSeverityColor = () => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/20 border-destructive/40 text-destructive';
      case 'medium':
        return 'bg-warning/20 border-warning/40 text-warning';
      default:
        return 'bg-success/20 border-success/40 text-success';
    }
  };

  return (
    <div
      className={cn(
        'absolute cursor-pointer transition-all hover:scale-110 z-10',
        'h-16 w-16 rounded-full flex items-center justify-center border-2',
        getSeverityColor()
      )}
      style={{ top: position.top, left: position.left }}
      title={name}
      onClick={onClick}
    >
      <div className="text-center">
        <span className="font-bold text-lg">{issues}</span>
      </div>
    </div>
  );
}

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
  return (
    <div className={cn('bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg', className)}>
      <p className="text-xs font-medium mb-2">Issue Density</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-xs text-muted-foreground">High (20+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Medium (10-20)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Low (&lt;10)</span>
        </div>
      </div>
    </div>
  );
}
