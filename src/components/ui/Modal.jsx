import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import IconButton from './IconButton';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0E1318]/50 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'modal-pop relative w-full overflow-hidden rounded-2xl border border-[#E9EAEE] bg-white shadow-[0_30px_80px_-20px_rgba(14,19,24,0.45)]',
          size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#F0F1F3] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#0E1318]">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{description}</p>
            ) : null}
          </div>
          <IconButton label="Cerrar" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="canva-scroll max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-[#F0F1F3] bg-[#FAFAFB] px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
