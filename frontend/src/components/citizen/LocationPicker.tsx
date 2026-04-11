import { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationPickerProps {
  address: string;
  onAddressChange: (v: string) => void;
  latitude: number;
  longitude: number;
  onCoordsChange: (lat: number, lng: number) => void;
}

export function LocationPicker({
  address,
  onAddressChange,
  latitude,
  longitude,
  onCoordsChange,
}: LocationPickerProps) {
  const [loading, setLoading] = useState(false);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        onCoordsChange(p.coords.latitude, p.coords.longitude);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <Card className="rounded-3xl border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          Your location
        </CardTitle>
        <CardDescription>
          Add a nearby place or neighbourhood — it is sent with your scan to the AI and used to find
          recycling centres near you. GPS improves accuracy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nearby-address">Area / landmark (optional)</Label>
          <Input
            id="nearby-address"
            placeholder="e.g. MG Road, Indiranagar, or your pincode"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="gap-2 rounded-xl"
            onClick={handleUseGps}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Use my current location
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
