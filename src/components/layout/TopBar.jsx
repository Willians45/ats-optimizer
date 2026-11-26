import { Check, CloudUpload, PanelRight, Redo2, Settings, Sparkles, Undo2 } from 'lucide-react';
import IconButton from '../ui/IconButton';
import DownloadButton from '../../pdf/DownloadButton';
import { useCvContext } from '../../context/CvContext';
import { useAtsAnalysis } from '../../hooks/useAtsAnalysis';
import { cn } from '../../utils/cn';

function scoreTone(score) {
  if (score >= 75) return 'bg-[#E9F9EF] text-[#15803D] border-[#BBF7D0]';
  if (score >= 50) return 'bg-[#FFF7E6] text-[#B45309] border-[#FDE68A]';
  return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
}

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'TÚ';
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function TopBar({ onOpenSettings, rightOpen, onToggleRight, onOpenPanel }) {
  const {
    optimizedData,
    saveStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    context,
  } = useCvContext();
  const analysis = useAtsAnalysis();

  const name = optimizedData?.datosPersonales?.nombre || 'Nuevo CV';
  const headline =
    optimizedData?.datosPersonales?.headline ||
    context.targetRole ||
    'Sin cargo objetivo todavía';

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#E9EAEE] bg-white px-3">
      <div className="flex items-center gap-2.5 pl-0.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] brand-gradient text-white shadow-[0_6px_16px_-6px_rgba(125,42,232,0.9)]">
          <Sparkles size={16} strokeWidth={2.2} />
        </span>
        <div className="hidden leading-none sm:block">
          <p className="text-[13px] font-extrabold tracking-tight text-[#0E1318]">CV Studio</p>
          <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
            ATS ready
          </p>
        </div>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-[#ECEEF2] sm:block" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-bold text-[#0E1318]">{name}</p>
        <p className="truncate text-[10.5px] text-[#9CA3AF]">{headline}</p>
      </div>

      <div className="flex items-center gap-0.5">
        <IconButton label="Deshacer (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
          <Undo2 size={16} />
        </IconButton>
        <IconButton label="Rehacer (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo}>
          <Redo2 size={16} />
        </IconButton>
      </div>

      <div className="hidden items-center gap-1.5 rounded-full bg-[#F6F6F7] px-2.5 py-1 md:flex">
        {saveStatus === 'saving' ? (
          <>
            <CloudUpload size={12} className="text-[#9CA3AF]" />
            <span className="text-[10px] font-semibold text-[#9CA3AF]">Guardando…</span>
          </>
        ) : (
          <>
            <Check size={12} className="text-[#16A34A]" />
            <span className="text-[10px] font-semibold text-[#6B7280]">Guardado</span>
          </>
        )}
      </div>

      {optimizedData ? (
        <button
          type="button"
          onClick={() => onOpenPanel('ats')}
          title="Abrir análisis ATS"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold transition hover:brightness-[0.98]',
            scoreTone(analysis.score),
          )}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.08em] opacity-70">ATS</span>
          {analysis.score}
        </button>
      ) : null}

      <IconButton
        label={rightOpen ? 'Ocultar inspector' : 'Mostrar inspector'}
        onClick={onToggleRight}
        active={rightOpen}
        className="hidden lg:inline-flex"
      >
        <PanelRight size={16} />
      </IconButton>

      <DownloadButton size="sm" label="Descargar" />

      <IconButton label="Ajustes" onClick={onOpenSettings}>
        <Settings size={16} />
      </IconButton>

      <div
        title={name}
        className="ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0E1318] text-[10px] font-extrabold text-white"
      >
        {initials(optimizedData?.datosPersonales?.nombre)}
      </div>
    </header>
  );
}
