import { useEffect, useState } from 'react';
import { wasteService } from '@/services/wasteService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, ExternalLink, Loader2, MapPin, Sparkles } from 'lucide-react';

type CenterRow = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  contactInfo?: string | null;
  category?: { name?: string };
};

interface NearbyCentersCardProps {
  latitude: number;
  longitude: number;
  categoryId?: string;
  address?: string;
  onDispose?: (center: CenterRow) => void;
  disposingCenterId?: string;
  selectedCenterId?: string;
}

function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function NearbyCentersCard({ latitude, longitude, categoryId, address, onDispose, disposingCenterId, selectedCenterId }: NearbyCentersCardProps) {
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<CenterRow[]>([]);
  const [mlNearby, setMlNearby] = useState<unknown[]>([]);
  const [mlAvailable, setMlAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await wasteService.getNearbyCenters({
          latitude,
          longitude,
          categoryId,
          address,
        });
        if (cancelled) return;
        setCenters(Array.isArray(data.centers) ? data.centers : []);
        setMlNearby(Array.isArray(data.mlNearby) ? data.mlNearby : []);
        setMlAvailable(Boolean(data.mlNearbyAvailable));
      } catch {
        if (!cancelled) setError('Could not load nearby centres.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, categoryId, address]);

  if (loading) {
    return (
      <Card className="rounded-3xl border-dashed">
        <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm">Finding recycling centres near you…</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-3xl border-destructive/30 bg-destructive/5">
        <CardContent className="py-6 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl overflow-hidden border-emerald-200/60 shadow-md">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-0">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-6 w-6" />
            Nearby recycling centres
          </CardTitle>
          <CardDescription className="text-emerald-100">
            Sorted by distance from your pin. Add centres in the admin database to see more results.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {centers.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No registered centres in EcoSarthi for this location or category yet. Ask your admin to add
              recycling centres with coordinates, or check ML suggestions below.
            </p>
          ) : (
            <ul className="divide-y">
              {centers.map((c) => (
                <li key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{c.name}</span>
                      {c.category?.name && (
                        <Badge variant="secondary" className="text-xs">
                          {c.category.name}
                        </Badge>
                      )}
                      <Badge className="bg-emerald-600 text-white text-xs">{c.distanceKm} km</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{c.address}</span>
                    </p>
                    {c.contactInfo && (
                      <p className="text-xs text-muted-foreground">{c.contactInfo}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Button size="sm" variant="outline" className="shrink-0 gap-1.5 rounded-xl" asChild>
                      <a href={mapsUrl(c.latitude, c.longitude)} target="_blank" rel="noreferrer">
                        Open in Maps <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    {onDispose && (
                      <Button
                        size="sm"
                        variant={selectedCenterId === c.id ? 'secondary' : 'outline'}
                        className="shrink-0 gap-1.5 rounded-xl"
                        disabled={Boolean(disposingCenterId && disposingCenterId !== c.id)}
                        onClick={() => onDispose(c)}
                      >
                        {selectedCenterId === c.id ? 'Requested' : 'Dispose here'}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {(mlAvailable || mlNearby.length > 0) && (
        <Card className="rounded-3xl border-violet-200/60 bg-violet-50/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              AI nearby suggestions
            </CardTitle>
            <CardDescription>
              From your ML service (`nearby_prediction`). Format may vary — verify before visiting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mlNearby.length === 0 ? (
              <p className="text-sm text-muted-foreground">No extra rows returned from the model.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {mlNearby.map((row, i) => (
                  <li
                    key={i}
                    className="rounded-xl border bg-card px-3 py-2 font-mono text-xs break-all"
                  >
                    {typeof row === 'string' ? row : JSON.stringify(row)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
