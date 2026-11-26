import { cn } from '../../utils/cn';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E9EAEE] bg-white p-4 shadow-[0_1px_2px_rgba(14,19,24,0.04)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
