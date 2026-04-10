import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Camera, Upload, Loader2, X, MapPin, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/services/taskService';

interface ResolveDialogProps {
  task: any; 
  onResolve: () => void;
  inputId?: string;
}

export function ResolveDialog({ task, onResolve, inputId }: ResolveDialogProps) {
  // ✅ Ab hum multiple files save kar rahe hain
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const uniqueId = inputId || `after-photo-${task.id}`;
  const displayAddress = task?.issue?.address || task?.address || 'Location not available';

  // ✅ Multiple images handle karne ka function
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Purane files mein naye files add kar rahe hain
      setSelectedFiles((prev) => [...prev, ...files]);
      
      // Previews create kar rahe hain
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "Photo Required", 
        description: "Please upload at least one 'After' photo." 
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      
      // ✅ Saari photos ko loop karke 'afterImages' key mein add kar rahe hain
      selectedFiles.forEach((file) => {
        formData.append('afterImages', file); 
      });
      
      formData.append('resolutionNotes', notes);
      formData.append('status', 'COMPLETED');

      // API Call
      await (taskService.completeTask as any)(task.id, formData);

      toast({
        title: "Success",
        description: "Task marked as resolved with multiple proofs.",
      });

      onResolve(); 
      setOpen(false);
      setSelectedFiles([]);
      setPreviews([]);
      setNotes('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.response?.data?.message || "Could not update task status."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold transition-all active:scale-95">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Resolve
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Complete Task
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Location Info */}
          <div className="bg-muted/40 p-4 rounded-xl border border-dashed flex gap-3">
            <MapPin className="h-5 w-5 text-red-500 shrink-0" />
            <div className="space-y-1 text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Location</p>
              <p className="text-sm font-medium leading-snug">{displayAddress}</p>
            </div>
          </div>

          {/* Multiple Image Upload Area */}
          <div className="space-y-3">
            <Label className="text-sm font-bold flex items-center gap-2">
              <Camera className="h-4 w-4" /> Proof of Resolution (Multiple) *
            </Label>

            {/* Preview Grid */}
            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-white group">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-90 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {/* Add More Photo Button */}
              <button
                type="button"
                onClick={() => document.getElementById(uniqueId)?.click()}
                className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/50 transition-colors text-muted-foreground"
              >
                <Plus className="h-6 w-6" />
                <span className="text-[10px] font-bold">Add Photo</span>
              </button>
            </div>

            <input
              id={uniqueId}
              type="file"
              multiple // ✅ Multiple files allowed
              accept="image/*"
              capture="environment" 
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor={`notes-${task.id}`} className="text-sm font-bold">Resolution Details</Label>
            <Input
              id={`notes-${task.id}`}
              placeholder="What was fixed?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-11 focus-visible:ring-green-500 rounded-lg"
            />
          </div>

          {/* Action Button */}
          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700 h-12 text-base font-bold shadow-lg shadow-green-200"
            disabled={selectedFiles.length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {isSubmitting ? "Uploading Proofs..." : "Confirm & Complete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}