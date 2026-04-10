import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Camera, MapPin, Upload, CheckCircle, 
  ChevronRight, ChevronLeft, Plus, Loader2, X, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { issueService } from '@/services/issueService';
import { departmentService } from '@/services/departmentService';

const steps = ['Photo', 'Details', 'Location', 'Review'];

export function ReportIssueDialog({ onRefresh }: { onRefresh?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // DATA STATES
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  
  // Multiple Images States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    address: '',
    lat: 0,
    lng: 0,
    aiReport: '', // New field for ML Report
    confidence: 0  //  New field for Confidence score
  });

  // 1. Fetch Departments
  useEffect(() => {
    if (open) {
      const fetchDepts = async () => {
        try {
          const res = await departmentService.getAllDepartments(); 
          setDepartments(res.data);
        } catch (error: any) {
          toast.error("Could not load departments");
        }
      };
      fetchDepts();
    }
  }, [open]);

  // ✅ AI AUTOFILL LOGIC (Updated for ML Report)
  const runAIAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const res = await issueService.analyzeImage(file);
      const { title, description, categoryId, departmentId, aiReport, confidence } = res.data;

      // Autofill fields with ML Data
      setFormData(prev => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
        categoryId: categoryId || prev.categoryId,
        aiReport: aiReport || "", // ✅ Extra ML detail
        confidence: confidence || 0
      }));
      
      if (departmentId) {
        setSelectedDeptId(departmentId);
      }

      toast.success("AI suggested details filled!", {
        icon: <Sparkles className="h-4 w-4 text-yellow-500" />
      });
    } catch (error) {
      console.error("AI analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Photo Handling (Multiple)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      
      if (selectedFiles.length + filesArray.length > 5) {
        toast.error("Limit: Maximum 5 photos allowed");
        return;
      }

      if (selectedFiles.length === 0) {
        runAIAnalysis(filesArray[0]);
      }

      setSelectedFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setFormData(prev => ({ ...prev, aiReport: '', confidence: 0 }));
    }
  };

  // 3. Location Detection
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            address: data.display_name || `${latitude}, ${longitude}`
          }));
          toast.success("Location detected!");
        } catch (error) {
          setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
          toast.error("Manual address entry required");
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
        toast.error("Location access denied");
      }
    );
  };

  const handleSubmit = async () => {
    if (!selectedDeptId || !formData.categoryId || !formData.address) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one photo");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        latitude: formData.lat,
        longitude: formData.lng,
        departmentId: selectedDeptId,
        categoryId: formData.categoryId,
        address: formData.address
      };

      await issueService.createIssue(payload, selectedFiles);
      
      toast.success("Issue Reported Successfully!");
      setOpen(false);
      resetForm();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit report");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setSelectedDeptId("");
    setSelectedFiles([]);
    setPreviews([]);
    setIsAnalyzing(false);
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      address: '',
      lat: 0,
      lng: 0,
      aiReport: '',
      confidence: 0
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedFiles.length > 0;
      case 1: return formData.title && selectedDeptId && formData.categoryId;
      case 2: return formData.address.length > 5;
      default: return true;
    }
  };

  const availableCategories = departments.find(d => d.id === selectedDeptId)?.categories || [];

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-md">
          <Plus className="h-4 w-4" /> Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Report a Civic Issue</DialogTitle>
        </DialogHeader>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-8 mt-2 px-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                  index < currentStep ? 'bg-green-500 border-green-500 text-white' : 
                  index === currentStep ? 'bg-primary border-primary text-white' : 
                  'bg-background border-muted text-muted-foreground'
                )}>
                {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={cn('w-12 sm:w-20 h-0.5 mx-1', index < currentStep ? 'bg-green-500' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[320px]">
          {/* PHOTO */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Step 1: Photo Evidence (Up to 5)</Label>
                {isAnalyzing && (
                  <div className="flex items-center gap-1.5 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full animate-pulse">
                    <Sparkles className="h-3 w-3" /> AI Analyzing...
                  </div>
                )}
              </div>
              
              <div
                className={cn(
                  'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-all',
                  previews.length > 0 ? 'border-green-500/50 bg-green-50/5' : 'border-muted'
                )}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <div className="space-y-2 text-muted-foreground">
                  <Camera className="h-10 w-10 mx-auto opacity-50" />
                  <p className="text-sm font-medium">Click to add photos</p>
                  <p className="text-xs opacity-70">AI will automatically suggest details from your photo</p>
                </div>
                <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {previews.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border bg-muted">
                    <img src={url} alt="Preview" className="h-full w-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-primary animate-pulse bg-primary/5 p-2 rounded-lg border border-primary/20">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI is extracting details...
                </div>
              )}

              {/* ✅ AI Report Summary Box (New) */}
              {!isAnalyzing && formData.aiReport && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-tight">AI Diagnostic Report</span>
                    <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                      {formData.confidence}% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-relaxed whitespace-pre-line italic">
                    "{formData.aiReport}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select 
                    value={selectedDeptId}
                    onValueChange={(val) => { setSelectedDeptId(val); setFormData({...formData, categoryId: ""}) }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select 
                    disabled={!selectedDeptId} 
                    value={formData.categoryId}
                    onValueChange={(val) => setFormData({...formData, categoryId: val})}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input id="title" placeholder="e.g., Pothole on Main Road" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Briefly explain the problem..." className="min-h-[80px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Step 3: Confirm Location</Label>
                <Button variant="outline" size="sm" onClick={getLocation} disabled={isDetecting} className="h-8 gap-1">
                  {isDetecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                  Auto-Detect
                </Button>
              </div>
              <Textarea 
                placeholder="Enter address manually or use Auto-Detect..." 
                className="min-h-[80px]" 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="h-40 bg-muted rounded-xl overflow-hidden border flex items-center justify-center">
                {formData.lat !== 0 ? (
                  <iframe width="100%" height="100%" src={`https://maps.google.com/maps?q=${formData.lat},${formData.lng}&z=15&output=embed`} className="grayscale opacity-80" />
                ) : (
                  <div className="text-muted-foreground text-xs italic">Detect location to see map preview</div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                <div className="p-3 bg-muted/30 border-b font-bold text-xs text-center uppercase tracking-wider text-muted-foreground">Review Details</div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Title:</span> <strong className="line-clamp-1">{formData.title}</strong></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Category:</span> <strong>{availableCategories.find((c: any) => c.id === formData.categoryId)?.name || "N/A"}</strong></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">AI Verified:</span> 
                    <strong className={formData.confidence > 70 ? "text-green-600" : "text-yellow-600"}>
                      {formData.confidence > 0 ? `${formData.confidence}% Confidence` : "Manual Entry"}
                    </strong>
                  </div>
                  <div className="flex flex-col gap-1 text-sm"><span className="text-muted-foreground">Location:</span> <strong className="text-xs leading-relaxed">{formData.address}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t mt-4">
          <Button variant="ghost" onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))} disabled={currentStep === 0 || isLoading}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep((prev) => prev + 1)} disabled={!canProceed()} className="px-8">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="px-8 bg-green-600 hover:bg-green-700 text-white">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />} Submit Report
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}