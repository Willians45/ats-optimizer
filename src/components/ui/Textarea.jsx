import { cn } from '../../utils/cn';

export default function Textarea({ className, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm leading-relaxed text-[#0E1318] placeholder:text-[#9CA3AF] shadow-[0_1px_2px_rgba(14,19,24,0.03)] transition focus:border-[#7D2AE8] focus:outline-none focus:ring-4 focus:ring-[#7D2AE8]/10',
        className,
      )}
      {...props}
    />
  );
}
