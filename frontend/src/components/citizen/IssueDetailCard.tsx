import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, User, Building2, MessageSquare, Send, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { issueService } from "@/services/issueService";

export function IssueDetailCard({ issue, onRefresh }: { issue: any, onRefresh?: () => void }) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(issue.comments || []);

  useEffect(() => {
    setLocalComments(issue.comments || []);
  }, [issue.comments]);

  const API_URL = "http://localhost:5000";

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await issueService.addComment(issue.id, newComment);
      setLocalComments([response.data, ...localComments]);
      setNewComment(""); 
      onRefresh?.(); 
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={issue.status} />
          <CategoryBadge category={issue.category?.name || "General"} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          {issue.title}
        </h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {issue.address}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> {new Date(issue.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      {/* 2. Professional Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main Image (Big) */}
        <div className="md:col-span-8 rounded-2xl overflow-hidden border bg-muted aspect-video shadow-sm">
          <img 
            src={`${API_URL}${issue.beforeImages?.[0]}`} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]" 
            alt="Primary Evidence"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x450?text=No+Image+Found"; }}
          />
        </div>
        
        {/* Thumbnails (Small Grid) */}
        <div className="md:col-span-4 grid grid-cols-2 gap-3">
          {issue.beforeImages?.slice(1, 5).map((img: string, i: number) => (
            <div key={i} className="rounded-xl overflow-hidden border bg-muted aspect-square group relative shadow-sm">
              <img 
                src={`${API_URL}${img}`} 
                className="w-full h-full object-cover transition-opacity group-hover:opacity-80" 
                alt={`Evidence ${i+2}`} 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Image"; }}
              />
              {i === 3 && issue.beforeImages.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm backdrop-blur-[2px]">
                  +{issue.beforeImages.length - 5}
                </div>
              )}
            </div>
          ))}
          {(!issue.beforeImages || issue.beforeImages.length < 2) && (
             <div className="col-span-2 flex items-center justify-center bg-muted/20 rounded-xl border border-dashed text-muted-foreground text-xs p-4 text-center h-full">
               No additional photos
             </div>
          )}
        </div>
      </div>

      {/* 3. Details & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Case Description</h4>
            <div className="text-base text-foreground/90 leading-relaxed bg-muted/20 p-6 rounded-2xl border border-border/40 shadow-inner">
              {issue.description}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-none border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6 space-y-5">
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm text-primary"><Clock className="h-5 w-5" /></div>
                 <div className="text-sm">
                    <p className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider">Reported On</p>
                    <p className="font-semibold">{new Date(issue.createdAt).toLocaleDateString()}</p>
                 </div>
               </div>
               <Separator className="bg-border/40" />
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm text-primary"><Building2 className="h-5 w-5" /></div>
                 <div className="text-sm">
                    <p className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider">Department</p>
                    <p className="font-semibold">{issue.department?.name || "Pending Review"}</p>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm text-primary"><User className="h-5 w-5" /></div>
                 <div className="text-sm">
                    <p className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider">Reported By</p>
                    {/* Fixed nested user path */}
                    <p className="font-semibold text-foreground">{issue.citizen?.user?.fullname || "Anonymous Citizen"}</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Professional Discussion Section */}
      <div className="pt-10 border-t space-y-8">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" /> 
          Discussion <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{localComments.length}</span>
        </h3>

        <div className="relative group">
          <Input 
            placeholder="Add your update or question..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
            className="h-14 pl-5 pr-14 rounded-2xl bg-muted/30 border-border/60 focus-visible:ring-primary focus-visible:bg-background transition-all shadow-sm"
          />
          <Button 
            size="icon"
            onClick={handleCommentSubmit} 
            disabled={isSubmitting || !newComment.trim()}
            className="absolute right-2 top-2 h-10 w-10 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {localComments.map((c: any) => (
            <div key={c.id} className="group flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm shadow-sm uppercase">
                {c.user?.fullname?.charAt(0) || "C"}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-bold text-foreground tracking-tight">{c.user?.fullname || "Citizen"}</p>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-card border border-border/50 p-4 rounded-2xl rounded-tl-none shadow-sm transition-colors group-hover:border-primary/20">
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    {c.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {localComments.length === 0 && (
            <div className="text-center py-14 rounded-3xl border-2 border-dashed border-border/30 bg-muted/5">
              <p className="text-muted-foreground text-sm font-medium italic opacity-60">No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}