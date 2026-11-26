import { useEffect, useState } from 'react';
import TopBar from './layout/TopBar';
import LeftRail from './layout/LeftRail';
import LeftPanel from './layout/LeftPanel';
import CanvasWorkspace from './layout/CanvasWorkspace';
import RightPanel from './layout/RightPanel';
import SettingsModal from './SettingsModal';
import { useCvContext } from '../context/CvContext';

export default function Dashboard() {
  const { undo, redo } = useCvContext();
  const [activePanel, setActivePanel] = useState('content');
  const [rightOpen, setRightOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      const target = event.target;
      const tag = target?.tagName;
      // Deja que el navegador gestione el deshacer nativo mientras se escribe.
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (key === 'y') {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#F6F6F7] text-[#0E1318]">
      <TopBar
        onOpenSettings={() => setSettingsOpen(true)}
        rightOpen={rightOpen}
        onToggleRight={() => setRightOpen((value) => !value)}
        onOpenPanel={setActivePanel}
      />

      <div className="flex min-h-0 flex-1">
        <LeftRail
          activePanel={activePanel}
          onChange={setActivePanel}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <LeftPanel
          activePanel={activePanel}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPanel={setActivePanel}
        />
        <CanvasWorkspace onOpenPanel={setActivePanel} />
        <RightPanel
          open={rightOpen}
          onClose={() => setRightOpen(false)}
          onOpenPanel={setActivePanel}
        />
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
