import { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Navigation,
  List,
  Grid3X3,
  Locate,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';

export default function TaskMap() {
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Real Data Fetching
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getMyTasks();
      const allTasks = res.data?.tasks || res.data || [];
      // Sirf wo tasks dikhana jo resolve nahi huye hain (Active Tasks)
      const activeTasks = allTasks.filter((t: any) => 
        t.status !== 'RESOLVED' && t.status !== 'resolved'
      );
      setTasks(activeTasks);
    } catch (error) {
      console.error("Error loading map tasks", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending':
      case 'open':
        return 'bg-warning';
      case 'in_progress':
        return 'bg-info';
      case 'resolved':
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-muted-foreground italic">Mapping your tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Task Map
          </h1>
          <p className="text-muted-foreground mt-1">
            View all your task locations on the map
          </p>
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

      {/* Map Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning" />
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-info" />
          <span className="text-sm text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Resolved</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map View */}
        <Card className={cn("lg:col-span-2 overflow-hidden", viewMode === 'list' && 'hidden lg:block')}>
          <CardContent className="p-0">
            <div className="h-[500px] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
              {/* Mock Map Background SVG */}
              <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 gap-1 shadow-lg z-10"
              >
                <Locate className="h-4 w-4" />
                My Location
              </Button>

              {/* ✅ Markers for Real Tasks */}
              {tasks.map((task, index) => {
                // Agar lat/lng nahi hai toh hum index ke basis par mock positions generate kar rahe hain UI ke liye
                // Asli Google Map integration mein aap task.lat aur task.lng use karenge
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
                      "absolute cursor-pointer transition-transform hover:scale-110 z-20",
                      selectedTask?.id === task.id && 'scale-125'
                    )}
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shadow-lg animate-pulse-soft",
                        getStatusColor(task.status)
                      )}
                    >
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                  </div>
                );
              })}

              {!selectedTask && tasks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-muted-foreground/50 text-sm">No active tasks found on map</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task List / Details Panel */}
        <div className={cn("space-y-4", viewMode === 'map' && 'hidden lg:block')}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {selectedTask ? 'Task Details' : 'All Tasks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTask ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={selectedTask.category} />
                    <StatusBadge status={selectedTask.status} />
                  </div>
                  <h3 className="font-semibold">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedTask.location?.address || selectedTask.address}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-1"
                      onClick={() => {
                        const lat = selectedTask.location?.lat || 28.6139;
                        const lng = selectedTask.location?.lng || 77.2090;
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
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("h-2 w-2 rounded-full", getStatusColor(task.status))} />
                        <CategoryBadge category={task.category} />
                      </div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.location?.address || task.address}
                      </p>
                    </div>
                  ))}
                  {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No active tasks</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}