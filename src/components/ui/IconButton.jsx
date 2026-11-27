import { cn } from '../../utils/cn';

const SIZES = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-9 w-9 rounded-xl',
  lg: 'h-10 w-10 rounded-xl',
};

export default function IconButton({
  className,
  size = 'md',
  active = false,
  danger = false,
  label,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D2AE8]/40 disabled:cursor-not-allowed disabled:opacity-40',
        danger
          ? 'text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]'
          : active
            ? 'bg-[#F4ECFF] text-[#7D2AE8]'
            : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0E1318]',
        SIZES[size] || SIZES.md,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
