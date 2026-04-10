import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { 
  Camera, Upload, Sparkles, Loader2, X, Recycle, Trash2,  
} from 'lucide-react';

import { wasteService } from '@/services/wasteService';

export function ScanWasteDialog({ onRefresh }: { onRefresh?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // SCAN DATA
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 1. Photo Handling & Auto-Analysis
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      
      // Trigger AI Analysis immediately
      setIsAnalyzing(true);
      try {
        // Using your new wasteService.analyzeWaste call
        const res = await wasteService.analyzeWaste(file, "Detecting Location...");
        setAnalysisResult(res);
        toast.success("Analysis Complete!", { icon: <Sparkles className="h-4 w-4 text-yellow-500" /> });
      } catch (error) {
        toast.error("AI Analysis failed. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // 2. Final Submit (Logging to DB)
  const handleLogWaste = async () => {
    if (!selectedFile || !analysisResult) return;

    setIsLoading(true);
    try {
      const payload = {
        materialName: analysisResult.materialName,
        categoryId: analysisResult.categoryId,
        latitude: 0, // Should be fetched via navigator.geolocation for accuracy
        longitude: 0,
        requestPickup: false, // Optional toggle
        recycleTip: analysisResult.recycleTip,
        disposeTip: analysisResult.disposeTip
      };

      await wasteService.logWaste(payload, selectedFile);
      toast.success("Waste Logged Successfully!");
      setOpen(false);
      resetForm();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to save log");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysisResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg bg-green-600 hover:bg-green-700">
          <Camera className="h-4 w-4" /> Scan Waste
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Waste Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* UPLOAD SECTION */}
          {!preview ? (
            <div 
              className="border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer hover:bg-muted/50 transition-all border-primary/30"
              onClick={() => document.getElementById('waste-upload')?.click()}
            >
              <Camera className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
              <p className="font-bold text-lg">Click to Scan</p>
              <p className="text-sm text-muted-foreground mt-1">AI will identify the material & disposal method</p>
              <input id="waste-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border aspect-square bg-muted">
              <img src={preview} alt="Waste" className="h-full w-full object-cover" />
              <Button 
                size="icon" variant="destructive" 
                className="absolute top-2 right-2 rounded-full h-8 w-8"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm font-medium animate-pulse">Analyzing Material...</p>
                </div>
              )}
            </div>
          )}

          {/* ANALYSIS RESULTS */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-primary">{analysisResult.materialName}</h3>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {Math.round(analysisResult.confidence * 100)}% CONFIDENCE
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <Recycle className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-green-800">Recycling Tip</p>
                      <p className="text-[11px] text-muted-foreground">{analysisResult.recycleTip || "Standard recycling"}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Trash2 className="h-4 w-4 text-orange-600 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-orange-800">Disposal Advice</p>
                      <p className="text-[11px] text-muted-foreground">{analysisResult.disposeTip || "Check local bins"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700" 
            disabled={!analysisResult || isLoading}
            onClick={handleLogWaste}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Save to Log
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}