import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/staff/TaskCard';
import { EmptyTaskState } from '@/components/staff/EmptyTaskState';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  Filter,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { taskService } from '@/services/taskService';

export default function MyTasks() {
  
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getMyTasks();
      // Backend ke response format ke hisab se array extract karna
      const fetchedTasks = res.data?.tasks || res.data || [];
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tasks.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✅ Derived Status based on Backend Enums (usually UPPERCASE in Prisma/Node)
  const pendingTasks = tasks.filter(t => t.status === 'OPEN' || t.status === 'SUBMITTED');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');

  const filteredTasks = statusFilter === 'all' 
    ? tasks 
    : tasks.filter(t => {
        if (statusFilter === 'pending') return t.status === 'OPEN' || t.status === 'SUBMITTED';
        if (statusFilter === 'in_progress') return t.status === 'IN_PROGRESS';
        return t.status === statusFilter;
      });

  const handleResolve = () => {
    // List ko refresh karna jab koi task resolve ho jaye
    fetchTasks();
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-muted-foreground italic">Fetching your assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            My Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            {tasks.length} tasks assigned to you
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{tasks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending <span className="bg-warning/20 text-warning px-2 py-0.5 rounded-full text-xs">{pendingTasks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            In Progress <span className="bg-info/20 text-info px-2 py-0.5 rounded-full text-xs">{inProgressTasks.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <EmptyTaskState />
          ) : (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onResolve={handleResolve} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingTasks.length === 0 ? (
            <EmptyTaskState message="No pending tasks" />
          ) : (
            pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} onResolve={handleResolve} />
            ))
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressTasks.length === 0 ? (
            <EmptyTaskState message="No tasks in progress" />
          ) : (
            inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} onResolve={handleResolve} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}