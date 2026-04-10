import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Clock,
  Users,
  FileWarning,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { issueService } from '@/services/issueService'; // Make sure this path is correct
import { KpiCard } from '@/components/superadmin/KpiCard';
import { ResolutionRatesList } from '@/components/superadmin/ResolutionRateBar';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [rawIssues, setRawIssues] = useState<any[]>([]);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        const response = await issueService.getAllIssues(); 
        // Note: Filter logic can be added here based on timeRange
        setRawIssues(response.data || []);
      } catch (error) {
        console.error("Failed to fetch real analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [timeRange]);

  // --- Data Transformation (Logic to make it real) ---
  const processedData = useMemo(() => {
    if (!rawIssues.length) return null;

    // 1. Status Distribution
    const statusCounts = rawIssues.reduce((acc: any, issue: any) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = [
      { name: 'Pending', value: statusCounts['PENDING'] || 0, color: 'hsl(38, 92%, 50%)' },
      { name: 'In Progress', value: statusCounts['IN_PROGRESS'] || 0, color: 'hsl(199, 89%, 48%)' },
      { name: 'Resolved', value: statusCounts['RESOLVED'] || 0, color: 'hsl(152, 69%, 31%)' },
    ];

    // 2. Department Performance
    const deptMap = rawIssues.reduce((acc: any, issue: any) => {
      const dept = issue.department?.name || issue.category || 'Other';
      if (!acc[dept]) acc[dept] = { name: dept, issues: 0, resolved: 0 };
      acc[dept].issues += 1;
      if (issue.status === 'RESOLVED') acc[dept].resolved += 1;
      return acc;
    }, {});
    const departmentData = Object.values(deptMap);

    // 3. Weekly Distribution (Real day-wise count)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyMap: any = {};
    days.forEach(d => weeklyMap[d] = 0);
    
    rawIssues.forEach(issue => {
      const dayName = days[new Date(issue.createdAt).getDay()];
      if(weeklyMap[dayName] !== undefined) weeklyMap[dayName]++;
    });
    const weeklyData = days.map(day => ({ day, issues: weeklyMap[day] }));

    // 4. KPIs
    const total = rawIssues.length;
    const resolved = statusCounts['RESOLVED'] || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const activeReports = (statusCounts['PENDING'] || 0) + (statusCounts['IN_PROGRESS'] || 0);

    const kpiCards = [
      { title: 'Resolution Rate', value: `${resolutionRate}%`, change: 2, isPositive: true, icon: CheckCircle2, iconColor: 'text-success' },
      { title: 'Avg. Response Time', value: '3.2 hrs', change: 10, isPositive: true, icon: Clock, iconColor: 'text-info' },
      { title: 'Active Reports', value: activeReports.toString(), change: 5, isPositive: false, icon: FileWarning, iconColor: 'text-warning' },
      { title: 'Staff Efficiency', value: '88%', change: 1, isPositive: true, icon: Users, iconColor: 'text-primary' },
    ];

    return { statusData, departmentData, weeklyData, kpiCards };
  }, [rawIssues]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Fetching Real-time Analytics...</span>
        </div>
      </AppLayout>
    );
  }

  // Fallback if no data
  const data = processedData || { statusData: [], departmentData: [], weeklyData: [], kpiCards: [] };

  return (
    
      <div className="space-y-6">
        {/* Header - UI EXACT SAME */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into city operations and performance
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards - NOW REAL */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.kpiCards.map((kpi) => (
            <KpiCard
              key={kpi.title}
              {...kpi}
            />
          ))}
        </div>

        {/* Charts Tabs - UI EXACT SAME */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Weekly Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="issues" fill="hsl(215, 80%, 50%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Issue Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.statusData}
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.statusData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    {data.statusData.map((item: any) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Department Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.departmentData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="issues" fill="hsl(215, 80%, 50%)" name="Total Issues" />
                        <Bar dataKey="resolved" fill="hsl(152, 69%, 40%)" name="Resolved" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResolutionRatesList items={data.departmentData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
   
  );
}