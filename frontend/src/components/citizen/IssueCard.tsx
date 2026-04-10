import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { ThumbsUp, MapPin, Clock, MessageSquare, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IssueDetailDialog } from './IssueDetailDialog'; 
import { issueService } from "@/services/issueService"; 

interface IssueCardProps {
  issue: any; 
  onUpvote?: () => void;
}

export function IssueCard({ issue, onUpvote }: IssueCardProps) {
  const [isUpvoted, setIsUpvoted] = useState(issue.isUpvoted || false);
  const [upvoteCount, setUpvoteCount] = useState(issue._count?.upvotes || 0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const API_URL = "http://localhost:5000";

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await issueService.toggleUpvote(issue.id);
      if (res.data.upvoted) {
        setUpvoteCount((prev: number) => prev + 1);
        setIsUpvoted(true);
      } else {
        setUpvoteCount((prev: number) => prev - 1);
        setIsUpvoted(false);
      }
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/issues/${issue.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: issue.title, url: shareUrl });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden border-border/50 hover:shadow-md transition-all duration-300 animate-fade-in cursor-pointer group"
        onClick={() => setIsDetailOpen(true)}
      >
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image Section */}
            {issue.beforeImages && issue.beforeImages.length > 0 && (
              <div className="sm:w-56 w-full relative overflow-hidden bg-muted flex-shrink-0">
                <div className="aspect-video sm:aspect-square w-full h-full relative">
                  <img
                    src={`${API_URL}${issue.beforeImages[0]}`}
                    alt={issue.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=No+Image"; }}
                  />
                  {issue.beforeImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/20 shadow-lg">
                      +{issue.beforeImages.length - 1} MORE
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <CategoryBadge category={issue.category?.name || "General"} />
                  <StatusBadge status={issue.status} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {issue.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> {issue.address || "Location N/A"}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {new Date(issue.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="sm" onClick={handleUpvote}
                    className={cn('h-8 rounded-full px-3 gap-2', isUpvoted ? 'text-primary bg-primary/10' : 'hover:bg-muted')}
                  >
                    <ThumbsUp className={cn('h-3.5 w-3.5', isUpvoted && 'fill-current')} />
                    <span className="font-bold text-xs">{upvoteCount}</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 gap-2 hover:bg-muted">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="font-bold text-xs">{issue._count?.comments || 0}</span>
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleShare}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <IssueDetailDialog issue={issue} open={isDetailOpen} onOpenChange={setIsDetailOpen} onRefresh={onUpvote} />
    </>
  );
}