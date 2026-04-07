import { useState } from 'react';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Preview from './Preview';
import SettingsModal from './SettingsModal';

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden text-slate-200">
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="flex-1 grid grid-cols-2 h-full overflow-hidden">
        <Editor />
        <Preview />
      </main>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
