import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recycle, Factory } from 'lucide-react';
import type { NormalizedRecycle } from '@/lib/analyzeResult';

export function RecycleCard({ data }: { data: NormalizedRecycle }) {
  const methods = Array.isArray(data.methods) ? data.methods : [];
  const hasBody = Boolean(data.explanation?.trim());
  const hasMethods = methods.length > 0;

  return (
    <Card className="h-full border border-emerald-200/60 bg-gradient-to-b from-emerald-50/90 to-white rounded-3xl shadow-md shadow-emerald-900/5 overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-lg duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
              <Recycle className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">Recycle</h3>
              <p className="text-xs text-slate-500">Sort, clean, drop-off</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-emerald-100 text-emerald-900 border-emerald-200">
            <Factory className="w-3 h-3 mr-1" />
            {data.possible !== false ? 'Recyclable' : 'Check locally'}
          </Badge>
        </div>

        {hasBody && (
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{data.explanation}</p>
        )}

        {!hasBody && !hasMethods && (
          <p className="text-sm text-slate-500 italic py-2">
            No recycling steps returned — your council rules may still apply.
          </p>
        )}

        {hasMethods && (
          <div className="mt-auto space-y-2">
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Steps</p>
            <ol className="space-y-2 list-none">
              {methods.map((method, i) => (
                <li
                  key={i}
                  className="flex gap-3 items-start text-sm text-slate-800 bg-white/90 border border-emerald-100 rounded-xl px-3 py-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{method}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
