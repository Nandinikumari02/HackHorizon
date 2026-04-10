import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface WeeklyData {
  day: string;
  reported: number;
  resolved: number;
}

interface WeeklyChartProps {
  data: WeeklyData[];
  title?: string;
  description?: string;
}

export function WeeklyChart({ 
  data, 
  title = 'Weekly Performance', 
  description = 'Comparison of intake vs resolution' 
}: WeeklyChartProps) {
  
  const safeData = data.length > 0 ? data : [
    { day: 'Mon', reported: 0, resolved: 0 },
    { day: 'Tue', reported: 0, resolved: 0 },
    { day: 'Wed', reported: 0, resolved: 0 },
    { day: 'Thu', reported: 0, resolved: 0 },
    { day: 'Fri', reported: 0, resolved: 0 },
  ];

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm border border-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {/* ✅ Removed Black/Italic/Uppercase - Synced with Dashboard Header */}
            <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              {title}
            </CardTitle>
            {/* ✅ Switched to standard muted description style */}
            <CardDescription className="text-xs text-muted-foreground">
              {description}
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border/50">
             <TrendingUp className="h-3 w-3 text-emerald-500" />
             <span className="text-[10px] font-semibold text-muted-foreground tracking-tight">Live Intake</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={safeData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.1} 
              />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                // ✅ Standard font weight for axis labels
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}
                // ✅ Cleaned up Tooltip font styles
                itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                labelStyle={{ fontWeight: 600, marginBottom: '4px', color: 'hsl(var(--primary))' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                height={36}
                formatter={(value) => (
                  // ✅ Standard Legend font
                  <span className="text-xs font-medium text-muted-foreground ml-1">
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="reported"
                fill="hsl(var(--primary))"
                name="Reported"
                radius={[4, 4, 0, 0]}
                barSize={18}
                animationBegin={200}
                animationDuration={1000}
              />
              <Bar
                dataKey="resolved"
                fill="hsl(var(--success))"
                name="Resolved"
                radius={[4, 4, 0, 0]}
                barSize={18}
                animationBegin={400}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}