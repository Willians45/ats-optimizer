import { useCallback, useState } from 'react';
import { useCvContext } from '../context/CvContext';
import { useToast } from '../components/ui/Toast';
import { generateCv } from '../services/gemini';
import { normalizeCvData } from '../utils/cvData';
import { getPreferredModel } from '../utils/storage';

/**
 * Envuelve la llamada al proxy de Gemini y deja el CV normalizado en el
 * estado global. Centraliza validaciones, loading y errores para que
 * todos los paneles se comporten igual.
 */
export function useGenerateCv() {
  const {
    cvText,
    jobDescription,
    jobImage,
    context,
    setOptimizedData,
  } = useCvContext();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(async () => {
    if (!cvText || cvText.trim().length < 30) {
      toast.error('Sube o pega tu CV actual antes de generar.');
      return false;
    }

    if (!context.targetRole?.trim()) {
      toast.error('Indica el cargo objetivo (ej. Recepcionista) para que la IA adapte el CV.');
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const result = await generateCv({
        cvText,
        jobDescription,
        jobImage,
        context,
        model: getPreferredModel(),
      });

      const normalized = normalizeCvData(result?.data, {
        targetRole: context.targetRole,
        language: context.language,
      });

      setOptimizedData(normalized);
      toast.success('CV optimizado. Ahora puedes editarlo directamente en el lienzo.');
      return true;
    } catch (err) {
      const message =
        err?.message || 'No se pudo generar el CV. Revisa tu conexión e inténtalo de nuevo.';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cvText, jobDescription, jobImage, context, setOptimizedData, toast]);

  return { generate, loading, error };
}
