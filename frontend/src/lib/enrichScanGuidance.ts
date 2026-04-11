import type { NormalizedAnalyzeResult } from './analyzeResult';

/** When the ML model returns sparse text, add practical, realistic tips by material family. */
const BUCKETS: Record<
  string,
  {
    reuseIdeas: string[];
    reuseExpl: string;
    recycleMethods: string[];
    recycleExpl: string;
    disposalExpl: string;
    homeTip: string;
    ngo: string;
  }
> = {
  plastic: {
    reuseExpl:
      'Plastic containers are durable — cleaning and reusing beats recycling energy-wise. Avoid heating unknown plastics.',
    reuseIdeas: [
      'Clean and use as storage for dry goods, screws, or craft supplies.',
      'Cut bottles into funnels or plant watering spikes.',
      'Donate clean containers to schools or makerspaces.',
    ],
    recycleExpl:
      'Rinse food residue off. Check the resin code (1–7) — many curbside programs take bottles and jugs; thin films often need store drop-off.',
    recycleMethods: [
      'Empty, rinse, and air-dry before binning.',
      'Remove caps only if your local rules ask for it.',
      'Bag films separately where supermarket collection exists.',
    ],
    disposalExpl:
      'If not recyclable locally, place in landfill-bound waste — never burn plastics outdoors.',
    homeTip: 'Keep a small “clean plastics only” bin next to the sink to rinse quickly.',
    ngo: 'Look for beach or river clean-ups and plastic collection drives run by NGOs in your city.',
  },
  paper: {
    reuseExpl: 'Paper and cardboard can often be reused before pulping.',
    reuseIdeas: [
      'Use boxes for moving, gifts, or compost layering.',
      'Scrap paper for notes; junk mail as packaging filler.',
    ],
    recycleExpl:
      'Keep paper dry and grease-free. Pizza boxes go to compost or trash if soaked with oil — only clean parts recycle.',
    recycleMethods: ['Flatten cardboard to save truck space.', 'Remove plastic windows if required locally.'],
    disposalExpl: 'Soiled paper often belongs in organic or general waste per local rules.',
    homeTip: 'Tear large boxes down flat to save space.',
    ngo: 'Community paper-shredding and recycling events are common — watch municipal notices.',
  },
  glass: {
    reuseExpl: 'Glass jars are ideal for reuse — inert and easy to sterilize.',
    reuseIdeas: ['Store spices, pickles, or DIY cleaners.', 'Use as vases or candle holders.'],
    recycleExpl:
      'Glass is infinitely recyclable. Sort by colour if your facility asks. Remove metal lids into metal recycling.',
    recycleMethods: ['Rinse jars.', 'Separate broken glass into designated sharps-safe disposal if required.'],
    disposalExpl: 'Broken glass: wrap safely and follow municipal sharp-waste guidance — not always in mixed recycling.',
    homeTip: 'Keep a “glass only” crate to avoid breakage in mixed bags.',
    ngo: 'Some NGOs collect glass for small-scale artisans — search local zero-waste groups.',
  },
  metal: {
    reuseExpl: 'Metal cans and scrap are valuable — reuse where safe.',
    reuseIdeas: ['Large cans as pencil holders or small planters.', 'Scrap metal to informal collectors where legal.'],
    recycleExpl:
      'Steel and aluminium are widely recycled. Crush cans only if your program allows — some prefer intact for sorting.',
    recycleMethods: ['Rinse food cans.', 'Magnet test: ferrous scrap may go to metal yards.'],
    disposalExpl: 'Paint or chemical cans need hazardous-waste rules — never mix with food cans.',
    homeTip: 'Dry cans before the bin to reduce smell.',
    ngo: 'E-waste and battery take-backs are often run with metal recyclers — check producer programs.',
  },
  organic: {
    reuseExpl: 'Organic waste is best composted, not landfilled.',
    reuseIdeas: ['Home compost or community composter.', 'Use coffee grounds in gardens (acid-loving plants).'],
    recycleExpl: 'Many cities run separate organic collection — use the right green bin.',
    recycleMethods: ['Separate cooked vs raw if required.', 'No plastic stickers in home compost.'],
    disposalExpl: 'If no composting, sealed landfill-bound bag reduces pests.',
    homeTip: 'Freeze smelly scraps until collection day.',
    ngo: 'Join urban farming or composting cooperatives.',
  },
  ewaste: {
    reuseExpl: 'Electronics often contain hazardous parts — reuse or certified recycling only.',
    reuseIdeas: ['Working devices: donate or sell.', 'Spare parts for repair cafés.'],
    recycleExpl:
      'Use producer take-back, e-waste bins, or authorized dismantlers — never open CRTs or batteries yourself.',
    recycleMethods: ['Wipe data before donation.', 'Tape battery terminals before drop-off.'],
    disposalExpl: 'Batteries and bulbs follow hazardous-waste routes.',
    homeTip: 'Collect small e-waste in one box until a drop-off day.',
    ngo: 'Many NGOs partner with brands for safe e-waste — search “e-waste collection + your city”.',
  },
  general: {
    reuseExpl: 'Reducing and reusing comes before recycling — buy durable items when possible.',
    reuseIdeas: ['Repair instead of replace when cost-effective.', 'Share tools with neighbours.'],
    recycleExpl: 'Follow your municipal colour-coded bins and schedule.',
    recycleMethods: ['Sort at source.', 'Keep recyclables clean and dry.'],
    disposalExpl: 'When unsure, use official helplines — wishcycling hurts sorting plants.',
    homeTip: 'Label home bins clearly for all family members.',
    ngo: 'Local sustainability groups often run fix-it clinics and swap meets.',
  },
};

function detectBucket(text: string): keyof typeof BUCKETS {
  const t = text.toLowerCase();
  if (/plastic|pet|hdpe|bottle|poly|bag|wrapper|straw/i.test(t)) return 'plastic';
  if (/paper|cardboard|carton|newspaper|magazine/i.test(t)) return 'paper';
  if (/glass|jar|bottle.*glass/i.test(t)) return 'glass';
  if (/metal|can|aluminium|aluminum|steel|tin|foil/i.test(t)) return 'metal';
  if (/organic|food|garden|compost|vegetable|fruit|leaf/i.test(t)) return 'organic';
  if (/e-waste|electronic|battery|phone|laptop|cable|charger|bulb/i.test(t)) return 'ewaste';
  return 'general';
}

function needsFill(s: string | undefined): boolean {
  return !s || String(s).trim().length < 24;
}

function needsList(arr: string[] | undefined, min = 1): boolean {
  return !arr || arr.filter((x) => String(x).trim()).length < min;
}

export function enrichScanGuidance(result: NormalizedAnalyzeResult): NormalizedAnalyzeResult {
  const key = `${result.detection.category} ${result.detection.item}`;
  const bucket = BUCKETS[detectBucket(key)] ?? BUCKETS.general;

  const reuse = { ...result.guidance.reuse };
  const recycle = { ...result.guidance.recycle };
  const disposal = { ...result.guidance.disposal };
  const ngo = { ...result.ngo };

  if (needsFill(reuse.explanation)) {
    reuse.explanation = [reuse.explanation?.trim(), bucket.reuseExpl].filter(Boolean).join(' ');
  }
  if (needsList(reuse.ideas, 1)) {
    reuse.ideas = [...reuse.ideas, ...bucket.reuseIdeas].filter((x, i, a) => a.indexOf(x) === i).slice(0, 8);
  }

  if (needsFill(recycle.explanation)) {
    recycle.explanation = [recycle.explanation?.trim(), bucket.recycleExpl].filter(Boolean).join(' ');
  }
  if (needsList(recycle.methods, 1)) {
    recycle.methods = [...recycle.methods, ...bucket.recycleMethods]
      .filter((x, i, a) => a.indexOf(x) === i)
      .slice(0, 10);
  }

  if (needsFill(disposal.explanation)) {
    disposal.explanation = [disposal.explanation?.trim(), bucket.disposalExpl].filter(Boolean).join(' ');
  }
  if (!disposal.homeMethods?.trim()) {
    disposal.homeMethods = bucket.homeTip;
  }

  if (needsFill(ngo.suggestion)) {
    ngo.suggestion = [ngo.suggestion?.trim(), bucket.ngo].filter(Boolean).join(' ');
  }

  let summary = result.detection.summary?.trim() || '';
  if (summary.length < 40 || /^ai analysis/i.test(summary)) {
    summary = [
      `Identified as ${result.detection.item} (${result.detection.category}).`,
      `Model confidence: ${result.detection.confidence}.`,
      'Follow reuse first, then recycling, then safe disposal — your city’s rules always take priority.',
    ].join(' ');
  }

  return {
    ...result,
    detection: { ...result.detection, summary },
    guidance: { reuse, recycle, disposal },
    ngo,
  };
}
