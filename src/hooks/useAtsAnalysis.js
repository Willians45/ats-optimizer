import { useMemo } from 'react';
import { useCvContext } from '../context/CvContext';
import { analyzeAts } from '../services/ats';

/**
 * Calcula el score ATS de forma determinista a partir del CV actual,
 * la oferta y el cargo objetivo. No llama a la IA.
 */
export function useAtsAnalysis() {
  const { optimizedData, jobDescription, context } = useCvContext();

  return useMemo(
    () =>
      analyzeAts(optimizedData, {
        jobDescription,
        targetRole: context.targetRole,
        language: context.language,
      }),
    [optimizedData, jobDescription, context.targetRole, context.language],
  );
}
