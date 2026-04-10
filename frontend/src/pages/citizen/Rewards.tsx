import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { rewardService } from '@/services/rewardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Target, TrendingUp, CheckCircle2, ThumbsUp, FileWarning, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Badges definition - Ab earned status dynamic hoga
const badgeThresholds = [
  { name: 'First Report', points: 50, icon: Star },
  { name: 'Active Citizen', points: 200, icon: Award },
  { name: 'Community Hero', points: 500, icon: Trophy },
  { name: 'City Champion', points: 1000, icon: Target },
];

export default function Rewards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pointsData, setPointsData] = useState({ totalPoints: 0, history: [] });

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await rewardService.getMyRewards();
      setPointsData(res.data);
    } catch (error) {
      toast.error("Failed to load rewards data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  // AuthContext se ya API se, points select karein
  const userPoints = pointsData.totalPoints || user?.points || 0;

  // Dynamic Badge Logic
  const nextBadge = badgeThresholds.find((r) => userPoints < r.points);
  const currentBadge = [...badgeThresholds].reverse().find(r => userPoints >= r.points);
  
  const progress = nextBadge 
    ? (userPoints / nextBadge.points) * 100 
    : 100;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Trophy className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Rewards & Achievements</h1>
          <p className="text-muted-foreground text-sm">
            You are currently a <span className="text-primary font-bold">{currentBadge?.name || 'Newcomer'}</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Points Overview */}
        <Card className="lg:col-span-2 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Points Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center py-8 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl border border-primary/5">
              <p className="text-6xl font-black text-primary tracking-tighter">{userPoints}</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-2">Total Civic Points</p>
            </div>

            {nextBadge && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Next Milestone</p>
                    <p className="font-bold text-base">{nextBadge.name}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{userPoints} / {nextBadge.points}</p>
                </div>
                <Progress value={progress} className="h-3 shadow-inner" />
                <p className="text-xs text-muted-foreground text-center italic">
                  Just <span className="text-foreground font-bold">{nextBadge.points - userPoints}</span> more points to reach the next level!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Impact Stats - (Ye data hum Dashboard se bhi fetch kar sakte hain) */}
        <Card className="bg-muted/30 border-none">
          <CardHeader>
            <CardTitle className="text-base">Impact Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImpactItem icon={FileWarning} label="Issues Reported" value="--" color="text-blue-500" bg="bg-blue-500/10" />
            <ImpactItem icon={CheckCircle2} label="Issues Resolved" value="--" color="text-green-500" bg="bg-green-500/10" />
            <ImpactItem icon={ThumbsUp} label="Upvotes Received" value="--" color="text-amber-500" bg="bg-amber-500/10" />
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Earned Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {badgeThresholds.map((badge) => {
              const isEarned = userPoints >= badge.points;
              return (
                <div
                  key={badge.name}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isEarned 
                      ? 'border-amber-500/50 bg-amber-500/5 shadow-md' 
                      : 'border-dashed border-muted opacity-40'
                  }`}
                >
                  <div className={`h-14 w-14 rounded-full mx-auto flex items-center justify-center mb-3 ${
                    isEarned ? 'bg-amber-500/20 text-amber-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    <badge.icon className="h-7 w-7" />
                  </div>
                  <p className="font-bold text-sm text-center">{badge.name}</p>
                  <p className="text-[10px] text-center uppercase tracking-tighter text-muted-foreground">{badge.points} Points</p>
                  {isEarned && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable Stat Item
function ImpactItem({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className={`flex items-center gap-4 p-4 ${bg} rounded-xl border border-white/10`}>
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color} bg-white/50`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground leading-none mb-1">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}