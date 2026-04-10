import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IssueDetailCard } from "./IssueDetailCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IssueDetailDialogProps {
  issue: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // FIXED: onRefresh ko interface mein add kiya
  onRefresh?: () => void; 
}

export function IssueDetailDialog({ issue, open, onOpenChange, onRefresh }: IssueDetailDialogProps) {
  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Issue Details</DialogTitle>
        </DialogHeader>
        
        {/* ScrollArea taaki mobile par content cut-out na ho */}
        <ScrollArea className="h-full max-h-[calc(90vh-80px)] p-6">
          {/* FIXED: IssueDetailCard ko bhi onRefresh pass kiya */}
          <IssueDetailCard issue={issue} onRefresh={onRefresh} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}