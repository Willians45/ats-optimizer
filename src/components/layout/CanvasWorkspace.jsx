import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FileText,
  Maximize2,
  Minus,
  Plus,
  ScanLine,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';
import CVPage from '../editor/CVPage';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import { useCvContext } from '../../context/CvContext';
import { getTemplate } from '../../theme/templates';

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.6;

function EmptyCanvas({ onOpenPanel }) {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <div className="relative w-full max-w-md">
        <div className="absolute -left-6 top-8 hidden h-40 w-32 rotate-[-8deg] rounded-lg border border-[#E5E7EB] bg-white/70 shadow-sm sm:block" />
        <div className="absolute -right-6 top-12 hidden h-40 w-32 rotate-[8deg] rounded-lg border border-[#E5E7EB] bg-white/70 shadow-sm sm:block" />

        <div className="relative rounded-3xl border border-[#E9EAEE] bg-white p-7 text-center shadow-[0_30px_80px_-40px_rgba(14,19,24,0.35)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient text-white shadow-[0_14px_30px_-12px_rgba(125,42,232,0.8)]">
            <FileText size={26} />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-[#0E1318]">
            Tu CV, listo para pasar el ATS
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-[#6B7280]">
            Sube tu CV actual, indica el cargo objetivo y la IA lo reescribirá en segundos. Después
            podrás editar cada palabra directamente sobre la hoja.
          </p>

          <div className="mt-5 grid gap-2 text-left">
            {[
              { icon: Target, text: 'Adaptado al cargo y a las keywords reales de la oferta.' },
              { icon: ScanLine, text: 'Formato de una columna, legible por cualquier ATS.' },
              { icon: Wand2, text: 'Editor inline: añade, borra y reordena sin formularios.' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2.5 rounded-xl bg-[#FAFAFB] px-3 py-2">
                <Icon size={15} className="mt-0.5 shrink-0 text-[#7D2AE8]" />
                <p className="text-[11.5px] leading-relaxed text-[#4B5563]">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button variant="gradient" size="lg" className="flex-1" onClick={() => onOpenPanel('content')}>
              <Sparkles size={16} /> Empezar con mi CV
            </Button>
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => onOpenPanel('design')}>
              Ver diseños
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

function initialZoom() {
  if (typeof window === 'undefined') return 0.82;
  const panels = 76 + 340 + (window.innerWidth >= 1024 ? 320 : 0);
  const available = window.innerWidth - panels - 96;
  return clampZoom(available / PAGE_WIDTH);
}

export default function CanvasWorkspace({ onOpenPanel }) {
  const { optimizedData, template, accent, language } = useCvContext();
  const [zoom, setZoom] = useState(initialZoom);
  const [pageHeight, setPageHeight] = useState(PAGE_HEIGHT);
  const pageRef = useRef(null);
  const viewportRef = useRef(null);
  const t = getTemplate(template);

  useEffect(() => {
    const node = pageRef.current;
    if (!node) return undefined;
    const update = () => setPageHeight(node.offsetHeight || PAGE_HEIGHT);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [optimizedData, template, language, accent]);

  const zoomBy = (delta) => setZoom((current) => clampZoom(current + delta));

  const fit = useCallback(() => {
    const width = viewportRef.current?.clientWidth || PAGE_WIDTH;
    const next = Math.min((width - 96) / PAGE_WIDTH, 1);
    setZoom(clampZoom(next));
  }, []);

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#ECECEE]">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-[#E1E2E6] bg-white/80 px-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10.5px] font-bold text-[#374151]">
            <FileText size={11} className="text-[#7D2AE8]" />
            {t.name}
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] sm:inline">
            A4 · 1 columna
          </span>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-[#E5E7EB] bg-white px-1 py-0.5 shadow-sm">
          <IconButton label="Alejar" size="sm" onClick={() => zoomBy(-0.08)} disabled={zoom <= MIN_ZOOM}>
            <Minus size={13} />
          </IconButton>
          <button
            type="button"
            onClick={() => setZoom(1)}
            title="Zoom al 100%"
            className="min-w-[42px] rounded-md px-1 text-[11px] font-bold text-[#374151] hover:text-[#6B21D6]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconButton label="Acercar" size="sm" onClick={() => zoomBy(0.08)} disabled={zoom >= MAX_ZOOM}>
            <Plus size={13} />
          </IconButton>
          <span className="mx-0.5 h-4 w-px bg-[#ECEEF2]" />
          <IconButton label="Ajustar a pantalla" size="sm" onClick={fit}>
            <Maximize2 size={13} />
          </IconButton>
        </div>
      </div>

      <div ref={viewportRef} className="canvas-grid canva-scroll relative flex-1 overflow-auto">
        {optimizedData ? (
          <div className="min-h-full w-full px-8 py-10">
            <div
              className="relative mx-auto shrink-0"
              style={{ width: PAGE_WIDTH * zoom, height: pageHeight * zoom }}
            >
              <div
                ref={pageRef}
                className="cv-print-area absolute left-0 top-0 origin-top-left"
                style={{
                  width: PAGE_WIDTH,
                  transform: `scale(${zoom})`,
                }}
              >
                <CVPage />
              </div>
            </div>
          </div>
        ) : (
          <EmptyCanvas onOpenPanel={onOpenPanel} />
        )}
      </div>

      {optimizedData ? (
        <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#0E1318]/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          Página 1 · A4
        </div>
      ) : null}
    </main>
  );
}
