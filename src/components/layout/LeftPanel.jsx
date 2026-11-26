import { X } from 'lucide-react';
import ContentPanel from '../panels/ContentPanel';
import DesignPanel from '../panels/DesignPanel';
import AiPanel from '../panels/AiPanel';
import AtsPanel from '../panels/AtsPanel';
import IconButton from '../ui/IconButton';
import { cn } from '../../utils/cn';

const PANELS = {
  content: {
    title: 'Contenido',
    subtitle: 'Tu CV y el puesto al que apuntas',
    Component: ContentPanel,
  },
  design: {
    title: 'Diseño',
    subtitle: 'Plantilla, color y estructura',
    Component: DesignPanel,
  },
  ai: {
    title: 'Asistente IA',
    subtitle: 'Controla cómo se reescribe tu CV',
    Component: AiPanel,
  },
  ats: {
    title: 'Análisis ATS',
    subtitle: 'Score y keywords en tiempo real',
    Component: AtsPanel,
  },
};

export default function LeftPanel({ activePanel, onOpenSettings, onOpenPanel, open, onClose }) {
  const panel = PANELS[activePanel] || PANELS.content;
  const Component = panel.Component;

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-[#0E1318]/40 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}
      <aside
        aria-label={panel.title}
        className={cn(
          'flex w-[340px] shrink-0 flex-col border-r border-[#E9EAEE] bg-white',
          'fixed inset-y-0 left-0 z-40 w-[86vw] max-w-[360px] shadow-[0_0_60px_-12px_rgba(14,19,24,0.45)] transition-transform duration-200 ease-out',
          'lg:static lg:z-auto lg:w-[340px] lg:max-w-none lg:translate-x-0 lg:shadow-none lg:transition-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <header className="flex items-start justify-between gap-2 border-b border-[#F0F1F3] px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[13px] font-extrabold tracking-tight text-[#0E1318]">
              {panel.title}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#6B7280]">{panel.subtitle}</p>
          </div>
          <IconButton
            label="Cerrar panel"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X size={16} />
          </IconButton>
        </header>
        <div className="canva-scroll flex-1 overflow-y-auto px-4 py-4">
          <Component onOpenSettings={onOpenSettings} onOpenPanel={onOpenPanel} />
        </div>
      </aside>
    </>
  );
}
