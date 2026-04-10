import { useState, useEffect, useCallback } from 'react';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Standard Badge component
import { StatsCard } from '@/components/shared/StatsCard';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Filter,
  Loader2,
  Maximize2,
} from 'lucide-react';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { taskService, API_BASE_URL } from '@/services/taskService';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Completed() {
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getFullImageUrl = (path: string | undefined) => {
    if (!path) return 'https://placehold.co/400x300?text=No+Photo';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const fetchCompletedTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getMyCompletedTasks();
      const fetchedTasks = res.data || [];
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
    } catch (error) {
      console.error("Error fetching completed tasks", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedTasks();
  }, [fetchCompletedTasks]);

  const filteredTasks = tasks.filter(t => {
    const resolvedDate = new Date(t.updatedAt);
    const now = new Date();
    if (timeFilter === 'today') return isAfter(resolvedDate, startOfDay(now));
    if (timeFilter === 'week') return isAfter(resolvedDate, subDays(now, 7));
    if (timeFilter === 'month') return isAfter(resolvedDate, subDays(now, 30));
    return true;
  });

  const todayCompleted = tasks.filter(t => 
    format(new Date(t.updatedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const weekCompleted = tasks.filter(t => 
    isAfter(new Date(t.updatedAt), subDays(new Date(), 7))
  ).length;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-success opacity-50" />
        <p className="text-muted-foreground italic">Loading your achievements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-success" />
            Completed Tasks
          </h1>
          <p className="text-muted-foreground mt-1">Review your work and achievements</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Today" value={todayCompleted} icon={CheckCircle2} variant="success" />
        <StatsCard title="This Week" value={weekCompleted} icon={TrendingUp} variant="primary" />
        <StatsCard title="Total" value={tasks.length} icon={Award} />
        <StatsCard title="Avg. Time" value="2.3h" icon={Clock} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Task History</h2>
        
        {filteredTasks.length === 0 ? (
          <Card><CardContent className="p-8 text-center"><p>No tasks found.</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden border-l-4 border-l-green-500">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    
                    <div className="flex md:w-64 flex-shrink-0 bg-muted">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative w-1/2 md:w-32 h-40 cursor-pointer group">
                            <img src={getFullImageUrl(task.issue?.beforeImages?.[0])} alt="Before" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="text-white h-5 w-5" />
                            </div>
                            <Badge className="absolute top-2 left-2 bg-black/60 text-white border-none">Before</Badge>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl border-none p-0 overflow-hidden bg-transparent">
                           <img src={getFullImageUrl(task.issue?.beforeImages?.[0])} className="w-full h-auto rounded-lg" />
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative w-1/2 md:w-32 h-40 cursor-pointer group border-l border-white/10">
                            <img src={getFullImageUrl(task.issue?.afterImages?.[0])} alt="After" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="text-white h-5 w-5" />
                            </div>
                            <Badge className="absolute top-2 left-2 bg-green-600 text-white border-none">After</Badge>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl border-none p-0 overflow-hidden bg-transparent">
                           <img src={getFullImageUrl(task.issue?.afterImages?.[0])} className="w-full h-auto rounded-lg" />
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={task.issue?.category?.name || "General"} />
                          
                        <Badge 
                              className="bg-[#22c55e] hover:bg-[#1da850] text-white font-bold flex items-center gap-1 shadow-sm uppercase border-none px-2.5 py-0.5"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              RESOLVED
                            </Badge>
                          

                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{task.issue?.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />
                        {task.issue?.address}
                      </p>
                      
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <p className="text-sm italic">
                          <span className="font-bold text-green-700 not-italic">Status Note:</span> {task.issue?.timeline?.[0]?.comment || 'Successfully resolved and verified by staff.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}