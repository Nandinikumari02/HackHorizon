import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/card';
import { TaskCard } from '@/components/staff/TaskCard';
import { EmptyTaskState } from '@/components/staff/EmptyTaskState';
import { ClipboardList, CheckCircle2, Clock, MapPin} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/services/taskService';

export function StaffDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Dono APIs ko ek saath call karo
      const [resActive, resCompleted] = await Promise.all([
        taskService.getMyTasks(),
        taskService.getMyCompletedTasks()
      ]);

      // 2. Data extract karo
      const active = resActive.data?.tasks || resActive.data || [];
      const completed = resCompleted.data || [];

      setActiveTasks(Array.isArray(active) ? active : []);
      setCompletedTasks(Array.isArray(completed) ? completed : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Stats update nahi ho paaye."
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Calculation for stats
  const totalResolved = completedTasks.length;
  const completedToday = completedTasks.filter(t => 
    new Date(t.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good morning, {user?.fullname?.split(' ')[0] || 'Agent'}! 🔧
        </h1>
        <p className="text-muted-foreground mt-1">
          You have {activeTasks.length} tasks pending today
        </p>
      </div>

      {/* Stats - Ab ye real data dikhayenge */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Tasks"
          value={activeTasks.length}
          icon={ClipboardList}
          variant="primary"
        />
        <StatsCard
          title="Completed Today"
          value={completedToday}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard title="Avg. Time" value="2.4h" icon={Clock} />
        <StatsCard
          title="Total Resolved"
          value={totalResolved}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            My Tasks
          </h2>
          <div className="space-y-4">
            {activeTasks.length === 0 ? (
              <EmptyTaskState />
            ) : (
              activeTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onResolve={fetchAllData} // Pass refresh function
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
            Task Locations
          </h2>
          <Card className="h-[400px] overflow-hidden">
            <div className="h-full bg-muted flex items-center justify-center relative">
               {/* Map UI remains same */}
               <div className="text-center">
                <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Map View</p>
                <p className="text-sm text-muted-foreground/70">
                   Showing {activeTasks.length} locations
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}