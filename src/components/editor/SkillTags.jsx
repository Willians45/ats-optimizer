import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Editable from './Editable';
import { cn } from '../../utils/cn';

export default function SkillTags({
  label,
  skills = [],
  onAdd,
  onRemove,
  onRename,
  onFocus,
  onBlur,
  accent,
  className,
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim().replace(/,$/, '');
    if (!value) return;
    onAdd?.(value);
    setDraft('');
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {skills.map((skill, index) => (
          <span
            key={`${skill}_${index}`}
            className="group/skill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
            style={{ backgroundColor: accent?.soft || '#F4ECFF', color: accent?.value || '#6B21D6' }}
          >
            <Editable
              as="span"
              value={skill}
              onChange={(value) => onRename?.(index, value)}
              onFocus={onFocus}
              onBlur={onBlur}
              className="min-w-[1ch]"
            />
            <button
              type="button"
              onClick={() => onRemove?.(index)}
              className="opacity-0 transition group-hover/skill:opacity-70 hover:!opacity-100"
              aria-label={`Quitar ${skill}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#D1D5DB] px-1.5 py-0.5">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                add();
              }
            }}
            onBlur={add}
            placeholder="Añadir"
            className="h-5 w-16 bg-transparent px-1 text-[11px] text-[#374151] outline-none placeholder:text-[#9CA3AF]"
          />
          <button
            type="button"
            onClick={add}
            className="text-[#9CA3AF] transition hover:text-[#7D2AE8]"
            aria-label={`Añadir ${label}`}
          >
            <Plus size={11} />
          </button>
        </span>
      </div>
    </div>
  );
}
