import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Eye, 
  MapPin, 
  Calendar, 
  User, 
  Info, 
  Image as ImageIcon, 
  CheckCircle2,
  Fingerprint,
  ExternalLink 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';

interface IssueDetailsDialogProps {
  issue: any; 
  trigger?: React.ReactNode;
}

export function IssueDetailsDialog({ issue, trigger }: IssueDetailsDialogProps) {
  const API_URL = "http://localhost:5000"; 

  const categoryName = typeof issue?.category === 'object' 
    ? issue.category.name 
    : (issue?.category || "General");

  if (!issue) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold leading-tight">
              {issue.title || "Untitled Issue"}
            </DialogTitle>
            <DialogDescription className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-1">
              <Fingerprint className="h-3 w-3" /> ID: {issue.id}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> Reported Images ({issue.beforeImages?.length || 0}) 
              </span>
              
              {issue.beforeImages && issue.beforeImages.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {issue.beforeImages.map((img: string, index: number) => (
                    <a 
                      key={index} 
                      href={`${API_URL}${img}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="group relative flex-shrink-0 w-48 overflow-hidden rounded-xl border shadow-sm cursor-zoom-in"
                    >
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <ExternalLink className="text-white h-6 w-6" />
                      </div>
                      <img
                        src={`${API_URL}${img}`}
                        alt={`Reported ${index}`}
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="w-full h-40 bg-muted/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed">
                  No Image Provided
                </div>
              )}
            </div>

            {issue.status === 'RESOLVED' && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Resolution Proof ({issue.afterImages?.length || 0})
                </span>
                {issue.afterImages && issue.afterImages.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {issue.afterImages.map((img: string, index: number) => (
                      <a 
                        key={index} 
                        href={`${API_URL}${img}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="group relative flex-shrink-0 w-48 overflow-hidden rounded-xl border-2 border-emerald-100 shadow-sm cursor-zoom-in"
                      >
                         <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                            <ExternalLink className="text-white h-6 w-6" />
                         </div>
                        <img
                          src={`${API_URL}${img}`}
                          alt={`Resolved ${index}`}
                          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-40 bg-emerald-50/30 rounded-xl flex items-center justify-center text-xs text-emerald-600 border-2 border-dashed border-emerald-100">
                    No proof uploaded
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} />
            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase font-bold">
              {categoryName}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase flex items-center gap-1.5 text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Description
            </h4>
            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg border border-muted/50 text-foreground/90">
              {issue.description || "No detailed description provided."}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-xl border border-muted/30">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Location</span>
                  <span className="text-xs font-medium line-clamp-2">{issue.address || "Captured via GPS"}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Time Reported</span>
                  <span className="text-xs font-medium">
                    {issue.createdAt ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:border-l sm:pl-4 border-muted-foreground/10">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Assigned Staff</span>
                  {/* Updated Logic: If no staff, show "Not Yet Assigned" */}
                  <span className={`text-xs font-bold ${!issue.staff?.user?.fullname ? "text-destructive" : ""}`}>
                    {issue.staff?.user?.fullname || "Not Yet Assigned"}
                  </span>
                </div>
              </div>

              {(issue.citizen?.user?.fullname || issue.citizen?.fullname) && (
                <div className="flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">C</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Reported By</span>
                    <span className="text-xs font-medium">
                      {issue.citizen?.user?.fullname || issue.citizen?.fullname}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}