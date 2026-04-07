import { Settings, FileText, Bot, Languages } from 'lucide-react';
import { useCvContext } from '../context/CvContext';

export default function Sidebar({ onOpenSettings }) {
  const { language, setLanguage } = useCvContext();

  return (
    <div className="w-64 h-full bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <Bot className="text-blue-400" />
        <h1 className="text-xl font-bold text-white">ATS Optimizer</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors">
          <FileText size={20} />
          <span>Editor</span>
        </button>
        
        <button 
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <Languages size={20} />
          <span>Idioma: {language === 'es' ? 'Español' : 'English'}</span>
        </button>

        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}
