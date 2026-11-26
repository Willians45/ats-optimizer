import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  Languages,
  LayoutTemplate,
  Palette,
  Rows3,
} from 'lucide-react';
import { useCvContext } from '../../context/CvContext';
import { useCvMutations } from '../../hooks/useCvMutations';
import { ACCENTS, TEMPLATES, getAccent } from '../../theme/templates';
import { SECTION_LABELS, SECTION_ORDER } from '../../utils/cvData';
import { cn } from '../../utils/cn';

function TemplatePreview({ template, accent, selected }) {
  const a = getAccent(accent);
  const t = template.html;
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-white px-2.5 py-2 shadow-sm transition',
        selected ? 'border-[#7D2AE8] ring-2 ring-[#7D2AE8]/20' : 'border-[#E5E7EB]',
      )}
      style={{ fontFamily: t.fontFamily }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: a.value }} />
        <div className="h-1 w-6 rounded-full bg-[#E5E7EB]" />
      </div>
      <div className="mb-1 h-1 w-7 rounded-full" style={{ backgroundColor: a.value, opacity: 0.55 }} />
      <div className="space-y-1">
        <div className="h-[2px] w-full rounded-full" style={{ backgroundColor: a.value, opacity: 0.85 }} />
        <div className="h-[2px] w-11/12 rounded-full bg-[#E5E7EB]" />
        <div className="h-[2px] w-10/12 rounded-full bg-[#E5E7EB]" />
        <div className="mt-1.5 h-[2px] w-full rounded-full" style={{ backgroundColor: a.value, opacity: 0.85 }} />
        <div className="h-[2px] w-9/12 rounded-full bg-[#E5E7EB]" />
        <div className="h-[2px] w-11/12 rounded-full bg-[#E5E7EB]" />
      </div>
      {selected ? (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#7D2AE8] text-white">
          <Check size={10} />
        </span>
      ) : null}
    </div>
  );
}

export default function DesignPanel() {
  const {
    template,
    setTemplate,
    accent,
    setAccent,
    language,
    setLanguage,
    optimizedData,
  } = useCvContext();
  const m = useCvMutations();
  const labels = SECTION_LABELS[language] || SECTION_LABELS.es;
  const order = optimizedData?.meta?.ordenSecciones?.length
    ? optimizedData.meta.ordenSecciones
    : SECTION_ORDER;
  const visibility = optimizedData?.meta?.secciones || {};
  const disabled = !optimizedData;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-2 flex items-center gap-1.5">
          <LayoutTemplate size={13} className="text-[#7D2AE8]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
            Plantilla
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(TEMPLATES).map((item) => (
            <button key={item.id} type="button" onClick={() => setTemplate(item.id)} className="text-left">
              <TemplatePreview template={item} accent={accent} selected={template === item.id} />
              <p className="mt-1.5 text-[11px] font-bold text-[#0E1318]">{item.name}</p>
              <p className="text-[10px] leading-snug text-[#9CA3AF]">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-1.5">
          <Palette size={13} className="text-[#7D2AE8]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
            Color de acento
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(ACCENTS).map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.name}
              aria-label={item.name}
              onClick={() => setAccent(item.id)}
              className={cn(
                'relative h-8 w-8 rounded-full border-2 transition hover:scale-105',
                accent === item.id ? 'border-[#0E1318]' : 'border-transparent',
              )}
              style={{ backgroundColor: item.value }}
            >
              {accent === item.id ? (
                <Check
                  size={13}
                  className="absolute inset-0 m-auto text-white"
                  strokeWidth={3}
                />
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-1.5">
          <Languages size={13} className="text-[#7D2AE8]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
            Idioma del CV
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F3F4F6] p-1">
          {[
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setLanguage(item.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                language === item.value
                  ? 'bg-white text-[#0E1318] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#0E1318]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] leading-relaxed text-[#9CA3AF]">
          Cambia las etiquetas del documento. La IA traducirá el contenido si generas de nuevo.
        </p>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Rows3 size={13} className="text-[#7D2AE8]" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
              Secciones
            </h3>
          </div>
          <span className="text-[10px] text-[#9CA3AF]">Orden y visibilidad</span>
        </div>

        {disabled ? (
          <p className="rounded-lg bg-[#FAFAFB] px-3 py-2 text-[11px] leading-relaxed text-[#6B7280]">
            Genera tu CV para poder reordenar y ocultar secciones.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {order.map((key, index) => {
              const visible = visibility[key] !== false;
              return (
                <li
                  key={key}
                  className="flex items-center gap-1 rounded-lg border border-[#ECEEF2] bg-white px-2 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => m.toggleSection(key)}
                    className={cn(
                      'rounded-md p-1 transition',
                      visible
                        ? 'text-[#7D2AE8] hover:bg-[#F4ECFF]'
                        : 'text-[#9CA3AF] hover:bg-[#F3F4F6]',
                    )}
                    aria-label={visible ? `Ocultar ${labels[key]}` : `Mostrar ${labels[key]}`}
                  >
                    {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <span
                    className={cn(
                      'flex-1 truncate text-[11.5px] font-semibold',
                      visible ? 'text-[#0E1318]' : 'text-[#9CA3AF] line-through',
                    )}
                  >
                    {labels[key]}
                  </span>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => m.moveSection(key, -1)}
                    className="rounded-md p-1 text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:opacity-25"
                    aria-label="Subir sección"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={index === order.length - 1}
                    onClick={() => m.moveSection(key, 1)}
                    className="rounded-md p-1 text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:opacity-25"
                    aria-label="Bajar sección"
                  >
                    <ArrowDown size={12} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
