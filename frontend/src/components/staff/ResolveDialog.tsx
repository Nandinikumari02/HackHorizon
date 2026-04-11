import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Camera, Upload, Loader2, X, MapPin, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/services/taskService';
import type { PickupTaskShape } from './PickupTaskCard';

interface ResolveDialogProps {
  task: PickupTaskShape;
  onResolve: () => void;
  inputId?: string;
}

export function ResolveDialog({ task, onResolve, inputId }: ResolveDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const uniqueId = inputId || `pickup-proof-${task.id}`;
  const wl = task.wasteLog;
  const lat = wl?.latitude;
  const lng = wl?.longitude;
  const displayLocation =
    lat != null && lng != null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Location from citizen scan';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Photo required',
        description: 'Upload at least one proof-of-pickup image.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await taskService.completePickupWithProof(task.id, selectedFiles);
      toast({
        title: 'Pickup completed',
        description: 'Proof uploaded. Citizen was awarded points.',
      });
      onResolve();
      setOpen(false);
      setSelectedFiles([]);
      setPreviews([]);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: err.response?.data?.message || 'Could not complete pickup.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Complete pickup
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Proof of pickup
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="bg-muted/40 p-4 rounded-xl border border-dashed flex gap-3">
            <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="space-y-1 text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Drop-off location
              </p>
              <p className="text-sm font-medium leading-snug">{displayLocation}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Camera className="h-4 w-4" /> Photos (required)
            </Label>

            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-lg overflow-hidden border bg-white group"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-90 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => document.getElementById(uniqueId)?.click()}
                className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/50 transition-colors text-muted-foreground"
              >
                <Plus className="h-6 w-6" />
                <span className="text-[10px] font-bold">Add</span>
              </button>
            </div>

            <input
              id={uniqueId}
              type="file"
              multiple
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <Button
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold"
            disabled={selectedFiles.length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {isSubmitting ? 'Uploading…' : 'Submit & complete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
