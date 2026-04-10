import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { issueService } from '@/services/issueService'; 
import { IssueCard } from '@/components/citizen/IssueCard';
import { ReportIssueDialog } from '@/components/citizen/ReportIssueDialog';
import { StatsCard } from '@/components/shared/StatsCard';
import { FileWarning, CheckCircle2, Clock, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SecurityBot } from '@/components/citizen/SecurityBot'; 

export function CitizenDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch function using IssueService
  const fetchIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await issueService.getMyIssues();
      // Backend agar object bhej raha hai jisme issues key hai toh response.data.issues use karein
      const data = Array.isArray(response.data) ? response.data : response.data?.issues || [];
      setIssues(data);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // 2. Stats Calculation
  const totalReports = issues.length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;
  const pendingCount = issues.filter((i) => ['OPEN', 'IN_PROGRESS', 'PENDING'].includes(i.status)).length;
  
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // 3. Rewards Calculation
  const userPoints = user?.points || 0;
  // Next badge logic: Har 100 points par naya badge
  const nextBadgePoints = Math.max(100, Math.ceil((userPoints + 1) / 100) * 100);
  const progressPercent = Math.min(100, Math.round((userPoints / nextBadgePoints) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.fullname?.split(' ')[0] || 'Citizen'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Your city is currently tracking <span className="text-primary font-semibold">{totalReports}</span> of your reports.
          </p>
        </div>
        <ReportIssueDialog onRefresh={fetchIssues} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Your Reports" value={totalReports} icon={FileWarning} variant="primary" />
        <StatsCard title="Resolved" value={resolvedCount} icon={CheckCircle2} variant="success" />
        <StatsCard title="Pending" value={pendingCount} icon={Clock} variant="warning" />
        <StatsCard title="Civic Points" value={userPoints} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Issues Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Recent Activity
            </h2>
            {totalReports > 0 && (
              <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10">
                <Link to="/citizen/issues" className="flex items-center gap-1">
                  View All History <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium">Loading your reports...</p>
            </div>
          ) : issues.length > 0 ? (
            <div className="grid gap-4">
              {recentIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} onRefresh={fetchIssues} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <FileWarning className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">No issues reported</h3>
                <p className="text-muted-foreground max-w-[250px] mx-auto mt-2 mb-6">
                  Ready to make a difference? Report your first civic issue today.
                </p>
                <ReportIssueDialog onRefresh={fetchIssues} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Level & Rewards Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Rank & Progress</h2>
          <Card className="relative overflow-hidden border-primary/20 shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
            
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Citizen Impact Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-primary tracking-tighter">{userPoints}</span>
                <span className="text-sm font-bold text-muted-foreground uppercase">PTS</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">Next Badge</span>
                  <span className="text-primary">{userPoints} / {nextBadgePoints}</span>
                </div>
                <Progress value={progressPercent} className="h-3 shadow-inner" />
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <p className="text-xs leading-relaxed text-muted-foreground italic text-center">
                    "You're just <span className="font-bold text-foreground">{nextBadgePoints - userPoints} points</span> away from becoming a 
                    <span className="text-primary font-bold"> Community Hero</span>!"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> 
      </div>

      {/* ✅ Security Bot Component - Floating at bottom-right */}
      <SecurityBot />
    </div>
  );
}