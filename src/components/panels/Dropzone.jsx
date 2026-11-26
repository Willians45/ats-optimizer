import { useRef, useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Dropzone({
  accept = '.pdf',
  onFile,
  loading = false,
  title = 'Haz clic o arrastra un archivo',
  hint = '',
  icon: Icon = UploadCloud,
  className,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    onFile?.(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !loading && inputRef.current?.click()}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !loading) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer?.files);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition',
        dragging
          ? 'border-[#7D2AE8] bg-[#F4ECFF]'
          : 'border-[#D9DBE0] bg-[#FAFAFB] hover:border-[#B79BF0] hover:bg-[#FCFAFF]',
        loading && 'cursor-wait opacity-80',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl',
          dragging ? 'bg-[#7D2AE8] text-white' : 'bg-white text-[#7D2AE8] shadow-sm',
        )}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
      </div>
      <div>
        <p className="text-xs font-semibold text-[#0E1318]">
          {loading ? 'Procesando archivo…' : title}
        </p>
        {hint ? <p className="mt-0.5 text-[11px] leading-relaxed text-[#6B7280]">{hint}</p> : null}
      </div>
    </div>
  );
}
