import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface StatusPieChartProps {
  data: StatusData[];
  title?: string;
  description?: string;
}

const COLORS = [
  'hsl(var(--warning))', 
  'hsl(var(--primary))', 
  'hsl(var(--success))', 
  'hsl(var(--muted))',    
];

export function StatusPieChart({ 
  data, 
  title = 'Resolution Status',
  description = 'Live breakdown of issue lifecycle'
}: StatusPieChartProps) {
  
  const activeData = data.filter(item => item.value > 0);
  const totalIssues = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    // ✅ Backdrop aur border same rakha hai, bas padding dashboard se match ki hai
    <Card className="flex flex-col border-none shadow-md bg-card/50 backdrop-blur-sm border border-primary/5">
      <CardHeader className="pb-0">
        {/* ✅ Bold aur Italic hata kar standard dashboard font kiya */}
        <CardTitle className="text-base font-bold tracking-tight">
          {title}
        </CardTitle>
        {/* ✅ Uppercase hata kar soft muted text kiya */}
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        <div className="h-[300px] w-full">
          {totalIssues > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px', // Standard radius
                    fontSize: '12px',
                  }}
                  // ✅ Tooltip se uppercase hataya
                  itemStyle={{ fontWeight: '500' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    // ✅ Legend font clean kiya
                    <span className="text-xs font-medium text-muted-foreground ml-1">
                      {value}
                    </span>
                  )}
                />
                <Pie
                  data={activeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1200}
                >
                  {activeData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 transition-opacity outline-none cursor-pointer"
                    />
                  ))}
                </Pie>

                {/* ✅ Center Text: Italic aur Black hata kar Dashboard stats jaisa kiya */}
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-bold text-3xl tracking-tight"
                >
                  {totalIssues}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-xs font-medium"
                >
                  Total Tasks
                </text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
              <div className="h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/20 mb-3 animate-pulse" />
              <p className="text-xs font-medium">No Active Records</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}