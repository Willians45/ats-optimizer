import ContentPanel from '../panels/ContentPanel';
import DesignPanel from '../panels/DesignPanel';
import AiPanel from '../panels/AiPanel';
import AtsPanel from '../panels/AtsPanel';

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

export default function LeftPanel({ activePanel, onOpenSettings, onOpenPanel }) {
  const panel = PANELS[activePanel] || PANELS.content;
  const Component = panel.Component;

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-r border-[#E9EAEE] bg-white">
      <header className="border-b border-[#F0F1F3] px-4 py-3">
        <h2 className="text-[13px] font-extrabold tracking-tight text-[#0E1318]">{panel.title}</h2>
        <p className="mt-0.5 text-[11px] text-[#6B7280]">{panel.subtitle}</p>
      </header>
      <div className="canva-scroll flex-1 overflow-y-auto px-4 py-4">
        <Component onOpenSettings={onOpenSettings} onOpenPanel={onOpenPanel} />
      </div>
    </aside>
  );
}
