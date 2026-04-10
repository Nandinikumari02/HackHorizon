import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WasteAnalysisCard } from "./WasteDetailCard"; // Analysis card component
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, ShieldCheck } from "lucide-react";

interface WasteDetailDialogProps {
  log: any; // The WasteLog object from your Prisma backend
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WasteDetailDialog({ log, open, onOpenChange }: WasteDetailDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl">
        
        {/* Header with AI Analysis Branding */}
        <DialogHeader className="p-6 pb-2 bg-primary/5">
          <div className="flex items-center gap-2 mb-1">
             <ShieldCheck className="h-5 w-5 text-primary" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                EcoSarthi AI Analysis
             </span>
          </div>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            {log.materialName}
            <div className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-md border border-green-200">
               {Math.round(log.confidence * 100)}% Confidence
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6">
            {/* We pass the log data to the Analysis Card. 
               This card will display the Image, Tips, and Category breakdown.
            */}
            <WasteAnalysisCard log={log} />
            
            {/* Footnote for AI Transparency */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50 flex gap-3 items-start">
               <BarChart3 className="h-5 w-5 text-muted-foreground mt-0.5" />
               <p className="text-xs text-muted-foreground leading-relaxed">
                 This report was generated using multimodal AI analysis. While highly accurate, 
                 please verify disposal methods with local Jharkhand municipal guidelines if 
                 handling hazardous materials.
               </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}