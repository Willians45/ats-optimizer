import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, X, Save } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      onClose();
    } else {
      alert("Por favor ingresa una API Key válida.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ backgroundColor: '#1e293b' }}
            className="relative w-full max-w-md border border-slate-500 rounded-lg shadow-2xl overflow-hidden font-mono"
          >
            <div 
              style={{ backgroundColor: '#334155' }}
              className="flex items-center justify-between p-4 border-b border-slate-600"
            >
              <div className="flex items-center gap-2 text-white">
                <Key className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-lg tracking-tight">System_Config</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                &gt; Autenticación requerida para pipeline Gemini 1.5 Flash.
                <br/>
                &gt; Datos almacenados localmente en localStorage.
              </p>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="apiKey" className="text-[13px] font-bold text-slate-300 tracking-wider">
                    GEMINI_API_KEY
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-black border border-slate-700 px-4 py-3 rounded text-green-400 focus:outline-none focus:border-blue-500 font-mono text-sm placeholder-slate-700 shadow-inner"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors border border-blue-500 text-sm tracking-wide uppercase shadow"
                >
                  <Save className="w-4 h-4" />
                  [ GUARDAR EN DISCO ]
                </button>
              </div>
              <div className="mt-6 text-center">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
                >
                  &#8594; Obtener Token en Google AI Studio
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
