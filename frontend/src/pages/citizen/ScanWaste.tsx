import { useState, useEffect } from 'react';
import { wasteService, type WasteLogPayload } from '@/services/wasteService';
import type { NormalizedAnalyzeResult } from '@/lib/analyzeResult';
import { UploadCard } from '@/components/citizen/UploadCard';
import { DetectionCard } from '@/components/citizen/DetectionCard';
import { ReuseCard } from '@/components/citizen/ReuseCard';
import { RecycleCard } from '@/components/citizen/RecycleCard';
import { DisposalCard } from '@/components/citizen/DisposalCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RefreshCcw, CheckCircle, Loader2, MapPin, Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { resolveCategoryIdForLog } from '@/lib/resolveCategoryId';
import { LocationPicker } from '@/components/citizen/LocationPicker';
import { NearbyCentersCard } from '@/components/citizen/NearbyCentersCard';

export default function ScanWaste() {
  const [scanResult, setScanResult] = useState<NormalizedAnalyzeResult | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [disposeLoading, setDisposeLoading] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [centers, setCenters] = useState<{ categoryId: string; category?: { name?: string } }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [coords, setCoords] = useState({ latitude: 23.3441, longitude: 85.3096 });
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    Promise.all([
      wasteService.getWasteCategories().catch(() => []),
      wasteService.getRecyclingCenters().catch(() => []),
    ]).then(([cats, ctrs]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setCenters(Array.isArray(ctrs) ? ctrs : []);
    });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) =>
        setCoords({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (!originalFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(originalFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [originalFile]);

  const handleAnalysisSuccess = (result: NormalizedAnalyzeResult, file: File) => {
    setScanResult(result);
    setOriginalFile(file);
    setIsLogged(false);
  };

  const handleNewScan = () => {
    setScanResult(null);
    setOriginalFile(null);
    setIsLogged(false);
    setSelectedCenterId(null);
  };

  const handleSaveToHistory = async () => {
    if (!scanResult || !originalFile) {
      toast.error('No analysis data found to save.');
      return;
    }

    try {
      setIsSaving(true);

      const categoryId = resolveCategoryIdForLog(
        scanResult.detection?.category || '',
        scanResult.detection?.item || '',
        categories,
        centers
      );
      if (!categoryId) {
        toast.error('No waste categories available.');
        return;
      }

      const payload: WasteLogPayload = {
        materialName: scanResult.detection.item || 'Unknown Material',
        categoryName: scanResult.detection.category || 'General',
        latitude: coords.latitude,
        longitude: coords.longitude,
        categoryId,
        recycleTip: scanResult.guidance.recycle.explanation || '',
        reuseTip: scanResult.guidance.reuse.explanation || '',
        disposeTip: scanResult.guidance.disposal.explanation || '',
        ngoSuggestion: scanResult.ngo.suggestion || '',
        requestPickup: false,
      };

      await wasteService.logWaste(payload, originalFile);
      setIsLogged(true);
      toast.success('Saved to history!');
    } catch (error: unknown) {
      console.error('Logging Error:', error);
      const err = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisposeAtCenter = async (center: any) => {
    if (!scanResult || !originalFile) {
      toast.error('No analysis data found to dispose.');
      return;
    }

    const categoryId = resolveCategoryIdForLog(
      scanResult.detection?.category || '',
      scanResult.detection?.item || '',
      categories,
      centers
    );

    if (!categoryId) {
      toast.error('No waste categories available.');
      return;
    }

    try {
      setSelectedCenterId(center.id);
      setDisposeLoading(true);
      await wasteService.logWaste(
        {
          materialName: scanResult.detection.item || 'Unknown Material',
          categoryName: scanResult.detection.category || 'General',
          latitude: coords.latitude,
          longitude: coords.longitude,
          categoryId,
          centerId: center.id,
          recycleTip: scanResult.guidance.recycle.explanation || '',
          reuseTip: scanResult.guidance.reuse.explanation || '',
          disposeTip: scanResult.guidance.disposal.explanation || '',
          ngoSuggestion: scanResult.ngo.suggestion || '',
          requestPickup: true,
        },
        originalFile
      );
      setIsLogged(true);
      toast.success(`Pickup requested at ${center.name}`);
    } catch (error: unknown) {
      setSelectedCenterId(null);
      console.error('Dispose Error:', error);
      const err = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Dispose request failed.');
    } finally {
      setDisposeLoading(false);
    }
  };

  if (!scanResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Scan Waste</h1>
          <p className="text-gray-600">Upload a photo and we'll identify it + find nearby recycling centers</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <LocationPicker
            address={userAddress}
            onAddressChange={setUserAddress}
            latitude={coords.latitude}
            longitude={coords.longitude}
            onCoordsChange={(lat, lng) => setCoords({ latitude: lat, longitude: lng })}
          />
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold">Your Location</h3>
              </div>
              <p className="text-sm text-gray-600">
                {userAddress
                  ? userAddress
                  : `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`}
              </p>
            </CardContent>
          </Card>
        </div>

        <UploadCard locationLabel={userAddress} onUploadSuccess={handleAnalysisSuccess} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Scan Results</h1>
        <Button variant="outline" onClick={handleNewScan} className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          New Scan
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <DetectionCard data={scanResult.detection} />
          
          {previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={previewUrl}
                  alt="Uploaded waste"
                  className="w-full rounded-lg"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLogged ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Save this scan to track your environmental impact.
                  </p>
                  <Button
                    onClick={handleSaveToHistory}
                    disabled={isSaving}
                    className="w-full gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save to History'}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Saved to history</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Disposal</p>
                  <p className="text-xs text-gray-600">{scanResult.guidance.disposal.explanation}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Recycle</p>
                  <p className="text-xs text-gray-600">{scanResult.guidance.recycle.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">What You Can Do</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <ReuseCard data={scanResult.guidance.reuse} />
            <RecycleCard data={scanResult.guidance.recycle} />
            <DisposalCard data={scanResult.guidance.disposal} />
          </div>
        </div>

        <NearbyCentersCard
          latitude={coords.latitude}
          longitude={coords.longitude}
          categoryId={
            resolveCategoryIdForLog(
              scanResult.detection?.category || '',
              scanResult.detection?.item || '',
              categories,
              centers
            ) || undefined
          }
          address={userAddress}
          onDispose={handleDisposeAtCenter}
          disposingCenterId={disposeLoading ? selectedCenterId ?? undefined : undefined}
          selectedCenterId={selectedCenterId ?? undefined}
        />
      </div>
    </div>
  );
}
