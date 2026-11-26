import { cn } from '../../utils/cn';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4ECFF] text-[#7D2AE8]">
          <Icon size={26} />
        </div>
      ) : null}
      <h3 className="text-sm font-bold text-[#0E1318]">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#6B7280]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
