import { cn } from '../../utils/cn';

const VARIANTS = {
  primary:
    'bg-[#7D2AE8] text-white shadow-[0_8px_20px_-8px_rgba(125,42,232,0.7)] hover:bg-[#6B21D6] active:bg-[#5B1BB8]',
  gradient:
    'bg-gradient-to-r from-[#7D2AE8] via-[#8B3DFF] to-[#00C4CC] text-white shadow-[0_10px_24px_-10px_rgba(125,42,232,0.8)] hover:brightness-[1.04] active:brightness-95',
  secondary:
    'bg-white text-[#0E1318] border border-[#E5E7EB] shadow-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB]',
  ghost: 'bg-transparent text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0E1318]',
  danger: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] hover:bg-[#FEE2E2]',
  dark: 'bg-[#0E1318] text-white hover:bg-[#1F2937]',
};

const SIZES = {
  xs: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  sm: 'h-9 px-3.5 text-[13px] gap-2 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-5 text-sm gap-2.5 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D2AE8]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
