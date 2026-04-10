import { useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ImageIcon, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ResolveDialog } from './ResolveDialog';
import { StaffIssueDetailDialog } from './StaffIssueDetailDialog';

const BACKEND_URL = "http://localhost:5000"; 

interface TaskCardProps {
  task: any; 
  onResolve: () => void;
  variant?: 'default' | 'compact';
  showTimestamp?: boolean;
}

export function TaskCard({ 
  task, 
  onResolve, 
  variant = 'default',
  showTimestamp = true 
}: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const issueData = task.issue || {};
  const images = issueData.beforeImages || [];
  const imageCount = images.length;
  
  const rawImage = images.length > 0 ? images[0] : null;
  const mainImage = rawImage 
    ? (rawImage.startsWith('http') ? rawImage : `${BACKEND_URL}${rawImage}`) 
    : "/placeholder-issue.jpg";

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const lat = issueData.latitude;
    const lng = issueData.longitude;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  const address = issueData.address || 'Location not available';
  const categoryName = issueData.category?.name || "General";
  
  // ✅ Actual Report Date (Jis din citizen ne report kiya)
  const reportDate = task.createdAt; 

  return (
    <>
      <Card 
        className="overflow-hidden card-hover animate-fade-in border-l-4 border-l-primary shadow-sm cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <CardContent className="p-0">
          <div className={`flex ${variant === 'compact' ? 'min-h-[120px]' : 'min-h-[150px]'}`}>
            
            {/* IMAGE SECTION */}
            <div className={`${variant === 'compact' ? 'w-24' : 'w-32 sm:w-40'} relative shrink-0 overflow-hidden bg-muted border-r`}>
              <img
                src={mainImage}
                alt={task.title}
                className="w-full h-full object-cover"
                onError={(e: any) => { e.target.src = "/placeholder-issue.jpg" }}
              />
              
              {imageCount > 1 && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <ImageIcon className="h-4 w-4 mb-1" />
                  <span className="text-[10px] font-bold">+{imageCount - 1} more</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={categoryName} />
                  <StatusBadge status={task.status} />
                </div>
                {showTimestamp && reportDate && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(reportDate), "dd MMM, yyyy")}
                  </span>
                )}
              </div>

              <h3 className="font-bold mb-1 text-sm sm:text-base line-clamp-1">{task.title}</h3>
              
              {/* ✅ Yahan se management wali line hata kar Reported Time ago dal diya hai */}
              <p className="text-[11px] text-primary font-medium mb-2">
                Reported {formatDistanceToNow(new Date(reportDate), { addSuffix: true })}
              </p>

              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-4">
                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                <span className="line-clamp-1">{address}</span>
              </p>

              <div className="flex items-center gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs font-medium"
                  onClick={handleNavigate}
                >
                  <Navigation className="h-3 w-3" />
                  Navigate
                </Button>
                
                <div onClick={(e) => e.stopPropagation()}>
                  <ResolveDialog task={task} onResolve={onResolve} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StaffIssueDetailDialog 
        task={task} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen}
        onRefresh={onResolve} 
      />
    </>
  );
}