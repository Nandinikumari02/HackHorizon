import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/card';
import { PickupTaskCard } from '@/components/staff/PickupTaskCard';
import { EmptyTaskState } from '@/components/staff/EmptyTaskState';
import { ClipboardList, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/services/taskService';

export function StaffDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activePickups, setActivePickups] = useState<any[]>([]);
  const [completedPickups, setCompletedPickups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resActive, resCompleted] = await Promise.all([
        taskService.getAssignedPickups(),
        taskService.getCompletedPickups(),
      ]);

      const active = resActive.data;
      const completed = resCompleted.data;

      setActivePickups(Array.isArray(active) ? active : []);
      setCompletedPickups(Array.isArray(completed) ? completed : []);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not refresh dashboard.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const totalDone = completedPickups.length;
  const completedToday = completedPickups.filter(
    (t) => new Date(t.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hello, {user?.fullname?.split(' ')[0] || 'Field staff'}
        </h1>
        <p className="text-muted-foreground mt-1">
          You have {activePickups.length} active pickup{activePickups.length === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active"
          value={activePickups.length}
          icon={ClipboardList}
          variant="primary"
        />
        <StatsCard
          title="Done today"
          value={completedToday}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard title="Avg. focus" value="—" icon={Clock} />
        <StatsCard title="Total completed" value={totalDone} icon={CheckCircle2} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assigned now
          </h2>
          <div className="space-y-4">
            {activePickups.length === 0 ? (
              <EmptyTaskState message="Nothing assigned — check back soon." />
            ) : (
              activePickups.map((task) => (
                <PickupTaskCard
                  key={task.id}
                  task={task}
                  onComplete={fetchAllData}
                  variant="compact"
                  showTimestamp={false}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Map preview
          </h2>
          <Card className="h-[400px] overflow-hidden border-dashed">
            <div className="h-full bg-muted/40 flex items-center justify-center relative">
              <div className="text-center px-6">
                <MapPin className="h-14 w-14 text-muted-foreground/35 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Open <strong>Task map</strong> for coordinates, or use <strong>Maps</strong> on each
                  card.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {activePickups.length} location{activePickups.length === 1 ? '' : 's'} this period
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
