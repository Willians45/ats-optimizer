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
  const [errorCode, setErrorCode] = useState('');

  const generate = useCallback(
    async (options = {}) => {
      const sourceText = String(options.cvText ?? cvText ?? '');
      const requestContext = { ...context, ...(options.context || {}) };
      if (options.translateOnly) requestContext.translateOnly = true;
      const sourceJobDescription = options.jobDescription ?? jobDescription;
      const sourceJobImage = options.jobImage ?? jobImage;

      if (sourceText.trim().length < 30) {
        toast.error('Sube o pega tu CV actual antes de generar.');
        return false;
      }

      if (!options.skipRoleCheck && !requestContext.targetRole?.trim()) {
        toast.error('Indica el cargo objetivo (ej. Recepcionista) para que la IA adapte el CV.');
        return false;
      }

      setLoading(true);
      setError('');
      setErrorCode('');

      try {
        const result = await generateCv({
          cvText: sourceText,
          jobDescription: sourceJobDescription,
          jobImage: sourceJobImage,
          context: requestContext,
          model: options.model || getPreferredModel(),
        });

        const normalized = normalizeCvData(result?.data, {
          targetRole: requestContext.targetRole,
          language: requestContext.language,
        });

        const base = options.baseData;
        const next = base
          ? {
              ...normalized,
              meta: {
                ...normalized.meta,
                cargoObjetivo:
                  normalized.meta.cargoObjetivo || base.meta?.cargoObjetivo || '',
                ordenSecciones: base.meta?.ordenSecciones?.length
                  ? base.meta.ordenSecciones
                  : normalized.meta.ordenSecciones,
                secciones: {
                  ...normalized.meta.secciones,
                  ...(base.meta?.secciones || {}),
                },
              },
            }
          : normalized;

        setOptimizedData(next);
        toast.success(
          options.successMessage ||
            'CV optimizado. Ahora puedes editarlo directamente en el lienzo.',
        );
        return true;
      } catch (err) {
        const message =
          err?.message || 'No se pudo generar el CV. Revisa tu conexión e inténtalo de nuevo.';
        setError(message);
        setErrorCode(err?.code || '');
        toast.error(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cvText, jobDescription, jobImage, context, setOptimizedData, toast],
  );

  return { generate, loading, error, errorCode };
}
