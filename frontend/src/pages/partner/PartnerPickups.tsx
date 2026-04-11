import { useCallback, useEffect, useState } from 'react';
import { wasteService } from '@/services/wasteService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw, Truck, User } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { API_BASE_URL } from '@/services/taskService';
import { formatDistanceToNow } from 'date-fns';

function img(path?: string) {
  if (!path) return '/placeholder-issue.jpg';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function PartnerPickups() {
  const [pending, setPending] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; fullname: string; email?: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [p, s] = await Promise.all([
        wasteService.getPendingPickups(),
        wasteService.getOrganizationStaff(),
      ]);
      setPending(Array.isArray(p) ? p : []);
      setStaffList(Array.isArray(s) ? s : []);
    } catch {
      toast.error('Could not load partner data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssign = async (requestId: string) => {
    const staffId = selection[requestId];
    if (!staffId) {
      toast.error('Select a staff member');
      return;
    }
    try {
      setAssigning(requestId);
      await wasteService.assignStaff(requestId, staffId);
      toast.success('Staff assigned');
      await load();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Assignment failed');
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading pending pickups…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-7 w-7 text-primary" />
            Partner hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pending pickup requests · assign field staff
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => load()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {pending.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-muted-foreground">
              No pending pickups. When citizens request pickup, they will appear here.
            </CardContent>
          </Card>
        ) : (
          pending.map((req) => (
            <Card key={req.id} className="overflow-hidden shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-start gap-4 space-y-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0 border">
                  <img
                    src={img(req.wasteLog?.imageUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight">
                    {req.wasteLog?.materialName || 'Waste item'}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <CategoryBadge category={req.wasteLog?.category?.name || 'General'} />
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Requested{' '}
                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                  </p>
                  {req.citizen?.user && (
                    <p className="text-xs flex items-center gap-1 mt-1 text-foreground/80">
                      <User className="h-3 w-3" />
                      {req.citizen.user.fullname}
                      {req.citizen.user.phoneNumber && ` · ${req.citizen.user.phoneNumber}`}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Assign to
                  </p>
                  <Select
                    value={selection[req.id] || ''}
                    onValueChange={(v) => setSelection((s) => ({ ...s, [req.id]: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={staffList.length ? 'Choose staff…' : 'No staff yet'} />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.fullname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="sm:w-auto w-full"
                  disabled={!selection[req.id] || assigning === req.id}
                  onClick={() => handleAssign(req.id)}
                >
                  {assigning === req.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Assign'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {staffList.length === 0 && (
        <p className="text-sm text-amber-800 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          No pickup staff found. Create staff accounts via{' '}
          <Badge variant="outline" className="mx-1">
            /api/auth/create-staff
          </Badge>{' '}
          (role WASTE_STAFF) or ask your administrator.
        </p>
      )}
    </div>
  );
}
