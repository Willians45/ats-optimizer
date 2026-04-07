import { useState } from 'react';
import { useCvContext } from '../context/CvContext';
import FileUploader from './FileUploader';
import CVEditor from './CVEditor';
import { optimizeCV } from '../services/gemini';
import { Loader2 } from 'lucide-react';

export default function Editor() {
  const { 
    cvText, setCvText, 
    jobDescription, setJobDescription, 
    setOptimizedData,
    language
  } = useCvContext();
  
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'editor'

  const handleOptimize = async () => {
    if (!cvText) return alert("Sube o pega tu CV primero");
    setProcessing(true);
    try {
      const result = await optimizeCV(cvText, jobDescription, language);
      setOptimizedData(result);
      setActiveTab('editor');
    } catch (err) {
      alert(err.message || "Hubo un error optimizando el CV.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-700">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'input' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setActiveTab('input')}
          >
            Entrada de Datos
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'editor' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setActiveTab('editor')}
          >
            Editor ATS
          </button>
        </div>
        <button 
          onClick={handleOptimize}
          disabled={processing || !cvText}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          {processing && <Loader2 className="w-4 h-4 animate-spin" />}
          {processing ? 'Optimizando...' : 'Generar CV ATS'}
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'input' ? (
          <div className="flex flex-col gap-4 h-full">
            <FileUploader />
            <div className="flex flex-col flex-1 gap-2">
              <label className="text-sm font-medium text-slate-300">CV Extraído</label>
              <textarea 
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="flex-1 w-full min-h-[150px] bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
                placeholder="El texto de tu PDF aparecerá aquí, o puedes pegarlo de forma manual..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300">Descripción de Oferta (Opcional)</label>
              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-[120px] bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
                placeholder="Pega la oferta de empleo aquí para customizar las keywords enviadas a Gemini..."
              />
            </div>
          </div>
        ) : (
          <CVEditor />
        )}
      </div>
    </div>
  );
}
