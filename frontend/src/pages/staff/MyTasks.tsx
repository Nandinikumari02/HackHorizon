import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PickupTaskCard } from '@/components/staff/PickupTaskCard';
import { EmptyTaskState } from '@/components/staff/EmptyTaskState';
import { ClipboardList, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/services/taskService';

export default function MyTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getAssignedPickups();
      const list = res.data;
      setTasks(Array.isArray(list) ? list : []);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load assigned pickups.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const assigned = useMemo(
    () => tasks.filter((t) => String(t.status).toUpperCase() === 'ASSIGNED'),
    [tasks]
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-muted-foreground italic">Loading your assignments…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            My pickups
          </h1>
          <p className="text-muted-foreground mt-1">
            {assigned.length} active assignment{assigned.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All{' '}
            <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{tasks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="assigned" className="gap-2">
            <Clock className="h-4 w-4" />
            Assigned{' '}
            <span className="bg-amber-500/15 text-amber-800 px-2 py-0.5 rounded-full text-xs">
              {assigned.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {tasks.length === 0 ? (
            <EmptyTaskState message="No pickups assigned yet." />
          ) : (
            tasks.map((task) => (
              <PickupTaskCard key={task.id} task={task} onComplete={fetchTasks} />
            ))
          )}
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          {assigned.length === 0 ? (
            <EmptyTaskState message="No assigned pickups right now." />
          ) : (
            assigned.map((task) => (
              <PickupTaskCard key={task.id} task={task} onComplete={fetchTasks} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
