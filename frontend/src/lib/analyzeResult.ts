/**
 * Normalizes /analyze API payloads so the scan UI always gets a stable shape
 * whether the backend already mapped the ML model or returns a raw-ish JSON.
 */

export interface NormalizedDetection {
  item: string;
  category: string;
  /** Human-readable e.g. "94.2%" */
  confidence: string;
  summary: string;
}

export interface NormalizedReuse {
  possible: boolean;
  ideas: string[];
  explanation: string;
}

export interface NormalizedRecycle {
  possible: boolean;
  methods: string[];
  explanation: string;
}

export interface NormalizedDisposal {
  type: string;
  homeMethods: string;
  externalOptions: string[];
  explanation: string;
}

export interface NormalizedNgo {
  available: boolean;
  suggestion: string;
}

export interface NormalizedAnalyzeResult {
  detection: NormalizedDetection;
  guidance: {
    reuse: NormalizedReuse;
    recycle: NormalizedRecycle;
    disposal: NormalizedDisposal;
  };
  ngo: NormalizedNgo;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === 'object' && !Array.isArray(x);
}

/** Coerce unknown values to a clean list of short strings (ideas, methods, etc.). */
export function toStringList(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch {
      /* not JSON */
    }
    return t
      .split(/\n|(?:\s*[,;•]\s*)/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(value).trim()].filter(Boolean);
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

function stringifySummary(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v, null, 0);
  } catch {
    return String(v);
  }
}

export function formatConfidence(c: unknown): string {
  if (c == null || c === '') return '—';
  if (typeof c === 'string') {
    const s = c.trim();
    if (s.includes('%')) return s;
    const n = parseFloat(s.replace(/%/g, ''));
    if (!Number.isNaN(n)) {
      return n <= 1 && n > 0 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
    }
    return s;
  }
  if (typeof c === 'number') {
    if (c >= 0 && c <= 1) return `${(c * 100).toFixed(1)}%`;
    if (c > 1 && c <= 100) return `${c.toFixed(1)}%`;
    return `${c}`;
  }
  return '—';
}

function normalizeReuse(raw: unknown): NormalizedReuse {
  const o = isRecord(raw) ? raw : {};
  const ideas = toStringList(o.ideas);
  const explanation = pickString(o, ['explanation', 'detail', 'text', 'description']) || '';
  return {
    possible: typeof o.possible === 'boolean' ? o.possible : true,
    ideas,
    explanation,
  };
}

function normalizeRecycle(raw: unknown): NormalizedRecycle {
  const o = isRecord(raw) ? raw : {};
  const methods = toStringList(o.methods);
  const explanation = pickString(o, ['explanation', 'detail', 'text', 'description']) || '';
  return {
    possible: typeof o.possible === 'boolean' ? o.possible : true,
    methods,
    explanation,
  };
}

function normalizeDisposal(raw: unknown): NormalizedDisposal {
  const o = isRecord(raw) ? raw : {};
  const externalOptions = toStringList(o.externalOptions);
  const homeMethods =
    typeof o.homeMethods === 'string'
      ? o.homeMethods
      : pickString(o, ['home_disposal', 'homeMethods']) || '';
  const explanation = pickString(o, ['explanation', 'detail', 'text', 'description']) || '';
  const type = pickString(o, ['type', 'kind', 'mode']) || 'safe';
  return {
    type,
    homeMethods,
    externalOptions,
    explanation,
  };
}

function emptyResult(): NormalizedAnalyzeResult {
  return {
    detection: {
      item: 'Unknown item',
      category: 'General',
      confidence: '—',
      summary: 'Analysis completed. Review the sections below for guidance.',
    },
    guidance: {
      reuse: { possible: true, ideas: [], explanation: '' },
      recycle: { possible: true, methods: [], explanation: '' },
      disposal: {
        type: 'safe',
        homeMethods: '',
        externalOptions: [],
        explanation: '',
      },
    },
    ngo: {
      available: true,
      suggestion: 'Support local sustainability and repair initiatives near you.',
    },
  };
}

function mergeBackendShape(input: Record<string, unknown>): NormalizedAnalyzeResult {
  const det = isRecord(input.detection) ? input.detection : {};
  const gui = isRecord(input.guidance) ? input.guidance : {};
  const ngoIn = isRecord(input.ngo) ? input.ngo : {};

  const item = pickString(det, ['item', 'material', 'label']) || 'Unknown item';
  const category = pickString(det, ['category', 'type', 'class']) || 'General';
  const confRaw = det.confidence;
  const confidence =
    typeof confRaw === 'string' && confRaw.includes('%')
      ? confRaw
      : formatConfidence(confRaw);
  const summary =
    stringifySummary(det.summary) ||
    'Here is what we detected and how you can handle this waste responsibly.';

  return {
    detection: { item, category, confidence, summary },
    guidance: {
      reuse: normalizeReuse(gui.reuse),
      recycle: normalizeRecycle(gui.recycle),
      disposal: normalizeDisposal(gui.disposal),
    },
    ngo: {
      available: ngoIn.available !== false,
      suggestion: pickNgoSuggestion(ngoIn),
    },
  };
}

function pickNgoSuggestion(ngoIn: Record<string, unknown>): string {
  const raw = ngoIn.suggestion ?? ngoIn.message;
  if (Array.isArray(raw) && raw.length) return String(raw[0]).trim();
  if (raw != null && typeof raw === 'object') return stringifySummary(raw);
  const s = pickString(ngoIn, ['suggestion', 'message', 'text']);
  if (s) return s;
  return emptyResult().ngo.suggestion;
}

/**
 * Build from a flat ML-style JSON (no detection/guidance wrappers).
 */
function fromFlatMl(o: Record<string, unknown>): NormalizedAnalyzeResult {
  const prediction = pickString(o, ['prediction', 'item', 'material', 'label', 'class_name']);
  const category = pickString(o, ['category', 'type', 'class']);
  const confidence = formatConfidence(o.confidence ?? o.score ?? o.probability);
  const summary = stringifySummary(o.summary ?? o.message) || emptyResult().detection.summary;

  const report = isRecord(o.report) ? o.report : {};
  const guidance = isRecord(o.guidance) ? o.guidance : o;

  const reusable = isRecord(guidance.reusable) ? guidance.reusable : {};
  const recyclable = isRecord(guidance.recyclable) ? guidance.recyclable : {};
  const disposable = isRecord(guidance.disposable) ? guidance.disposable : {};

  const reuseIdeas = toStringList(reusable.ideas);
  const reuseExpl =
    pickString(reusable, ['explanation', 'tips']) ||
    pickString(report, ['importance']) ||
    '';

  const recycleMethods = toStringList(recyclable.methods);
  const recycleExpl =
    pickString(recyclable, ['explanation', 'tips']) ||
    pickString(report, ['why_it_matters']) ||
    '';

  let disposalExpl = '';
  const facts = report.facts;
  if (Array.isArray(facts)) disposalExpl = facts.map(String).join('. ');
  else if (facts != null) disposalExpl = String(facts);

  const innovations = report.innovations;
  let ngoSuggestion = 'Support local sustainability initiatives.';
  if (Array.isArray(innovations) && innovations.length) ngoSuggestion = String(innovations[0]);
  else if (innovations != null) ngoSuggestion = String(innovations);

  return {
    detection: {
      item: prediction || 'Unknown item',
      category: category || 'General',
      confidence,
      summary,
    },
    guidance: {
      reuse: {
        possible: reusable.possible !== false,
        ideas: reuseIdeas,
        explanation: reuseExpl,
      },
      recycle: {
        possible: recyclable.possible !== false,
        methods: recycleMethods,
        explanation: recycleExpl,
      },
      disposal: {
        type: pickString(disposable, ['type']) || 'external',
        homeMethods:
          typeof disposable.home_disposal === 'string'
            ? disposable.home_disposal
            : String(disposable.home_disposal ?? ''),
        externalOptions: toStringList(disposable.external_options ?? disposable.externalOptions),
        explanation: disposalExpl,
      },
    },
    ngo: { available: true, suggestion: ngoSuggestion },
  };
}

/**
 * Call after GET /waste/analyze (or when passing raw JSON into the scan UI).
 */
export function normalizeAnalyzeResponse(raw: unknown): NormalizedAnalyzeResult {
  if (raw == null) return emptyResult();

  let root: unknown = raw;
  if (typeof raw === 'string') {
    try {
      root = JSON.parse(raw);
    } catch {
      return emptyResult();
    }
  }

  if (!isRecord(root)) return emptyResult();

  // Axios error shape accidentally passed
  if (root.error && !root.detection) {
    return emptyResult();
  }

  // Some APIs wrap payload in `data`
  let body: Record<string, unknown> = root;
  if (isRecord(root.data) && !('detection' in root) && 'prediction' in (root.data as object)) {
    body = root.data as Record<string, unknown>;
  } else if (isRecord(root.data) && 'detection' in (root.data as object)) {
    body = root.data as Record<string, unknown>;
  }

  if (body.detection && body.guidance) {
    return mergeBackendShape(body);
  }

  return fromFlatMl(body);
}
