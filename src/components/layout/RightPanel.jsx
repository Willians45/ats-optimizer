import { ArrowRight, Gauge, Info, Sparkles, X } from 'lucide-react';
import ScoreRing from '../ui/ScoreRing';
import DownloadButton from '../../pdf/DownloadButton';
import IconButton from '../ui/IconButton';
import { useCvContext } from '../../context/CvContext';
import { useAtsAnalysis } from '../../hooks/useAtsAnalysis';
import { getTemplate } from '../../theme/templates';
import { cn } from '../../utils/cn';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-[10.5px] font-semibold text-[#9CA3AF]">{label}</span>
      <span className="truncate text-[11px] font-bold text-[#374151]">{value}</span>
    </div>
  );
}

export default function RightPanel({ open, onClose, onOpenPanel }) {
  const { optimizedData, template, language, context } = useCvContext();
  const analysis = useAtsAnalysis();

  if (!open) return null;

  const t = getTemplate(template);
  const visibleSections = optimizedData
    ? Object.values(optimizedData.meta?.secciones || {}).filter(Boolean).length
    : 0;

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col border-l border-[#E9EAEE] bg-white lg:flex">
      <header className="flex items-center justify-between border-b border-[#F0F1F3] px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <Info size={14} className="text-[#7D2AE8]" />
          <h2 className="text-[12px] font-extrabold tracking-tight text-[#0E1318]">Inspector</h2>
        </div>
        <IconButton label="Cerrar inspector" size="sm" onClick={onClose}>
          <X size={15} />
        </IconButton>
      </header>

      <div className="canva-scroll flex-1 overflow-y-auto px-3.5 py-4">
        {!optimizedData ? (
          <div className="rounded-xl border border-dashed border-[#D9DBE0] bg-[#FAFAFB] px-4 py-8 text-center">
            <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4ECFF] text-[#7D2AE8]">
              <Sparkles size={20} />
            </span>
            <p className="text-[12px] font-bold text-[#0E1318]">Nada que inspeccionar aún</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#6B7280]">
              Genera tu CV para ver el score ATS, las keywords y los datos del documento.
            </p>
            <button
              type="button"
              onClick={() => onOpenPanel('content')}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#6B21D6] hover:text-[#7D2AE8]"
            >
              Ir a Contenido <ArrowRight size={12} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <section className="rounded-2xl border border-[#E9EAEE] bg-gradient-to-br from-white to-[#FAF8FF] p-3">
              <div className="flex items-center gap-3">
                <ScoreRing score={analysis.score} size={72} stroke={7} label="ATS" />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-extrabold text-[#0E1318]">
                    Score de compatibilidad
                  </p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B7280]">
                    {context.targetRole
                      ? `Cargo: ${context.targetRole}`
                      : 'Añade un cargo objetivo para afinar el score.'}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ECEEF2]">
                  <div
                    className="h-full rounded-full bg-[#7D2AE8] transition-all duration-500"
                    style={{ width: `${Math.round(analysis.coverage * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#6B21D6]">
                  {analysis.found.length}/{analysis.keywords.length} keywords
                </span>
              </div>
            </section>

            {analysis.missing.length ? (
              <section>
                <div className="mb-1.5 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#374151]">
                    Keywords faltantes
                  </h3>
                  <span className="text-[9.5px] text-[#9CA3AF]">{analysis.missing.length}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {analysis.missing.slice(0, 8).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-[#FFF7E6] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]"
                    >
                      {keyword}
                    </span>
                  ))}
                  {analysis.missing.length > 8 ? (
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                      +{analysis.missing.length - 8}
                    </span>
                  ) : null}
                </div>
              </section>
            ) : null}

            {analysis.suggestions.length ? (
              <section>
                <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#374151]">
                  Sugerencias
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                    <li
                      key={`${suggestion}_${index}`}
                      className="flex items-start gap-1.5 rounded-lg bg-[#FFFBEB] px-2.5 py-1.5 text-[10.5px] leading-relaxed text-[#92400E]"
                    >
                      <Sparkles size={11} className="mt-0.5 shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <button
              type="button"
              onClick={() => onOpenPanel('ats')}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#374151] transition',
                'hover:border-[#B79BF0] hover:text-[#6B21D6]',
              )}
            >
              <Gauge size={13} /> Ver análisis completo
            </button>

            <section className="rounded-xl bg-[#FAFAFB] px-3 py-1.5">
              <Row label="Plantilla" value={t.name} />
              <Row label="Idioma" value={language === 'en' ? 'English' : 'Español'} />
              <Row label="Palabras" value={analysis.stats.words} />
              <Row label="Secciones" value={visibleSections} />
              <Row label="Logros" value={analysis.stats.bullets} />
            </section>

            <DownloadButton variant="secondary" size="md" className="w-full" label="Descargar PDF" />
          </div>
        )}
      </div>
    </aside>
  );
}
