import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, User, Recycle, Trash2, Lightbulb, Truck, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Separator } from '@/components/ui/separator';

export function WasteAnalysisCard({ log }: { log: any }) {
  const API_URL = "http://localhost:5000";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={log.status} />
          <CategoryBadge category={log.category?.name || "General Waste"} />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" /> AI Verified: {Math.round(log.confidence * 100)}%
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          {log.materialName}
        </h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {log.address || "Location Recorded"}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {new Date(log.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      {/* 2. Visual Evidence */}
      <div className="rounded-2xl overflow-hidden border bg-muted aspect-video shadow-sm relative group">
        <img 
          src={log.imageUrl?.startsWith('http') ? log.imageUrl : `${API_URL}${log.imageUrl}`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt="AI Scanned Waste"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x450?text=Waste+Image+Not+Found"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <p className="text-white text-sm font-medium">Original image captured during AI Scan</p>
        </div>
      </div>

      {/* 3. AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Detailed Tips (The "Brain" of the project) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Recycle Tip */}
            <div className="p-5 rounded-2xl border border-green-100 bg-green-50/30 space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <Recycle className="h-5 w-5" />
                <h4 className="font-bold text-sm uppercase tracking-tight">Recycle Guide</h4>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {log.recycleTip || "No specific recycling instructions available for this material."}
              </p>
            </div>

            {/* Reuse Tip */}
            <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Lightbulb className="h-5 w-5" />
                <h4 className="font-bold text-sm uppercase tracking-tight">Upcycling Idea</h4>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {log.reuseTip || "Consider donating or finding local creative reuse centers."}
              </p>
            </div>

            {/* Dispose Tip */}
            <div className="p-5 rounded-2xl border border-orange-100 bg-orange-50/30 space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-orange-700">
                <Trash2 className="h-5 w-5" />
                <h4 className="font-bold text-sm uppercase tracking-tight">Proper Disposal</h4>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {log.disposeTip || "Dispose according to your local municipal hazardous waste guidelines."}
              </p>
            </div>

          </div>
        </div>

        {/* Right: Operational Details */}
        <div className="space-y-6">
          <Card className="shadow-none border-border/60 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-5">
              
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Truck className="h-5 w-5" /></div>
                <div className="text-sm">
                  <p className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider">Pickup Status</p>
                  <p className="font-semibold">{log.pickupRequested ? "Requested" : "Self-Disposal"}</p>
                </div>
              </div>

              <Separator className="bg-border/40" />

              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><User className="h-5 w-5" /></div>
                <div className="text-sm">
                  <p className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider">Assigned Staff</p>
                  <p className="font-semibold">{log.pickupStaff?.user?.fullname || "Unassigned"}</p>
                </div>
              </div>

              <Separator className="bg-border/40" />

              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-600"><ShieldCheck className="h-5 w-5" /></div>
                <div className="text-sm">
                  <p className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider">Reward Points</p>
                  <p className="font-bold text-green-600">+{log.rewardPoints || 0} pts</p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}