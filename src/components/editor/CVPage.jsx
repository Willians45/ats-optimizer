import {
  ArrowDown,
  ArrowUp,
  Copy,
  EyeOff,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import Editable from './Editable';
import HoverToolbar from './HoverToolbar';
import SkillTags from './SkillTags';
import { useCvContext } from '../../context/CvContext';
import { useCvMutations } from '../../hooks/useCvMutations';
import {
  SECTION_LABELS,
  SECTION_ORDER,
  createAward,
  createCertification,
  createEducation,
  createExperience,
  createLanguage,
  createProject,
} from '../../utils/cvData';
import { getAccent, getTemplate } from '../../theme/templates';
import { cn } from '../../utils/cn';

function IconAction({ label, onClick, children, danger = false, disabled = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center rounded-md transition disabled:opacity-30',
        danger
          ? 'text-[#B91C1C] hover:bg-[#FEF2F2]'
          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0E1318]',
      )}
    >
      {children}
    </button>
  );
}

export default function CVPage() {
  const { optimizedData, beginEdit, endEdit, language, template, accent } = useCvContext();
  const m = useCvMutations();
  const t = getTemplate(template).html;
  const a = getAccent(accent);
  const data = optimizedData;
  const labels = SECTION_LABELS[language] || SECTION_LABELS.es;
  const order = data?.meta?.ordenSecciones?.length ? data.meta.ordenSecciones : SECTION_ORDER;
  const visibility = data?.meta?.secciones || {};

  if (!data) return null;

  const updatePersonal = (field, value) =>
    m.updatePersonal(field, value, { record: false });

  const updateSummary = (value) => m.updateSummary(value, { record: false });

  const updateItem = (section, id, patch) =>
    m.updateItem(section, id, patch, { record: false });

  const sectionHeadingStyle = {
    fontSize: t.headingSize,
    fontWeight: 700,
    textTransform: t.uppercaseHeadings ? 'uppercase' : 'none',
    letterSpacing: '0.08em',
    color: t.headingStyle === 'accent' ? a.value : '#111827',
    borderBottom: `1px solid ${t.headingStyle === 'accent' ? a.value : '#D1D5DB'}`,
    paddingBottom: 3,
    flex: 1,
    lineHeight: 1.2,
  };

  const bodySize = { fontSize: t.bodySize };
  const smallSize = { fontSize: Math.max(9, t.bodySize - 1), color: '#4B5563' };

  const hasContent = (key) => {
    if (key === 'perfilProfesional') return Boolean(data.perfilProfesional);
    if (key === 'habilidades') {
      return Boolean(
        (data.habilidades?.tecnicas || []).length || (data.habilidades?.blandas || []).length,
      );
    }
    return Boolean((data[key] || []).length);
  };

  const addEmpty = (key) => {
    if (key === 'experiencia') m.addItem('experiencia', createExperience());
    if (key === 'educacion') m.addItem('educacion', createEducation());
    if (key === 'proyectos') m.addItem('proyectos', createProject());
    if (key === 'certificaciones') m.addItem('certificaciones', createCertification());
    if (key === 'idiomas') m.addItem('idiomas', createLanguage());
    if (key === 'premios') m.addItem('premios', createAward());
    if (key === 'habilidades') m.addSkill('tecnicas', 'Nueva habilidad');
  };

  const Section = ({ section, children, addLabel }) => {
    if (visibility[section] === false) return null;
    return (
      <section className="group/section relative" style={{ marginBottom: t.sectionGap }}>
        <div className="mb-2 flex items-center gap-2">
          <h2 style={sectionHeadingStyle}>{labels[section]}</h2>
          <div className="flex items-center gap-0.5 opacity-0 transition group-hover/section:opacity-100 group-focus-within/section:opacity-100">
            {addLabel ? (
              <IconAction label={`Añadir ${addLabel}`} onClick={() => addEmpty(section)}>
                <Plus size={13} />
              </IconAction>
            ) : null}
            <IconAction
              label="Mover sección arriba"
              onClick={() => m.moveSection(section, -1)}
              disabled={order.indexOf(section) === 0}
            >
              <ArrowUp size={13} />
            </IconAction>
            <IconAction
              label="Mover sección abajo"
              onClick={() => m.moveSection(section, 1)}
              disabled={order.indexOf(section) === order.length - 1}
            >
              <ArrowDown size={13} />
            </IconAction>
            <IconAction label="Ocultar sección" onClick={() => m.toggleSection(section)}>
              <EyeOff size={13} />
            </IconAction>
          </div>
        </div>
        {children}
      </section>
    );
  };

  const EntryToolbar = ({ section, item }) => (
    <HoverToolbar>
      <IconAction label="Mover arriba" onClick={() => m.moveItem(section, item.id, -1)}>
        <ArrowUp size={13} />
      </IconAction>
      <IconAction label="Mover abajo" onClick={() => m.moveItem(section, item.id, 1)}>
        <ArrowDown size={13} />
      </IconAction>
      <IconAction label="Duplicar" onClick={() => m.duplicateItem(section, item.id)}>
        <Copy size={13} />
      </IconAction>
      <IconAction danger label="Eliminar" onClick={() => m.removeItem(section, item.id)}>
        <Trash2 size={13} />
      </IconAction>
    </HoverToolbar>
  );

  const renderExperience = () => {
    if (!(data.experiencia || []).length) return null;
    return (
      <Section section="experiencia" addLabel="experiencia">
        {data.experiencia.map((item) => (
          <div
            key={item.id}
            className="group/entry relative -mx-1 mb-4 rounded-md px-1 py-1 transition hover:bg-[#FAFAFB]"
          >
            <EntryToolbar section="experiencia" item={item} />
            <div className="flex items-baseline justify-between gap-3">
              <Editable
                value={item.cargo}
                placeholder="Cargo"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('experiencia', item.id, { cargo: value })}
                className="font-bold"
                style={{ ...bodySize, color: '#111827' }}
              />
              <Editable
                value={item.fechas}
                placeholder="Fechas"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('experiencia', item.id, { fechas: value })}
                className="shrink-0 text-right"
                style={smallSize}
              />
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <Editable
                value={item.empresa}
                placeholder="Empresa"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('experiencia', item.id, { empresa: value })}
                className="italic"
                style={{ ...bodySize, color: '#374151' }}
              />
              <Editable
                value={item.ubicacion}
                placeholder="Ubicación"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('experiencia', item.id, { ubicacion: value })}
                className="shrink-0 text-right"
                style={smallSize}
              />
            </div>

            <ul className="mt-1.5 space-y-0.5">
              {(item.logros || []).map((logro, index) => (
                <li key={`${item.id}_logro_${index}`} className="group/bullet flex items-start gap-1.5">
                  <span
                    className="mt-[0.58em] shrink-0 text-[0.62em] leading-none"
                    style={{ color: a.value }}
                  >
                    ●
                  </span>
                  <Editable
                    value={logro}
                    placeholder="Logro con verbo de acción y resultado"
                    onFocus={beginEdit}
                    onBlur={endEdit}
                    onChange={(value) =>
                      updateItem('experiencia', item.id, {
                        logros: (item.logros || []).map((entry, i) =>
                          i === index ? value : entry,
                        ),
                      })
                    }
                    className="flex-1"
                    style={bodySize}
                  />
                  <button
                    type="button"
                    aria-label="Quitar logro"
                    onClick={() =>
                      m.updateItem('experiencia', item.id, {
                        logros: (item.logros || []).filter((_, i) => i !== index),
                      })
                    }
                    className="mt-1 shrink-0 text-[#D1D5DB] opacity-0 transition hover:text-[#B91C1C] group-hover/bullet:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                m.updateItem('experiencia', item.id, {
                  logros: [...(item.logros || []), ''],
                })
              }
              className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[11px] font-semibold text-[#7D2AE8] transition hover:bg-[#F4ECFF]',
                (item.logros || []).length ? 'opacity-0 group-hover/entry:opacity-100' : 'opacity-100',
              )}
            >
              <Plus size={11} /> Añadir logro
            </button>
          </div>
        ))}
      </Section>
    );
  };

  const renderEducation = () => {
    if (!(data.educacion || []).length) return null;
    return (
      <Section section="educacion" addLabel="educación">
        {data.educacion.map((item) => (
          <div
            key={item.id}
            className="group/entry relative -mx-1 mb-3 rounded-md px-1 py-1 transition hover:bg-[#FAFAFB]"
          >
            <EntryToolbar section="educacion" item={item} />
            <div className="flex items-baseline justify-between gap-3">
              <Editable
                value={item.titulo}
                placeholder="Título"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('educacion', item.id, { titulo: value })}
                className="font-bold"
                style={bodySize}
              />
              <Editable
                value={item.fecha}
                placeholder="Fecha"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('educacion', item.id, { fecha: value })}
                className="shrink-0 text-right"
                style={smallSize}
              />
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <Editable
                value={item.institucion}
                placeholder="Institución"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('educacion', item.id, { institucion: value })}
                className="italic"
                style={{ ...bodySize, color: '#374151' }}
              />
              <Editable
                value={item.ubicacion}
                placeholder="Ubicación"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('educacion', item.id, { ubicacion: value })}
                className="shrink-0 text-right"
                style={smallSize}
              />
            </div>
            <Editable
              value={item.detalles}
              placeholder="Detalles opcionales"
              onFocus={beginEdit}
              onBlur={endEdit}
              onChange={(value) => updateItem('educacion', item.id, { detalles: value })}
              style={smallSize}
            />
          </div>
        ))}
      </Section>
    );
  };

  const renderProjects = () => {
    if (!(data.proyectos || []).length) return null;
    return (
      <Section section="proyectos" addLabel="proyecto">
        {data.proyectos.map((item) => (
          <div
            key={item.id}
            className="group/entry relative -mx-1 mb-3 rounded-md px-1 py-1 transition hover:bg-[#FAFAFB]"
          >
            <EntryToolbar section="proyectos" item={item} />
            <div className="flex items-baseline justify-between gap-3">
              <Editable
                value={item.nombre}
                placeholder="Nombre del proyecto"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('proyectos', item.id, { nombre: value })}
                className="font-bold"
                style={bodySize}
              />
              <Editable
                value={item.fechas}
                placeholder="Fechas"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('proyectos', item.id, { fechas: value })}
                className="shrink-0 text-right"
                style={smallSize}
              />
            </div>
            <Editable
              value={item.rol}
              placeholder="Tu rol"
              onFocus={beginEdit}
              onBlur={endEdit}
              onChange={(value) => updateItem('proyectos', item.id, { rol: value })}
              className="italic"
              style={{ ...bodySize, color: '#374151' }}
            />
            <Editable
              value={item.descripcion}
              placeholder="Descripción y resultado"
              multiline
              onFocus={beginEdit}
              onBlur={endEdit}
              onChange={(value) => updateItem('proyectos', item.id, { descripcion: value })}
              style={bodySize}
            />
            <Editable
              value={item.enlace}
              placeholder="Enlace"
              onFocus={beginEdit}
              onBlur={endEdit}
              onChange={(value) => updateItem('proyectos', item.id, { enlace: value })}
              style={{ ...smallSize, color: a.value }}
            />
          </div>
        ))}
      </Section>
    );
  };

  const renderCertifications = () => {
    if (!(data.certificaciones || []).length) return null;
    return (
      <Section section="certificaciones" addLabel="certificación">
        {data.certificaciones.map((item) => (
          <div
            key={item.id}
            className="group/entry relative -mx-1 mb-2 rounded-md px-1 py-1 transition hover:bg-[#FAFAFB]"
          >
            <EntryToolbar section="certificaciones" item={item} />
            <div className="flex items-baseline justify-between gap-3">
              <Editable
                value={item.nombre}
                placeholder="Nombre de la certificación"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('certificaciones', item.id, { nombre: value })}
                className="font-bold"
                style={bodySize}
              />
              <Editable
                value={item.fecha}
                placeholder="Fecha"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('certificaciones', item.id, { fecha: value })}
                className="shrink-0 text-right"
                style={smallSize}
              />
            </div>
            <Editable
              value={item.emisor}
              placeholder="Emisor"
              onFocus={beginEdit}
              onBlur={endEdit}
              onChange={(value) => updateItem('certificaciones', item.id, { emisor: value })}
              style={smallSize}
            />
          </div>
        ))}
      </Section>
    );
  };

  const renderLanguages = () => {
    if (!(data.idiomas || []).length) return null;
    return (
      <Section section="idiomas" addLabel="idioma">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {data.idiomas.map((item) => (
            <div
              key={item.id}
              className="group/entry relative flex items-baseline gap-2 rounded-md px-1 py-0.5 transition hover:bg-[#FAFAFB]"
            >
              <EntryToolbar section="idiomas" item={item} />
              <Editable
                value={item.idioma}
                placeholder="Idioma"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('idiomas', item.id, { idioma: value })}
                className="font-semibold"
                style={bodySize}
              />
              <Editable
                value={item.nivel}
                placeholder="Nivel"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('idiomas', item.id, { nivel: value })}
                style={smallSize}
              />
            </div>
          ))}
        </div>
      </Section>
    );
  };

  const renderAwards = () => {
    if (!(data.premios || []).length) return null;
    return (
      <Section section="premios" addLabel="premio">
        {data.premios.map((item) => (
          <div
            key={item.id}
            className="group/entry relative -mx-1 mb-2 rounded-md px-1 py-1 transition hover:bg-[#FAFAFB]"
          >
            <EntryToolbar section="premios" item={item} />
            <div className="flex items-baseline justify-between gap-3">
              <Editable
                value={item.titulo}
                placeholder="Premio"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('premios', item.id, { titulo: value })}
                className="font-bold"
                style={bodySize}
              />
              <Editable
                value={item.fecha}
                placeholder="Fecha"
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updateItem('premios', item.id, { fecha: value })}
                className="shrink-0 text-right"
                style={smallSize}
              />
            </div>
            <Editable
              value={item.emisor}
              placeholder="Emisor"
              onFocus={beginEdit}
              onBlur={endEdit}
              onChange={(value) => updateItem('premios', item.id, { emisor: value })}
              style={smallSize}
            />
          </div>
        ))}
      </Section>
    );
  };

  const renderSection = (key) => {
    if (key === 'perfilProfesional') {
      return (
        <Section key={key} section={key}>
          <Editable
            value={data.perfilProfesional}
            placeholder="Resumen profesional de 2-4 líneas orientado al cargo objetivo…"
            multiline
            onFocus={beginEdit}
            onBlur={endEdit}
            onChange={updateSummary}
            style={{ ...bodySize, color: '#1F2937' }}
          />
        </Section>
      );
    }
    if (key === 'experiencia') return <div key={key}>{renderExperience()}</div>;
    if (key === 'educacion') return <div key={key}>{renderEducation()}</div>;
    if (key === 'habilidades') {
      if (!hasContent('habilidades')) return null;
      return (
        <Section key={key} section={key}>
          <div className="flex flex-col gap-3">
            <SkillTags
              label="Técnicas"
              skills={data.habilidades?.tecnicas || []}
              accent={a}
              onAdd={(value) => m.addSkill('tecnicas', value)}
              onRemove={(index) => m.removeSkill('tecnicas', index)}
              onRename={(index, value) => m.renameSkill('tecnicas', index, value)}
              onFocus={beginEdit}
              onBlur={endEdit}
            />
            <SkillTags
              label="Blandas"
              skills={data.habilidades?.blandas || []}
              accent={a}
              onAdd={(value) => m.addSkill('blandas', value)}
              onRemove={(index) => m.removeSkill('blandas', index)}
              onRename={(index, value) => m.renameSkill('blandas', index, value)}
              onFocus={beginEdit}
              onBlur={endEdit}
            />
          </div>
        </Section>
      );
    }
    if (key === 'proyectos') return <div key={key}>{renderProjects()}</div>;
    if (key === 'certificaciones') return <div key={key}>{renderCertifications()}</div>;
    if (key === 'idiomas') return <div key={key}>{renderLanguages()}</div>;
    if (key === 'premios') return <div key={key}>{renderAwards()}</div>;
    return null;
  };

  const emptySections = order.filter(
    (key) => key !== 'perfilProfesional' && visibility[key] !== false && !hasContent(key),
  );

  const contactFields = [
    { field: 'email', placeholder: 'email@dominio.com' },
    { field: 'telefono', placeholder: 'Teléfono' },
    { field: 'ubicacion', placeholder: 'Ciudad, País' },
    { field: 'linkedin', placeholder: 'LinkedIn' },
    { field: 'portafolio', placeholder: 'Portafolio' },
  ];

  return (
    <div
      className="relative mx-auto bg-white text-[#111827] shadow-[0_18px_60px_-18px_rgba(14,19,24,0.28)]"
      style={{
        width: 794,
        minHeight: 1123,
        padding: t.padding,
        fontFamily: t.fontFamily,
        fontSize: t.bodySize,
        lineHeight: t.lineHeight,
        borderRadius: 2,
      }}
    >
      <header style={{ marginBottom: t.sectionGap }}>
        <Editable
          value={data.datosPersonales?.nombre || ''}
          placeholder="Tu nombre completo"
          onFocus={beginEdit}
          onBlur={endEdit}
          onChange={(value) => updatePersonal('nombre', value)}
          className="block font-extrabold tracking-tight"
          style={{ fontSize: t.nameSize, lineHeight: 1.08, color: a.value }}
        />
        <Editable
          value={data.datosPersonales?.headline || ''}
          placeholder="Cargo objetivo o titular profesional"
          onFocus={beginEdit}
          onBlur={endEdit}
          onChange={(value) => updatePersonal('headline', value)}
          className="mt-1 block font-bold uppercase"
          style={{ fontSize: t.headlineSize, letterSpacing: '0.08em', color: '#374151' }}
        />
        <div
          className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1"
          style={{ fontSize: Math.max(9.5, t.bodySize - 1), color: '#4B5563' }}
        >
          {contactFields.map(({ field, placeholder }, index) => (
            <span key={field} className="inline-flex items-center gap-2">
              {index > 0 ? <span className="text-[#D1D5DB]">|</span> : null}
              <Editable
                as="span"
                value={data.datosPersonales?.[field] || ''}
                placeholder={placeholder}
                onFocus={beginEdit}
                onBlur={endEdit}
                onChange={(value) => updatePersonal(field, value)}
              />
            </span>
          ))}
        </div>
      </header>

      {order.map((key) => renderSection(key))}

      {emptySections.length ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-dashed border-[#E5E7EB] pt-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">
            Añadir sección
          </span>
          {emptySections.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => addEmpty(key)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#D1D5DB] px-2.5 py-1 text-[11px] font-semibold text-[#6B7280] transition hover:border-[#7D2AE8] hover:bg-[#F4ECFF] hover:text-[#6B21D6]"
            >
              <Plus size={11} /> {labels[key]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
