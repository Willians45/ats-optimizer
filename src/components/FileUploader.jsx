import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileType, Loader2 } from 'lucide-react';
import { extractTextFromPDF } from '../utils/pdfExtractor';
import { useCvContext } from '../context/CvContext';

export default function FileUploader() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setCvText } = useCvContext();
  const fileInputRef = useRef(null);

  const handleProcessFile = async (file) => {
    if (file && file.type === 'application/pdf') {
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);
        setCvText(text);
      } catch (err) {
        console.error("Error al leer el PDF", err);
        alert("Hubo un error extrayendo el texto del PDF.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Por favor, sube un archivo PDF.");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer?.files[0];
    if (file) handleProcessFile(file);
  }, []);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleProcessFile(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative overflow-hidden cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out p-8 flex flex-col items-center justify-center gap-4 text-center ${
          isDragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-800/80'
        }`}
      >
        <input 
          type="file" 
          accept=".pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleChange} 
        />
        
        {loading ? (
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        ) : isDragActive ? (
          <FileType className="w-10 h-10 text-blue-500" />
        ) : (
          <UploadCloud className="w-10 h-10 text-slate-400" />
        )}

        <div>
          <p className="text-sm font-medium text-slate-200">
            {loading ? "Procesando PDF..." : "Haz clic o arrastra un archivo PDF"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Recomendado para asegurar que extraigamos tu experiencia completa
          </p>
        </div>
      </div>
    </motion.div>
  );
}
