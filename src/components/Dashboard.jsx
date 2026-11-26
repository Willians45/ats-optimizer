import { useCallback, useEffect, useState } from 'react';
import TopBar from './layout/TopBar';
import LeftRail from './layout/LeftRail';
import LeftPanel from './layout/LeftPanel';
import MobileTabBar from './layout/MobileTabBar';
import CanvasWorkspace from './layout/CanvasWorkspace';
import RightPanel from './layout/RightPanel';
import SettingsModal from './SettingsModal';
import { useCvContext } from '../context/CvContext';

export default function Dashboard() {
  const { undo, redo } = useCvContext();
  const [activePanel, setActivePanel] = useState('content');
  const [rightOpen, setRightOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const openPanel = useCallback((panel) => {
    setActivePanel(panel);
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      setMobilePanelOpen(true);
    }
  }, []);

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
    <div className="app-shell flex w-full flex-col overflow-hidden bg-[#F6F6F7] text-[#0E1318]">
      <TopBar
        onOpenSettings={() => setSettingsOpen(true)}
        rightOpen={rightOpen}
        onToggleRight={() => setRightOpen((value) => !value)}
        onOpenPanel={openPanel}
      />

      <div className="flex min-h-0 flex-1">
        <LeftRail
          activePanel={activePanel}
          onChange={openPanel}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <LeftPanel
          activePanel={activePanel}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPanel={openPanel}
          open={mobilePanelOpen}
          onClose={() => setMobilePanelOpen(false)}
        />
        <CanvasWorkspace onOpenPanel={openPanel} />
        <RightPanel
          open={rightOpen}
          onClose={() => setRightOpen(false)}
          onOpenPanel={openPanel}
        />
      </div>

      <MobileTabBar activePanel={activePanel} onSelect={openPanel} />

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
