import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, Upload, ShieldCheck } from 'lucide-react';
import { wasteService } from '@/services/wasteService';
import type { NormalizedAnalyzeResult } from '@/lib/analyzeResult';
import { toast } from 'sonner';

interface UploadCardProps {
  onUploadSuccess: (result: NormalizedAnalyzeResult, file: File) => void;
  /** Sent to the ML API as `address` for location-aware analysis */
  locationLabel?: string;
}

export function UploadCard({ onUploadSuccess, locationLabel = '' }: UploadCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setIsLoading(true);
      const addr = locationLabel.trim() || 'Location not specified';
      const result = await wasteService.analyzeWaste(file, addr);
      onUploadSuccess(result, file);
      const label = result.detection?.item?.trim();
      toast.success(label ? `Identified: ${label}` : 'Analysis ready');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string; details?: string } } };
      const d = err.response?.data;
      toast.error(
        d?.error || d?.message || d?.details || 'Analysis failed. Try another image or try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileChange({ target: { files: [file] } } as any);
      } else {
        toast.error("Please drop an image file");
      }
    }
  };

  return (
    <Card className={`border-2 border-dashed transition-all duration-300 bg-white rounded-[2.5rem] overflow-hidden ${
      dragActive ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-green-300'
    }`}>
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
        
        <div 
          className="w-full max-w-sm"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={`h-24 w-24 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all duration-300 ${
            dragActive ? 'bg-green-100 scale-110' : 'bg-green-100'
          }`}>
            {isLoading ? (
              <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            ) : (
              <ImagePlus className={`h-10 w-10 transition-all duration-300 ${
                dragActive ? 'text-green-700 scale-110' : 'text-green-600'
              }`} />
            )}
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-2">
            {isLoading ? "Analyzing..." : "Auto-detect your waste"}
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mb-6 leading-relaxed">
            {isLoading
              ? "Our AI is processing your image..."
              : "Upload a photo and EcoSarthi will automatically identify the material, suggest reuse/recycling, and find nearby centres."
            }
          </p>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left mb-6">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-slate-500 mb-2">
              Auto detect status
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {locationLabel
                ? `Location used: ${locationLabel}`
                : 'Using your current GPS location to find the best match.'}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Supported: JPG, PNG, max 5 MB.
            </p>
          </div>

          <Button
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 gap-2 w-full max-w-xs"
          >
            <Upload className="w-4 h-4" /> {isLoading ? 'Detecting...' : 'Upload & auto detect'}
          </Button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Drop an image file here or click upload to select one.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            <ShieldCheck className="w-3 h-3" /> Secure AI Processing • Eco-Friendly Analysis
          </div>
        </div>
      </CardContent>
    </Card>
  );
}