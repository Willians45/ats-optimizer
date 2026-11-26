import { cn } from '../../utils/cn';

const VARIANTS = {
  neutral: 'bg-[#F3F4F6] text-[#4B5563]',
  purple: 'bg-[#F4ECFF] text-[#6B21D6]',
  teal: 'bg-[#E6FAFA] text-[#00838A]',
  green: 'bg-[#E9F9EF] text-[#15803D]',
  amber: 'bg-[#FFF7E6] text-[#B45309]',
  red: 'bg-[#FEF2F2] text-[#B91C1C]',
  blue: 'bg-[#EAF1FF] text-[#1D4ED8]',
};

export default function Badge({ variant = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        VARIANTS[variant] || VARIANTS.neutral,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
