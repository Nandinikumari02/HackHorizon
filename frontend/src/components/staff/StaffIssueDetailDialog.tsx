import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ResolveDialog } from "./ResolveDialog";

const BACKEND_URL = "http://localhost:5000";

interface StaffIssueDetailDialogProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function StaffIssueDetailDialog({ task, open, onOpenChange, onRefresh }: StaffIssueDetailDialogProps) {
  const issue = task.issue || {};
  const images = issue.beforeImages || [];
  const citizen = issue.citizen?.user || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{issue.category?.name || "General"}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">{task.status}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT SIDE: IMAGES GRID */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Evidence Photos ({images.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {images.length > 0 ? (
                  images.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border bg-muted">
                      <img
                        src={`${BACKEND_URL}${img}`}
                        alt="Evidence"
                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-all"
                        onClick={() => window.open(`${BACKEND_URL}${img}`, '_blank')}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 h-32 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                    No images available
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: INFO & DETAILS */}
            <div className="space-y-6">
              {/* Citizen Contact */}
              <div className="p-4 rounded-xl border bg-primary/5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary/70">Reported By</h4>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{citizen.fullname || "Anonymous"}</p>
                   
                  </div>
                </div>
              </div>

              {/* Location & Date */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-red-500" />
                  <span>{issue.address || "No address provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Reported on: {format(new Date(task.createdAt), "PPP")}</span>
                </div>
              </div>

              
            </div>
          </div>
        </ScrollArea>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
           <ResolveDialog task={task} onResolve={() => { onOpenChange(false); onRefresh(); }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Chota sa helper icon for header
function ImageIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  )
}