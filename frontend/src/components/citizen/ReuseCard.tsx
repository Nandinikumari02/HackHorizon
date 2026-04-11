import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Lightbulb, Leaf } from 'lucide-react';
import type { NormalizedReuse } from '@/lib/analyzeResult';

export function ReuseCard({ data }: { data: NormalizedReuse }) {
  const ideas = Array.isArray(data.ideas) ? data.ideas : [];
  const hasBody = Boolean(data.explanation?.trim());
  const hasIdeas = ideas.length > 0;

  return (
    <Card className="h-full border border-sky-200/60 bg-gradient-to-b from-sky-50/90 to-white rounded-3xl shadow-md shadow-sky-900/5 overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-lg duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/25">
              <RefreshCw className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">Reuse</h3>
              <p className="text-xs text-slate-500">Give it a second life</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-sky-100 text-sky-900 border-sky-200">
            <Leaf className="w-3 h-3 mr-1" />
            {data.possible !== false ? 'Often possible' : 'Limited'}
          </Badge>
        </div>

        {hasBody && (
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{data.explanation}</p>
        )}

        {!hasBody && !hasIdeas && (
          <p className="text-sm text-slate-500 italic py-2">
            No reuse tips returned for this item — try a clearer photo or another angle.
          </p>
        )}

        {hasIdeas && (
          <div className="mt-auto space-y-2">
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wide">Ideas</p>
            <ul className="space-y-2">
              {ideas.map((idea, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 items-start text-sm text-slate-800 bg-white/80 border border-sky-100 rounded-xl px-3 py-2.5"
                >
                  <Lightbulb className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
