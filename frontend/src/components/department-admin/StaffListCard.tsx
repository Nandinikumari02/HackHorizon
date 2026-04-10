import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

// REAL DATA INTERFACE
interface StaffMember {
  id: string;
  user: {
    fullname: string;
    email: string;
  };
  _count?: {
    issues: number;
  };
}

interface StaffListCardProps {
  staff: StaffMember[];
  title?: string;
  onAddStaff?: () => void;
}

export function StaffListCard({ staff, title = 'Department Members' }: StaffListCardProps) {
  return (
    <Card className="shadow-md border-none bg-card/60 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-muted/20">
        <CardTitle className="text-lg   flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
       
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-muted/50 max-h-[400px] overflow-y-auto">
          {/* ✅ Map ke andar safety check */}
          {staff && staff.length > 0 ? (
            staff.map((member) => (
              <StaffListItem key={member.id} staff={member} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
               <Users className="h-8 w-8 mb-2 stroke-[1px]" />
               <p className="text-xs font-bold uppercase tracking-tighter">No Member Registered</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StaffListItem({ staff }: { staff: StaffMember }) {
  // Prisma count fallback
  const activeTasks = staff._count?.issues || 0;

  const getStatusConfig = (count: number) => {
    if (count === 0) return { color: 'bg-emerald-500', label: 'Available', badge: 'bg-emerald-50 text-emerald-700' };
    if (count < 3) return { color: 'bg-amber-500', label: 'Busy', badge: 'bg-amber-50 text-amber-700' };
    return { color: 'bg-rose-500', label: 'Overloaded', badge: 'bg-rose-50 text-rose-700' };
  };

  const config = getStatusConfig(activeTasks);

  // ✅ Safe Initials & Data Logic (Ab crash nahi hoga)
  const name = staff.user?.fullname || "Unknown Staff";
  const email = staff.user?.email || "No Email Provided";
  const staffId = staff.id || "0000";

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || '??';

  return (
    <div className="group flex items-center justify-between p-4 hover:bg-primary/[0.02] transition-colors cursor-default">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-xs font-black shadow-inner border border-primary/10">
            {initials}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${config.color} shadow-sm`} />
        </div>
        
        <div className="space-y-0.5">
          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
            {name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
              {email}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter border-none ${config.badge}`}>
          {activeTasks} Active Tasks
        </Badge>
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Agent #{staffId.substring(0,4)}
        </span>
      </div>
    </div>
  );
}