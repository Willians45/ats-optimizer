import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3.5 pr-9 text-sm text-[#0E1318] shadow-[0_1px_2px_rgba(14,19,24,0.03)] transition focus:border-[#7D2AE8] focus:outline-none focus:ring-4 focus:ring-[#7D2AE8]/10',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
      />
    </div>
  );
}
