import { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, List, Grid3X3, Locate, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';

export default function TaskMap() {
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getAssignedPickups();
      const list = res.data;
      setTasks(Array.isArray(list) ? list : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'assigned') return 'bg-indigo-500';
    if (s === 'pending') return 'bg-amber-500';
    if (s === 'completed') return 'bg-emerald-500';
    return 'bg-muted-foreground';
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-muted-foreground italic">Loading locations…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Pickup map
          </h1>
          <p className="text-muted-foreground mt-1">Assigned pickups (conceptual layout)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="gap-1"
          >
            <Grid3X3 className="h-4 w-4" />
            Map
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-1"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-indigo-500" />
          Assigned
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          Pending
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className={cn('lg:col-span-2 overflow-hidden', viewMode === 'list' && 'hidden lg:block')}>
          <CardContent className="p-0">
            <div className="h-[500px] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-muted-foreground"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <Button size="sm" variant="secondary" className="absolute top-4 right-4 gap-1 shadow-lg z-10">
                <Locate className="h-4 w-4" />
                My location
              </Button>

              {tasks.map((task, index) => {
                const positions = [
                  { top: '15%', left: '20%' },
                  { top: '35%', left: '60%' },
                  { top: '55%', left: '30%' },
                  { top: '25%', left: '75%' },
                  { top: '70%', left: '50%' },
                  { top: '40%', left: '15%' },
                ];
                const pos = positions[index % positions.length];
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'absolute cursor-pointer transition-transform hover:scale-110 z-20',
                      selectedTask?.id === task.id && 'scale-125'
                    )}
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center shadow-lg',
                        getStatusColor(task.status)
                      )}
                    >
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                  </div>
                );
              })}

              {tasks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-muted-foreground/50 text-sm">No active pickups</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className={cn('space-y-4', viewMode === 'map' && 'hidden lg:block')}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {selectedTask ? 'Details' : 'All pickups'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTask ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={selectedTask.wasteLog?.category?.name || 'General'} />
                    <StatusBadge status={selectedTask.status} />
                  </div>
                  <h3 className="font-semibold">{selectedTask.wasteLog?.materialName}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedTask.wasteLog?.latitude != null &&
                    selectedTask.wasteLog?.longitude != null
                      ? `${selectedTask.wasteLog.latitude}, ${selectedTask.wasteLog.longitude}`
                      : '—'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-1"
                      onClick={() => {
                        const lat = selectedTask.wasteLog?.latitude ?? 28.6139;
                        const lng = selectedTask.wasteLog?.longitude ?? 77.209;
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                      Navigate
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedTask(null)}>
                      Back
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn('h-2 w-2 rounded-full', getStatusColor(task.status))} />
                        <CategoryBadge category={task.wasteLog?.category?.name || 'General'} />
                      </div>
                      <p className="font-medium text-sm">{task.wasteLog?.materialName}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.wasteLog?.latitude}, {task.wasteLog?.longitude}
                      </p>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
