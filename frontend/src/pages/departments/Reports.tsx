import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileWarning,
  Calendar,
  Loader2,
  PieChart as PieChartIcon,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Charts Components
import { WeeklyChart } from '@/components/department-admin/WeeklyChart';
import { StatusPieChart } from '@/components/department-admin/StatusPieChart';
import { MonthlyTrendChart } from '@/components/department-admin/MonthlyTrendChart';

// API Service
import { issueService } from '@/services/issueService';

export default function Reports() {
  const { user } = useAuth();
  const departmentName = user?.departmentAdmin?.department?.name || user?.department?.name || 'Department';

  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const response = await issueService.getDeptIssues();
      setIssues(response.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const analytics = useMemo(() => {
    const pending = issues.filter((i) => ['OPEN', 'SUBMITTED'].includes(i.status)).length;
    const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS').length;
    const resolved = issues.filter((i) => i.status === 'RESOLVED').length;

    const categoryMap = issues.reduce<Record<string, number>>((acc, issue: any) => {
      const catName = typeof issue.category === 'object' ? issue.category.name : (issue.category || 'General');
      acc[catName] = (acc[catName] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    const resolutionRate = issues.length > 0 ? Math.round((resolved / issues.length) * 100) : 0;

    return {
      statusData: [
        { name: 'Pending', value: pending },
        { name: 'In Progress', value: inProgress },
        { name: 'Resolved', value: resolved },
      ],
      categoryData,
      resolutionRate,
      totalResolved: resolved
    };
  }, [issues]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <div className="text-center">
          <p className="font-semibold text-foreground">Generating Sector Reports</p>
          <p className="text-sm text-muted-foreground animate-pulse">Processing real-time issue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Performance reports
            </h1>
            <p className="text-muted-foreground">
              Performance metrics for <span className="font-semibold">{departmentName}</span> sector.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-muted/50 px-3 py-1.5 rounded-md border text-[11px] font-medium text-muted-foreground items-center gap-2">
            <Calendar className="h-3.5 w-3.5" /> Updated: {new Date().toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={fetchReportsData} className="h-9 gap-2 shadow-sm">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* KEY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Workload" value={issues.length} icon={FileWarning} variant="primary" />
        <StatsCard title="Resolution Efficiency" value={`${analytics.resolutionRate}%`} icon={TrendingUp} variant="success" trend={{ value: 8.2, isPositive: true }} />
        <StatsCard title="Avg. Response" value="1.8 Days" icon={Clock} trend={{ value: 0.3, isPositive: true }} />
        <StatsCard title="Issues Closed" value={analytics.totalResolved} icon={CheckCircle2} variant="warning" />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-muted/60">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
            <PieChartIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold">Status distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={analytics.statusData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted/60">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold">Category breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={analytics.categoryData} />
          </CardContent>
        </Card>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-muted/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Weekly activity (reported vs resolved)</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={MOCK_WEEKLY_FLOW} />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-muted/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Annual trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart
              data={[
                { month: 'Jan', count: Math.floor(issues.length * 0.8) },
                { month: 'Feb', count: issues.length },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const MOCK_WEEKLY_FLOW = [
  { day: 'Mon', reported: 4, resolved: 3 },
  { day: 'Tue', reported: 8, resolved: 5 },
  { day: 'Wed', reported: 6, resolved: 7 },
  { day: 'Thu', reported: 10, resolved: 6 },
  { day: 'Fri', reported: 14, resolved: 9 },
  { day: 'Sat', reported: 3, resolved: 4 },
  { day: 'Sun', reported: 2, resolved: 2 },
];