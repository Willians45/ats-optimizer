import { Briefcase, Check, Sparkles } from 'lucide-react';
import { useCvContext } from '../../context/CvContext';
import { normalizeText } from '../../utils/keywords';
import { cn } from '../../utils/cn';

const SUGGESTED_ROLES = [
  'Recepcionista',
  'Desarrollador Frontend',
  'Asistente Administrativo',
  'Vendedor',
  'Analista de Datos',
  'Diseñador Gráfico',
  'Contador',
  'Enfermero/a',
];

export default function TargetRoleCard({ className }) {
  const { context, updateContext, optimizedData } = useCvContext();
  const targetRole = context.targetRole || '';
  const headline = optimizedData?.datosPersonales?.headline || '';
  const aligned =
    Boolean(targetRole && headline) &&
    normalizeText(headline).includes(normalizeText(targetRole));

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#E4D6FB] bg-gradient-to-br from-[#FBF7FF] via-white to-[#F2FBFB] p-4',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#7D2AE8]/10 blur-2xl" />

      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7D2AE8] text-white shadow-[0_6px_14px_-6px_rgba(125,42,232,0.9)]">
            <Briefcase size={14} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B21D6]">
              Cargo objetivo
            </p>
            <p className="text-[11px] text-[#6B7280]">La IA adapta todo el CV a este puesto.</p>
          </div>
        </div>
        {aligned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E9F9EF] px-2 py-1 text-[10px] font-bold text-[#15803D]">
            <Check size={11} /> Alineado
          </span>
        ) : null}
      </div>

      <div className="relative mt-3">
        <Sparkles
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7D2AE8]"
        />
        <input
          value={targetRole}
          onChange={(event) => updateContext({ targetRole: event.target.value })}
          placeholder="Ej. Recepcionista, Desarrollador Frontend…"
          className="h-11 w-full rounded-xl border border-[#DCCBF7] bg-white pl-9 pr-3 text-sm font-semibold text-[#0E1318] shadow-sm outline-none transition placeholder:font-normal placeholder:text-[#9CA3AF] focus:border-[#7D2AE8] focus:ring-4 focus:ring-[#7D2AE8]/10"
        />
      </div>

      <div className="relative mt-2.5 flex flex-wrap gap-1.5">
        {SUGGESTED_ROLES.map((role) => {
          const active = targetRole.trim().toLowerCase() === role.toLowerCase();
          return (
            <button
              key={role}
              type="button"
              onClick={() => updateContext({ targetRole: role })}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
                active
                  ? 'border-[#7D2AE8] bg-[#7D2AE8] text-white'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#B79BF0] hover:text-[#6B21D6]',
              )}
            >
              {role}
            </button>
          );
        })}
      </div>
    </div>
  );
}
