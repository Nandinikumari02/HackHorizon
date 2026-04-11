import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target } from 'lucide-react';
import type { NormalizedDetection } from '@/lib/analyzeResult';

export function DetectionCard({ data }: { data: NormalizedDetection }) {
  const conf = data.confidence?.trim() || '—';
  const showConf = conf !== '—';

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl overflow-hidden ring-1 ring-white/10">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
              <Target className="w-6 h-6" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90 mb-1">
                AI detection
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                {data.item || 'Unknown item'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/15">
                  {data.category || 'General'}
                </Badge>
                {showConf && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/30 text-emerald-50 border-emerald-400/40"
                  >
                    <Sparkles className="w-3 h-3 mr-1 opacity-90" />
                    {conf}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-black/25 border border-white/10 p-4 sm:p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Summary</p>
          <p className="text-sm sm:text-base leading-relaxed text-slate-100/95 whitespace-pre-wrap">
            {data.summary || 'No summary provided for this scan.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
