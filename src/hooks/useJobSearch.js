import { useCallback, useState } from 'react';
import { useCvContext } from '../context/CvContext';
import { useToast } from '../components/ui/Toast';
import { searchJobs } from '../services/gemini';
import { getPreferredModel } from '../utils/storage';

/**
 * Búsqueda experimental de ofertas con Google Search a través del proxy de
 * Gemini. No guarda resultados en localStorage.
 */
export function useJobSearch() {
  const { optimizedData, context } = useCvContext();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const search = useCallback(
    async (keywords = []) => {
      if (!optimizedData) {
        toast.info('Necesitas un CV para buscar ofertas.');
        return false;
      }

      setLoading(true);
      setError('');

      try {
        const payload = await searchJobs({
          targetRole: context.targetRole || '',
          headline: optimizedData.datosPersonales?.headline || '',
          keywords: (Array.isArray(keywords) ? keywords : []).slice(0, 15),
          location: optimizedData.datosPersonales?.ubicacion || '',
          summary: optimizedData.perfilProfesional || '',
          language: context.language,
          model: getPreferredModel(),
        });

        const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
        setResult({
          jobs,
          sources: Array.isArray(payload?.sources) ? payload.sources : [],
          queries: Array.isArray(payload?.queries) ? payload.queries : [],
        });

        if (!jobs.length) {
          toast.info('No encontramos ofertas que encajen con este CV. Prueba a añadir keywords.');
        }
        return true;
      } catch (err) {
        const message =
          err?.message || 'No se pudo completar la búsqueda de empleo. Inténtalo de nuevo.';
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [optimizedData, context.targetRole, context.language, toast],
  );

  return { search, loading, error, result };
}
