/**
 * Pick a valid Prisma `categoryId` for saving a waste log.
 * Prefer the `/waste/categories` list; if empty, derive unique ids from recycling centers.
 * Matches AI `category` + detected `item` against category names; falls back to the first row.
 */

export type CategoryRow = { id: string; name?: string };
export type CenterRow = { categoryId: string; category?: { name?: string } };

export function resolveCategoryIdForLog(
  aiCategory: string,
  itemLabel: string,
  categories: CategoryRow[],
  centers: CenterRow[]
): string {
  const rows: { id: string; name: string }[] = [];

  if (categories.length) {
    for (const c of categories) {
      if (c?.id) rows.push({ id: c.id, name: (c.name || '').trim() });
    }
  } else {
    const seen = new Set<string>();
    for (const c of centers) {
      if (c?.categoryId && !seen.has(c.categoryId)) {
        seen.add(c.categoryId);
        rows.push({ id: c.categoryId, name: (c.category?.name || '').trim() });
      }
    }
  }

  if (!rows.length) return '';

  const haystack = `${aiCategory || ''} ${itemLabel || ''}`.toLowerCase();
  let bestId = '';
  let bestScore = 0;

  for (const r of rows) {
    const n = (r.name || '').toLowerCase();
    if (!n) continue;
    let score = 0;
    if (haystack.includes(n)) score = Math.max(score, n.length + 20);
    const first = haystack.trim().split(/\s+/)[0] || '';
    if (first.length >= 2 && n.includes(first)) score = Math.max(score, 15);
    for (const word of haystack.split(/\W+/)) {
      if (word.length >= 3 && (n.includes(word) || word.includes(n))) {
        score = Math.max(score, word.length);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = r.id;
    }
  }

  if (bestId) return bestId;
  return rows[0].id;
}
