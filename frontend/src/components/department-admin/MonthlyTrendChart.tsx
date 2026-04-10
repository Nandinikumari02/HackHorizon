import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  month: string;
  count: number; // 'issues' ki jagah 'count' zyada generic aur clean hai
}

interface MonthlyTrendChartProps {
  data: TrendData[];
  title?: string;
  description?: string;
}

export function MonthlyTrendChart({ 
  data, 
  title = 'Incident Analysis', 
  description = 'Yearly trend of reported issues' 
}: MonthlyTrendChartProps) {
  return (
    <Card className="shadow-md border-none bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
            <TrendingUp className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* AreaChart looks more professional than LineChart for trends */}
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.1} 
              />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}