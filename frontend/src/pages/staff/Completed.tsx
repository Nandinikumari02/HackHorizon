import { useState, useEffect, useCallback } from 'react';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle2, MapPin, Calendar, TrendingUp, Award, Clock, Filter, Loader2, Maximize2 } from 'lucide-react';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { taskService, API_BASE_URL } from '@/services/taskService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function fullImageUrl(path: string | undefined) {
  if (!path) return 'https://placehold.co/400x300?text=No+Photo';
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${clean}`;
}

export default function Completed() {
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompleted = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getCompletedPickups();
      const data = res.data;
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  const filtered = rows.filter((t) => {
    const d = new Date(t.updatedAt);
    const now = new Date();
    if (timeFilter === 'today') return isAfter(d, startOfDay(now));
    if (timeFilter === 'week') return isAfter(d, subDays(now, 7));
    if (timeFilter === 'month') return isAfter(d, subDays(now, 30));
    return true;
  });

  const todayCount = rows.filter(
    (t) => format(new Date(t.updatedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const weekCount = rows.filter((t) => isAfter(new Date(t.updatedAt), subDays(new Date(), 7))).length;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600/50" />
        <p className="text-muted-foreground italic">Loading completed pickups…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            Completed pickups
          </h1>
          <p className="text-muted-foreground mt-1">Proof-submitted work from your account</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Today" value={todayCount} icon={CheckCircle2} variant="success" />
        <StatsCard title="This week" value={weekCount} icon={TrendingUp} variant="primary" />
        <StatsCard title="Total" value={rows.length} icon={Award} />
        <StatsCard title="Status" value="Done" icon={Clock} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">History</h2>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No completed pickups in this range.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((task) => {
              const wl = task.wasteLog;
              const img = fullImageUrl(wl?.imageUrl);
              return (
                <Card key={task.id} className="overflow-hidden border-l-4 border-l-emerald-500">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex md:w-72 flex-shrink-0 bg-muted">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative w-full md:w-72 h-44 cursor-pointer group">
                              <img
                                src={img}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="text-white h-6 w-6" />
                              </div>
                              <Badge className="absolute top-2 left-2 bg-black/60 text-white border-none">
                                Waste photo
                              </Badge>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl border-none p-0 overflow-hidden bg-transparent">
                            <img src={img} className="w-full h-auto rounded-lg" alt="" />
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={wl?.category?.name || 'General'} />
                            <Badge className="bg-emerald-600 text-white border-none uppercase">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              completed
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{wl?.materialName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {wl?.latitude != null && wl?.longitude != null
                            ? `${wl.latitude.toFixed(4)}, ${wl.longitude.toFixed(4)}`
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
