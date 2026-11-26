import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Lightbulb,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import ScoreRing from '../ui/ScoreRing';
import { useAtsAnalysis } from '../../hooks/useAtsAnalysis';
import { useCvContext } from '../../context/CvContext';
import { cn } from '../../utils/cn';

const STATUS = {
  pass: { icon: CheckCircle2, className: 'text-[#16A34A]' },
  warn: { icon: AlertTriangle, className: 'text-[#D97706]' },
  fail: { icon: XCircle, className: 'text-[#DC2626]' },
};

function scoreLabel(score) {
  if (score >= 80) return 'Excelente';
  if (score >= 65) return 'Bueno';
  if (score >= 45) return 'Mejorable';
  return 'Bajo';
}

function Stat({ value, label }) {
  return (
    <div className="rounded-lg bg-[#FAFAFB] px-2 py-1.5 text-center">
      <p className="text-[13px] font-extrabold text-[#0E1318]">{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">{label}</p>
    </div>
  );
}

export default function AtsPanel() {
  const { optimizedData, context } = useCvContext();
  const analysis = useAtsAnalysis();

  if (!optimizedData) {
    return (
      <div className="rounded-xl border border-dashed border-[#D9DBE0] bg-[#FAFAFB] px-4 py-8 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4ECFF] text-[#7D2AE8]">
          <Gauge size={22} />
        </span>
        <p className="text-[12px] font-bold text-[#0E1318]">Aún no hay CV que analizar</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#6B7280]">
          Genera o carga un CV y aquí verás el score ATS, las keywords que faltan y qué mejorar.
        </p>
      </div>
    );
  }

  const { score, checks, found, missing, coverage, suggestions, stats } = analysis;
  const foundShown = found.slice(0, 10);
  const missingShown = missing.slice(0, 10);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[#E9EAEE] bg-gradient-to-br from-white to-[#FAF8FF] p-3.5">
        <div className="flex items-center gap-3">
          <ScoreRing score={score} size={88} stroke={8} label="ATS" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-extrabold text-[#0E1318]">{scoreLabel(score)}</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-[#6B7280]">
              {context.targetRole
                ? `Alineación con “${context.targetRole}”.`
                : 'Añade un cargo objetivo para afinar el análisis.'}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ECEEF2]">
                <div
                  className="h-full rounded-full bg-[#7D2AE8] transition-all duration-500"
                  style={{ width: `${Math.round(coverage * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#6B21D6]">
                {Math.round(coverage * 100)}% keywords
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <Stat value={stats.words} label="Palabras" />
          <Stat value={stats.bullets} label="Logros" />
          <Stat value={stats.quantified} label="Métricas" />
          <Stat value={stats.experience} label="Puestos" />
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target size={13} className="text-[#7D2AE8]" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
              Keywords
            </h3>
          </div>
          <span className="text-[10px] text-[#9CA3AF]">
            {found.length}/{analysis.keywords.length} presentes
          </span>
        </div>

        {!analysis.keywords.length ? (
          <p className="rounded-lg bg-[#FAFAFB] px-3 py-2 text-[11px] leading-relaxed text-[#6B7280]">
            Añade una oferta o un cargo objetivo para calcular keywords.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {foundShown.length ? (
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#15803D]">
                  Encontradas
                </p>
                <div className="flex flex-wrap gap-1">
                  {foundShown.map((keyword) => (
                    <span
                      key={`found_${keyword}`}
                      className="rounded-full bg-[#E9F9EF] px-2 py-0.5 text-[10.5px] font-semibold text-[#15803D]"
                    >
                      {keyword}
                    </span>
                  ))}
                  {found.length > foundShown.length ? (
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10.5px] font-semibold text-[#6B7280]">
                      +{found.length - foundShown.length}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {missingShown.length ? (
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#B45309]">
                  Faltantes
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingShown.map((keyword) => (
                    <span
                      key={`missing_${keyword}`}
                      className="rounded-full bg-[#FFF7E6] px-2 py-0.5 text-[10.5px] font-semibold text-[#B45309]"
                    >
                      {keyword}
                    </span>
                  ))}
                  {missing.length > missingShown.length ? (
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10.5px] font-semibold text-[#6B7280]">
                      +{missing.length - missingShown.length}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center gap-1.5">
          <Gauge size={13} className="text-[#7D2AE8]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
            Comprobaciones
          </h3>
        </div>
        <ul className="flex flex-col gap-1.5">
          {checks.map((check) => {
            const style = STATUS[check.status] || STATUS.warn;
            const Icon = style.icon;
            return (
              <li key={check.id} className="flex items-start gap-2 rounded-lg bg-[#FAFAFB] px-2.5 py-2">
                <Icon size={14} className={cn('mt-0.5 shrink-0', style.className)} />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold text-[#0E1318]">{check.label}</p>
                  <p className="text-[10.5px] leading-relaxed text-[#6B7280]">{check.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {suggestions.length ? (
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <Lightbulb size={13} className="text-[#D97706]" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
              Cómo subir el score
            </h3>
          </div>
          <ul className="flex flex-col gap-1.5">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion}_${index}`}
                className="flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-2 text-[11px] leading-relaxed text-[#92400E]"
              >
                <Sparkles size={12} className="mt-0.5 shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-[10px] leading-relaxed text-[#9CA3AF]">
        El score se calcula en tu navegador con reglas deterministas (keywords, formato, logros y
        métricas). No lo inventa la IA.
      </p>
    </div>
  );
}
