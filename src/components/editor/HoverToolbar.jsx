import { cn } from '../../utils/cn';

export default function HoverToolbar({ children, className }) {
  return (
    <div
      className={cn(
        'absolute -top-3 right-0 z-20 flex items-center gap-0.5 rounded-lg border border-[#E5E7EB] bg-white p-0.5 opacity-0 shadow-[0_8px_20px_-8px_rgba(14,19,24,0.3)] transition group-hover/entry:opacity-100 group-focus-within/entry:opacity-100',
        className,
      )}
    >
      {children}
    </div>
  );
}
