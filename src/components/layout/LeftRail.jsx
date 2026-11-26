import { FileText, Gauge, Palette, Settings, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

const ITEMS = [
  { id: 'content', label: 'Contenido', icon: FileText },
  { id: 'design', label: 'Diseño', icon: Palette },
  { id: 'ai', label: 'IA', icon: Sparkles },
  { id: 'ats', label: 'ATS', icon: Gauge },
];

export default function LeftRail({ activePanel, onChange, onOpenSettings }) {
  return (
    <nav className="hidden w-[76px] shrink-0 flex-col items-center border-r border-[#E9EAEE] bg-white py-3 lg:flex">
      <div className="flex flex-1 flex-col items-center gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activePanel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-pressed={active}
              className={cn(
                'group relative flex h-[58px] w-[62px] flex-col items-center justify-center gap-1 rounded-xl transition',
                active
                  ? 'bg-[#F4ECFF] text-[#6B21D6]'
                  : 'text-[#6B7280] hover:bg-[#F6F6F7] hover:text-[#0E1318]',
              )}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#7D2AE8]" />
              ) : null}
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        title="Ajustes"
        aria-label="Ajustes"
        className="flex h-[52px] w-[62px] flex-col items-center justify-center gap-1 rounded-xl text-[#6B7280] transition hover:bg-[#F6F6F7] hover:text-[#0E1318]"
      >
        <Settings size={19} strokeWidth={1.8} />
        <span className="text-[10px] font-semibold">Ajustes</span>
      </button>
    </nav>
  );
}
