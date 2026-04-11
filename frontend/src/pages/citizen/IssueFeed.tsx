import { useState, useEffect, useCallback } from 'react';
import { wasteService } from '@/services/wasteService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { FileWarning, Loader2, SearchX, Calendar, MapPin } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { API_BASE_URL } from '@/services/taskService';

function imgUrl(path: string | undefined) {
  if (!path) return '/placeholder-issue.jpg';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function IssueFeed() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await wasteService.getMyHistory();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const scanned = logs.filter((l) => l.status === 'SCANNED');
  const pickup = logs.filter((l) =>
    ['REQUESTED_PICKUP', 'PICKED_UP'].includes(l.status)
  );
  const done = logs.filter((l) => l.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="mt-4 text-muted-foreground font-medium">Loading your eco history…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FileWarning className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scan history</h1>
          <p className="text-muted-foreground text-sm">
            Your saved waste logs and pickup progress
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="all">
            All <span className="ml-1 text-[10px] bg-primary/10 text-primary rounded-full px-1.5">{logs.length}</span>
          </TabsTrigger>
          <TabsTrigger value="scanned">
            Logged <span className="ml-1 text-[10px] rounded-full px-1.5 bg-blue-500/10 text-blue-700">{scanned.length}</span>
          </TabsTrigger>
          <TabsTrigger value="pickup">
            Pickup <span className="ml-1 text-[10px] rounded-full px-1.5 bg-amber-500/10 text-amber-800">{pickup.length}</span>
          </TabsTrigger>
          <TabsTrigger value="done">
            Done <span className="ml-1 text-[10px] rounded-full px-1.5 bg-emerald-500/10 text-emerald-800">{done.length}</span>
          </TabsTrigger>
        </TabsList>

        {(['all', 'scanned', 'pickup', 'done'] as const).map((tab) => {
          const list =
            tab === 'all'
              ? logs
              : tab === 'scanned'
                ? scanned
                : tab === 'pickup'
                  ? pickup
                  : done;

          return (
            <TabsContent key={tab} value={tab} className="space-y-4 outline-none">
              {list.length > 0 ? (
                list.map((log) => (
                  <Card
                    key={log.id}
                    className="overflow-hidden border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-44 h-40 sm:h-auto shrink-0 bg-muted">
                          <img
                            src={imgUrl(log.imageUrl)}
                            alt=""
                            className="w-full h-full object-cover min-h-[160px]"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-issue.jpg';
                            }}
                          />
                        </div>
                        <div className="p-4 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CategoryBadge category={log.category?.name || 'General'} />
                            <StatusBadge status={log.status} />
                          </div>
                          <h3 className="font-bold text-lg">{log.materialName}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(log.createdAt), 'MMM d, yyyy')} ·{' '}
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {log.latitude?.toFixed?.(3)}, {log.longitude?.toFixed?.(3)}
                            </span>
                          </p>
                          {log.pickupRequest && (
                            <p className="text-xs font-medium text-amber-800 bg-amber-500/10 rounded-md px-2 py-1 inline-block">
                              Pickup: {log.pickupRequest.status}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                  <SearchX className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold">Nothing here yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Run a scan from the dashboard and save it to build your history.
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
