import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { wasteService } from '@/services/wasteService'; 
import { WasteCard } from '@/components/citizen/WasteCard'; // Renamed from IssueCard
import { ScanWasteDialog } from '@/components/citizen/ReportIssueDialog'; // Waste dialog component
import { StatsCard } from '@/components/shared/StatsCard';
import { 
  Recycle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  Loader2, 
  Leaf,
  ScanQrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function CitizenDashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch function updated for Waste Logs
  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await wasteService.getMyHistory();
      setLogs(Array.isArray(data) ? data : data?.logs || []);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 2. Environmental Stats
  const totalScans = logs.length;
  const recycledCount = logs.filter((l) => l.status === 'RECYCLED' || l.status === 'RESOLVED').length;
  const pendingPickup = logs.filter((l) => l.status === 'PENDING_PICKUP').length;
  
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // 3. Reward & Level Logic
  const userPoints = user?.points || 0;
  const nextBadgePoints = Math.max(100, Math.ceil((userPoints + 1) / 100) * 100);
  const progressPercent = Math.min(100, Math.round((userPoints / nextBadgePoints) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            EcoSarthi Dashboard <Leaf className="h-5 w-5 text-green-500" />
          </h1>
          <p className="text-muted-foreground">
            Great job, {user?.fullname?.split(' ')[0]}! You've successfully processed <span className="text-green-600 font-semibold">{totalScans}</span> waste items.
          </p>
        </div>
        {/* The New "Scan" Dialog we built */}
        <ScanWasteDialog onRefresh={fetchLogs} />
      </div>

      {/* Stats Grid - Focused on Environmental Impact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Scans" value={totalScans} icon={ScanQrCode} variant="primary" />
        <StatsCard title="Recycled" value={recycledCount} icon={CheckCircle2} variant="success" />
        <StatsCard title="Pending Pickup" value={pendingPickup} icon={Clock} variant="warning" />
        <StatsCard title="Eco Points" value={userPoints} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Scans Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Recent Activity
            </h2>
            {totalScans > 0 && (
              <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/5">
                <Link to="/citizen/history" className="flex items-center gap-1">
                  View Full History <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-green-50/20 rounded-2xl border-2 border-dashed border-green-100">
              <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
              <p className="text-muted-foreground font-medium">Syncing with EcoSarthi Cloud...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="grid gap-4">
              {recentLogs.map((log) => (
                <WasteCard key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/10 border-2 rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Recycle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Start your Eco-Journey</h3>
                <p className="text-muted-foreground max-w-[280px] mx-auto mt-2 mb-6">
                  You haven't scanned any waste yet. Use the AI scanner to identify materials and earn points.
                </p>
                <ScanWasteDialog onRefresh={fetchLogs} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Level & Rewards Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Green Rank</h2>
          <Card className="relative overflow-hidden border-green-200 shadow-md bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-green-700 uppercase tracking-widest">Impact Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-green-600 tracking-tighter">{userPoints}</span>
                <span className="text-xs font-bold text-muted-foreground">PTS</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-muted-foreground">Level Progress</span>
                  <span className="text-green-700">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5 bg-green-100" />
                
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-100 shadow-sm">
                  <p className="text-xs leading-relaxed text-muted-foreground text-center">
                    You're <span className="font-bold text-green-700">{nextBadgePoints - userPoints} points</span> away from the 
                    <span className="text-green-700 font-bold italic"> "Eco-Warrior"</span> badge! 🌿
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Tip Card */}
          <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardContent className="p-5 flex gap-4 items-center">
              <div className="h-10 w-10 shrink-0 bg-white/20 rounded-lg flex items-center justify-center">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80">Did you know?</p>
                <p className="text-xs font-medium leading-snug">Recycling one aluminum can saves enough energy to run a TV for 3 hours.</p>
              </div>
            </CardContent>
          </Card>
        </div> 
      </div>
    </div>
  );
}