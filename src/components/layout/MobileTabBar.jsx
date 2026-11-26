import { FileText, Gauge, Palette, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

const ITEMS = [
  { id: 'content', label: 'Contenido', icon: FileText },
  { id: 'design', label: 'Diseño', icon: Palette },
  { id: 'ai', label: 'IA', icon: Sparkles },
  { id: 'ats', label: 'ATS', icon: Gauge },
];

export default function MobileTabBar({ activePanel, onSelect }) {
  return (
    <nav
      aria-label="Paneles"
      className="flex shrink-0 items-stretch border-t border-[#E9EAEE] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activePanel === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={active}
            className={cn(
              'flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition active:bg-[#F6F6F7]',
              active ? 'text-[#6B21D6]' : 'text-[#6B7280]',
            )}
          >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
