import { useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Calendar, User, Phone } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ResolveDialog } from './ResolveDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { API_BASE_URL } from '@/services/taskService';

export interface PickupTaskShape {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  wasteLog: {
    id?: string;
    materialName: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
    category?: { name?: string } | null;
    user?: { fullname?: string; phoneNumber?: string } | null;
  };
}

function imageUrl(path?: string) {
  if (!path) return '/placeholder-issue.jpg';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

interface PickupTaskCardProps {
  task: PickupTaskShape;
  onComplete: () => void;
  variant?: 'default' | 'compact';
  showTimestamp?: boolean;
}

export function PickupTaskCard({
  task,
  onComplete,
  variant = 'default',
  showTimestamp = true,
}: PickupTaskCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const wl = task.wasteLog;
  const categoryName = wl?.category?.name || 'General';
  const lat = wl?.latitude;
  const lng = wl?.longitude;

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lat != null && lng != null) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  return (
    <>
      <Card
        className="overflow-hidden border-l-4 border-l-emerald-600/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setDetailOpen(true)}
      >
        <CardContent className="p-0">
          <div className={`flex ${variant === 'compact' ? 'min-h-[120px]' : 'min-h-[150px]'}`}>
            <div
              className={`${variant === 'compact' ? 'w-28' : 'w-36 sm:w-44'} relative shrink-0 overflow-hidden bg-muted border-r`}
            >
              <img
                src={imageUrl(wl?.imageUrl)}
                alt={wl?.materialName}
                className="w-full h-full object-cover min-h-[120px]"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = '/placeholder-issue.jpg';
                }}
              />
            </div>

            <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CategoryBadge category={categoryName} />
                  <StatusBadge status={task.status} />
                </div>
                {showTimestamp && task.createdAt && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.createdAt), 'dd MMM')}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm sm:text-base line-clamp-2 text-foreground">
                {wl?.materialName || 'Pickup'}
              </h3>

              <p className="text-[11px] text-muted-foreground mt-1">
                Requested{' '}
                {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </p>

              {wl?.user?.fullname && (
                <p className="text-[11px] flex items-center gap-1 mt-1 text-muted-foreground">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{wl.user.fullname}</span>
                  {wl.user.phoneNumber && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <Phone className="h-3 w-3" />
                      {wl.user.phoneNumber}
                    </span>
                  )}
                </p>
              )}

              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-2 line-clamp-1">
                <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
                {lat != null && lng != null ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Location from scan'}
              </p>

              <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={handleNavigate}
                  disabled={lat == null || lng == null}
                >
                  <Navigation className="h-3 w-3" />
                  Maps
                </Button>
                <ResolveDialog task={task} onResolve={onComplete} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{wl?.materialName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <img
              src={imageUrl(wl?.imageUrl)}
              alt=""
              className="w-full rounded-lg border max-h-56 object-cover"
            />
            <div className="flex gap-2 flex-wrap">
              <CategoryBadge category={categoryName} />
              <StatusBadge status={task.status} />
            </div>
            {wl?.user && (
              <p>
                <span className="font-medium">Contact:</span> {wl.user.fullname}
                {wl.user.phoneNumber ? ` · ${wl.user.phoneNumber}` : ''}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleNavigate}>
                Open in Maps
              </Button>
              <ResolveDialog task={task} onResolve={() => { setDetailOpen(false); onComplete(); }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
