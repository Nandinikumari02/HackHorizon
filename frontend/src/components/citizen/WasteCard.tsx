import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { MapPin, Clock, Info, Recycle, Trash2 } from 'lucide-react';

// Assuming you'll rename this dialog as well to handle waste details
import { WasteDetailDialog } from './WasteDetailDialog';

interface WasteCardProps {
  log: any; // This matches your Prisma WasteLog model
}

export function WasteCard({ log }: WasteCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const API_URL = "http://localhost:5000";

  return (
    <>
      <Card 
        className="overflow-hidden border-border/50 hover:shadow-md transition-all duration-300 animate-fade-in cursor-pointer group"
        onClick={() => setIsDetailOpen(true)}
      >
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            
            {/* Image Section - Simplified for single image logic */}
            <div className="sm:w-48 w-full relative overflow-hidden bg-muted flex-shrink-0">
              <div className="aspect-video sm:aspect-square w-full h-full relative">
                <img
                  src={log.imageUrl?.startsWith('http') ? log.imageUrl : `${API_URL}${log.imageUrl}`}
                  alt={log.materialName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Waste+Image"; }}
                />
                <div className="absolute top-2 left-2">
                   <div className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                      {Math.round(log.confidence * 100)}% Match
                   </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex gap-2">
                    <CategoryBadge category={log.category?.name || "General Waste"} />
                    <StatusBadge status={log.status} />
                  </div>
                </div>

                <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {log.materialName}
                </h3>
                
                <div className="flex items-center gap-4 mt-2 mb-4">
                    {log.recycleTip && (
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                            <Recycle className="h-3 w-3" /> Recyclable
                        </div>
                    )}
                    {log.disposeTip && (
                         <div className="flex items-center gap-1 text-[10px] text-orange-600 font-medium">
                            <Trash2 className="h-3 w-3" /> Proper Disposal Needed
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> 
                    {/* Displaying coordinates or address if available */}
                    {log.latitude ? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}` : "Location N/A"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> 
                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-border/40 mt-4">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs gap-2 rounded-full hover:bg-primary hover:text-white transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passing log data to the detail dialog */}
      <WasteDetailDialog 
        log={log} 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
      />
    </>
  );
}