import { cn } from '../../utils/cn';

export default function Tabs({ items, value, onChange, className }) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl bg-[#F3F4F6] p-1', className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            value === item.value
              ? 'bg-white text-[#0E1318] shadow-sm'
              : 'text-[#6B7280] hover:text-[#0E1318]',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
