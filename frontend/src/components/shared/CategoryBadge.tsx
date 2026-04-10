import { cn } from '@/lib/utils';
import { 
  Droplets, Zap, Car, Trash2, Lightbulb, Waves, 
  Tag
} from 'lucide-react';

interface CategoryBadgeProps {
  // 'any' isliye taaki Prisma object {id, name} ya string dono handle ho sakein
  category: any; 
  showLabel?: boolean;
  className?: string;
}

// Map keywords to icons for dynamic matching
const iconMap: Record<string, any> = {
  water: Droplets,
  electricity: Zap,
  roads: Car,
  sanitation: Trash2,
  streetlights: Lightbulb,
  drainage: Waves,
  waste: Trash2,
};

// Map keywords to colors
const colorMap: Record<string, string> = {
  water: 'bg-blue-100 text-blue-700 border-blue-200',
  electricity: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  roads: 'bg-slate-100 text-slate-700 border-slate-200',
  sanitation: 'bg-green-100 text-green-700 border-green-200',
  streetlights: 'bg-amber-100 text-amber-700 border-amber-200',
  drainage: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

export function CategoryBadge({ category, showLabel = true, className }: CategoryBadgeProps) {
  // 1. Backend data normalize karein (String or Object)
  // Agar backend se pura object aa raha hai toh .name uthao, warna string
  const categoryRaw = typeof category === 'object' ? category?.name : category;
  const displayName = categoryRaw || "General";
  const searchKey = displayName.toLowerCase();

  // 2. Logic to find best match icon/color
  // Hum check kar rahe hain ki kya category name mein hamare keywords hain (e.g. "Water Supply" matches "water")
  const matchedKey = Object.keys(iconMap).find(key => searchKey.includes(key)) || 'default';

  const Icon = iconMap[matchedKey] || Tag;
  const colorClass = colorMap[matchedKey] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors',
        colorClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span className="capitalize">{displayName}</span>}
    </span>
  );
}