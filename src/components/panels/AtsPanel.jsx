import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  Gauge,
  Lightbulb,
  Loader2,
  Search,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import Button from '../ui/Button';
import ScoreRing from '../ui/ScoreRing';
import { useApiStatus } from '../../hooks/useApiStatus';
import { useAtsAnalysis } from '../../hooks/useAtsAnalysis';
import { useJobSearch } from '../../hooks/useJobSearch';
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

function JobCard({ job }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-bold leading-snug text-[#0E1318]">{job.titulo}</p>
        {job.url ? <ExternalLink size={12} className="mt-0.5 shrink-0 text-[#9CA3AF]" /> : null}
      </div>
      {job.empresa || job.ubicacion ? (
        <p className="mt-0.5 text-[10.5px] text-[#6B7280]">
          {[job.empresa, job.ubicacion].filter(Boolean).join(' · ')}
        </p>
      ) : null}
      {job.motivo ? (
        <p className="mt-1 text-[10.5px] leading-relaxed text-[#4B5563]">{job.motivo}</p>
      ) : null}
      {job.fuente ? (
        <span className="mt-1.5 inline-flex rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[9.5px] font-semibold text-[#6B7280]">
          {job.fuente}
        </span>
      ) : null}
    </>
  );

  const className =
    'block rounded-xl border border-[#E9EAEE] bg-white px-2.5 py-2 transition hover:border-[#B79BF0] hover:bg-[#FCFAFF]';

  if (job.url) {
    return (
      <a href={job.url} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function AtsPanel({ onOpenSettings }) {
  const { optimizedData, context } = useCvContext();
  const analysis = useAtsAnalysis();
  const api = useApiStatus();
  const { search, loading: searching, error: searchError, result: jobResult } = useJobSearch();

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
  const canSearch = !api.loading && (api.configured || api.hasUserKey);

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

      <section className="rounded-2xl border border-[#E9EAEE] bg-white p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Briefcase size={13} className="text-[#7D2AE8]" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
              Buscar ofertas
            </h3>
          </div>
          <span className="rounded-full bg-[#F4ECFF] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#6B21D6]">
            Experimental
          </span>
        </div>
        <p className="mt-1 text-[10.5px] leading-relaxed text-[#6B7280]">
          Busca en Google ofertas de empleo reales que encajen con tu CV y tus keywords.
        </p>

        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={() => search(analysis.keywords)}
          disabled={searching || !canSearch}
        >
          {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {searching ? 'Buscando ofertas…' : 'Buscar trabajos para mi CV'}
        </Button>

        {!canSearch && !api.loading ? (
          <p className="mt-1.5 text-[10px] leading-relaxed text-[#A16207]">
            Sin API KEY configurada.{' '}
            <button
              type="button"
              onClick={onOpenSettings}
              className="font-bold underline underline-offset-2 hover:text-[#78350F]"
            >
              Abrir Ajustes
            </button>
          </p>
        ) : null}

        {searchError ? (
          <p className="mt-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-2 text-[10.5px] leading-relaxed text-[#B91C1C]">
            {searchError}
          </p>
        ) : null}

        {jobResult ? (
          jobResult.jobs.length ? (
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {jobResult.jobs.map((job, index) => (
                <li key={`${job.titulo}_${job.empresa}_${index}`}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 rounded-lg bg-[#FAFAFB] px-2.5 py-2 text-[10.5px] leading-relaxed text-[#6B7280]">
              No encontramos ofertas para este perfil. Prueba a añadir keywords o a cambiar el
              cargo objetivo.
            </p>
          )
        ) : null}

        {jobResult?.sources?.length ? (
          <details className="mt-2 rounded-lg bg-[#FAFAFB] px-2.5 py-2">
            <summary className="cursor-pointer text-[10px] font-semibold text-[#6B7280]">
              Fuentes consultadas ({jobResult.sources.length})
            </summary>
            <ul className="mt-1.5 flex flex-col gap-1">
              {jobResult.sources.slice(0, 8).map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-[10px] text-[#6B21D6] hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <p className="mt-2.5 flex items-start gap-1 text-[9.5px] leading-relaxed text-[#9CA3AF]">
          <FlaskConical size={11} className="mt-0.5 shrink-0" />
          Experimental: resultados de búsqueda web de Google. Pueden estar desactualizados o
          caducados; verifica siempre la oferta en la fuente original.
        </p>
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
