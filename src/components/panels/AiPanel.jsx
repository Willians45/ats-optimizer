import { useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Loader2,
  Lightbulb,
  Sparkles,
  Wand2,
} from 'lucide-react';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { ALLOWED_MODELS, DEFAULT_MODEL, MODEL_LABELS } from '../../../shared/cvSchema.js';
import { useCvContext } from '../../context/CvContext';
import { useApiStatus } from '../../hooks/useApiStatus';
import { useGenerateCv } from '../../hooks/useGenerateCv';
import { getPreferredModel, setPreferredModel } from '../../utils/storage';
import { cn } from '../../utils/cn';

const TONES = [
  { value: 'professional', label: 'Profesional' },
  { value: 'direct', label: 'Directo' },
  { value: 'warm', label: 'Cercano' },
  { value: 'executive', label: 'Ejecutivo' },
];

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold text-[#374151]">{label}</span>
      {children}
      {hint ? <span className="text-[10px] leading-relaxed text-[#9CA3AF]">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  'h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-[12px] text-[#0E1318] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7D2AE8] focus:ring-4 focus:ring-[#7D2AE8]/10';

export default function AiPanel() {
  const { context, updateContext, optimizedData } = useCvContext();
  const api = useApiStatus();
  const { generate, loading, error } = useGenerateCv();
  const [model, setModel] = useState(() => getPreferredModel() || DEFAULT_MODEL);

  const suggestions = optimizedData?.meta?.sugerencias || [];
  const ready = api.configured || api.hasUserKey;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-[#E9EAEE] bg-gradient-to-br from-[#FBF7FF] to-white p-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-white">
            <Bot size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-[#0E1318]">Asistente de CV</p>
            <p className="text-[10.5px] text-[#6B7280]">Ajusta cómo escribe la IA.</p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold',
              ready ? 'bg-[#E9F9EF] text-[#15803D]' : 'bg-[#FEF2F2] text-[#B91C1C]',
            )}
          >
            {ready ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
            {ready ? 'Listo' : 'Sin key'}
          </span>
        </div>
        {!ready && !api.loading ? (
          <p className="mt-2 text-[10.5px] leading-relaxed text-[#A16207]">
            Configura la API key en Ajustes para usar el asistente.
          </p>
        ) : null}
      </div>

      <Field label="Modelo" hint="El modelo debe estar disponible en tu cuenta de Gemini.">
        <Select
          value={model}
          onChange={(event) => {
            setModel(event.target.value);
            setPreferredModel(event.target.value);
          }}
          className="h-9 rounded-lg text-[12px]"
        >
          {(api.allowedModels?.length ? api.allowedModels : ALLOWED_MODELS).map((id) => (
            <option key={id} value={id}>
              {MODEL_LABELS[id] || id}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Tono">
          <Select
            value={context.tone}
            onChange={(event) => updateContext({ tone: event.target.value })}
            className="h-9 rounded-lg text-[12px]"
          >
            {TONES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Máx. páginas">
          <Select
            value={context.maxPages}
            onChange={(event) => updateContext({ maxPages: Number(event.target.value) })}
            className="h-9 rounded-lg text-[12px]"
          >
            {[1, 2, 3].map((value) => (
              <option key={value} value={value}>
                {value} página{value > 1 ? 's' : ''}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Seniority">
          <input
            value={context.seniority}
            onChange={(event) => updateContext({ seniority: event.target.value })}
            placeholder="Junior, Senior…"
            className={inputClass}
          />
        </Field>
        <Field label="Empresa">
          <input
            value={context.company}
            onChange={(event) => updateContext({ company: event.target.value })}
            placeholder="Opcional"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Keywords obligatorias" hint="Sepáralas con comas.">
        <input
          value={context.mustInclude}
          onChange={(event) => updateContext({ mustInclude: event.target.value })}
          placeholder="Ej. SAP, atención al cliente"
          className={inputClass}
        />
      </Field>

      <Field label="Evitar" hint="Palabras o enfoques que no quieres incluir.">
        <input
          value={context.mustAvoid}
          onChange={(event) => updateContext({ mustAvoid: event.target.value })}
          placeholder="Ej. 'responsable de', jerga interna"
          className={inputClass}
        />
      </Field>

      <Field label="Instrucciones adicionales">
        <textarea
          value={context.customInstructions}
          onChange={(event) => updateContext({ customInstructions: event.target.value })}
          rows={3}
          placeholder="Ej. Enfatiza mi experiencia en atención al público y el manejo de caja."
          className="canva-scroll w-full resize-y rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-2 text-[12px] leading-relaxed text-[#0E1318] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7D2AE8] focus:ring-4 focus:ring-[#7D2AE8]/10"
        />
      </Field>

      {error ? (
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-2 text-[11px] leading-relaxed text-[#B91C1C]">
          {error}
        </div>
      ) : null}

      <Button variant="gradient" size="lg" className="w-full" onClick={generate} disabled={loading}>
        {loading ? <Loader2 size={17} className="animate-spin" /> : <Wand2 size={17} />}
        {loading ? 'Generando…' : 'Regenerar CV con IA'}
      </Button>

      {suggestions.length ? (
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <Lightbulb size={13} className="text-[#D97706]" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
              Sugerencias de la IA
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
    </div>
  );
}
