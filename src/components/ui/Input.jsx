import { cn } from '../../utils/cn';

const BASE =
  'w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#0E1318] placeholder:text-[#9CA3AF] shadow-[0_1px_2px_rgba(14,19,24,0.03)] transition focus:border-[#7D2AE8] focus:outline-none focus:ring-4 focus:ring-[#7D2AE8]/10 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]';

export default function Input({ className, ...props }) {
  return <input className={cn(BASE, 'h-10', className)} {...props} />;
}
