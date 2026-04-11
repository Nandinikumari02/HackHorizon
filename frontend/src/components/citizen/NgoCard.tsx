import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Sparkles } from 'lucide-react';
import type { NormalizedNgo } from '@/lib/analyzeResult';

export function NgoCard({ data }: { data: NormalizedNgo }) {
  const text =
    data.suggestion?.trim() ||
    'Join local clean-ups, repair cafés, or e-waste drives — small actions add up.';

  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl shadow-xl shadow-emerald-900/20 overflow-hidden ring-1 ring-white/10">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Heart className="w-7 h-7 fill-white/90 text-white" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100/90 mb-1">
              Community & impact
            </p>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-200" />
              Go further
            </h3>
          </div>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-white/95 mb-6 whitespace-pre-wrap">{text}</p>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100/80 border-t border-white/10 pt-4">
          <Users className="w-4 h-4" />
          Connect with local sustainability & NGO programs
        </div>
      </CardContent>
    </Card>
  );
}
