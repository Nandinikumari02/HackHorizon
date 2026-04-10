import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Camera, Loader2, X, AlertTriangle, Building2, MapPin, CalendarDays, History } from "lucide-react";
import { securityService, type ScanDetails } from "@/services/securityService";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function SecurityBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  
  // Form State
  const [details, setDetails] = useState<ScanDetails>({
    name: '',
    location: '',
    year: '',
    renovation: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Bina details ke scan nahi hoga
    if (!details.name || !details.location) {
      toast({ 
        variant: "destructive", 
        title: "Details Required", 
        description: "Please enter building name and location first." 
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsScanning(true);
      setScanResult(null);
      
      // Service call with both file and details
      const res = await securityService.scanInfrastructure(file, details);
      
      setScanResult(res.data);
      
      toast({ 
        title: "Scan Complete", 
        description: "Report generated and saved to your history." 
      });
    } catch (error: any) {
      console.error("Scan error:", error);
      toast({ 
        variant: "destructive", 
        title: "Analysis Failed", 
        description: error.response?.data?.message || "Could not reach the AI server." 
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setScanResult(null);
    setDetails({ name: '', location: '', year: '', renovation: '' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <Card className="w-80 sm:w-96 shadow-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="p-4 border-b bg-primary text-primary-foreground flex flex-row items-center justify-between space-y-0 rounded-t-xl">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Infrastructure AI Security
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-4 max-h-[500px] overflow-y-auto space-y-4 bg-background">
            
            {/* --- STEP 1: FORM INPUTS --- */}
            {!scanResult && !isScanning && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="text-center pb-2">
                  <p className="text-xs text-muted-foreground italic">Enter details and provide a photo for AI analysis</p>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Building/Bridge Name" className="pl-9" value={details.name} onChange={(e) => setDetails({...details, name: e.target.value})} />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Location" className="pl-9" value={details.location} onChange={(e) => setDetails({...details, location: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" placeholder="Const. Year" className="pl-9 text-xs" value={details.year} onChange={(e) => setDetails({...details, year: e.target.value})} />
                    </div>
                    <div className="relative">
                      <History className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" placeholder="Last Reno." className="pl-9 text-xs" value={details.renovation} onChange={(e) => setDetails({...details, renovation: e.target.value})} />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full gap-2 shadow-lg py-6 text-base font-bold" 
                  disabled={!details.name || !details.location}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" /> Take Photo & Scan
                </Button>
              </div>
            )}

            {/* --- STEP 2: SCANNING LOADER --- */}
            {isScanning && (
              <div className="flex flex-col items-center py-12 gap-4">
                <div className="relative">
                   <Loader2 className="h-14 w-14 animate-spin text-primary" />
                   <ShieldAlert className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-primary uppercase tracking-widest">AI Analyzing...</p>
                  <p className="text-xs text-muted-foreground mt-1">Calculating structural health & risk</p>
                </div>
              </div>
            )}

            {/* --- STEP 3: RESULTS (Updated for Prisma Keys) --- */}
            {scanResult && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className={cn(
                  "p-4 rounded-xl border-2 shadow-sm",
                  scanResult.riskLevel === 'Moderate' || scanResult.riskLevel === 'High' 
                    ? "bg-amber-50 border-amber-200" 
                    : "bg-emerald-50 border-emerald-200"
                )}>
                  <div className="flex items-start gap-3">
                    {scanResult.riskLevel !== 'Low' ? <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" /> : <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                        Structural Analysis: {scanResult.buildingName}
                      </h4>
                      <p className="text-sm font-semibold mt-1 text-foreground leading-tight italic">
                        "{scanResult.summary}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-secondary/30 p-3 rounded-lg text-center border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Health Score</p>
                      <p className="font-black text-xl text-primary">
                        {scanResult.healthScore}%
                      </p>
                   </div>
                   <div className="bg-secondary/30 p-3 rounded-lg text-center border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Risk Level</p>
                      <p className={cn(
                        "font-black text-xl",
                        scanResult.riskLevel !== 'Low' ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {scanResult.riskLevel}
                      </p>
                   </div>
                </div>

                {scanResult.recommendations?.length > 0 && (
                  <div className="bg-muted/30 p-3 rounded-lg border border-dashed">
                    <p className="text-[10px] font-bold uppercase mb-2">AI Recommendations:</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {scanResult.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">•</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button variant="outline" className="w-full text-xs h-10" onClick={resetForm}>
                  New Analysis
                </Button>
              </div>
            )}
          </CardContent>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment" 
            onChange={handleFileChange} 
          />
        </Card>
      )}

      {/* --- Toggle Button --- */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen ? "bg-destructive" : "bg-primary"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
      </Button>
    </div>
  );
}