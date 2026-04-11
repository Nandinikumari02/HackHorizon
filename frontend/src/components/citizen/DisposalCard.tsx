import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, Home, MapPin } from 'lucide-react';
import type { NormalizedDisposal } from '@/lib/analyzeResult';

export function DisposalCard({ data }: { data: NormalizedDisposal }) {
  const opts = Array.isArray(data.externalOptions) ? data.externalOptions : [];
  const typeLabel = (data.type || 'safe').replace(/_/g, ' ');
  const hasExpl = Boolean(data.explanation?.trim());
  const hasHome = Boolean(data.homeMethods?.trim());

  return (
    <Card className="h-full border border-orange-200/60 bg-gradient-to-b from-orange-50/90 to-white rounded-3xl shadow-md shadow-orange-900/5 overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-lg duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
              <Trash2 className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">Dispose safely</h3>
              <p className="text-xs text-slate-500">Last resort — do it right</p>
            </div>
          </div>
          <Badge className="shrink-0 bg-orange-100 text-orange-900 border-orange-200 capitalize">
            {typeLabel}
          </Badge>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">Guidance</span>
          </div>
          {hasExpl ? (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{data.explanation}</p>
          ) : (
            <p className="text-sm text-slate-500 italic">No extra disposal notes from the model.</p>
          )}
        </div>

        {hasHome && (
          <div className="mb-4 rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-3 py-2.5">
            <p className="text-xs font-semibold text-orange-900 flex items-center gap-1.5 mb-1">
              <Home className="w-3.5 h-3.5" /> At home
            </p>
            <p className="text-sm text-slate-700">{data.homeMethods}</p>
          </div>
        )}

        {opts.length > 0 && (
          <div className="mt-auto space-y-2">
            <p className="text-xs font-bold text-orange-900 uppercase tracking-wide">Drop-off options</p>
            <div className="flex flex-wrap gap-2">
              {opts.map((o, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-800 bg-white border border-orange-100 rounded-lg px-2.5 py-1.5"
                >
                  <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                  {o}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
