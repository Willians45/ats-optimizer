import { useCallback, useEffect, useState } from 'react';
import { getApiStatus } from '../services/gemini';
import { getUserApiKey, STORAGE_EVENTS } from '../utils/storage';

/**
 * Estado del proxy de Gemini: si el servidor tiene key configurada,
 * qué modelo usa y si el usuario tiene una key propia (BYOK).
 */
export function useApiStatus() {
  const [status, setStatus] = useState({
    loading: true,
    configured: false,
    defaultModel: '',
    allowedModels: [],
    hasUserKey: Boolean(getUserApiKey()),
    error: '',
  });

  const refresh = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true, hasUserKey: Boolean(getUserApiKey()) }));
    try {
      const data = await getApiStatus();
      setStatus({
        loading: false,
        configured: Boolean(data?.configured),
        defaultModel: data?.defaultModel || '',
        allowedModels: data?.allowedModels || [],
        hasUserKey: Boolean(getUserApiKey()),
        error: '',
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        hasUserKey: Boolean(getUserApiKey()),
        error: error?.message || 'No se pudo consultar el estado del proxy.',
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(STORAGE_EVENTS.keyChanged, onChange);
    return () => window.removeEventListener(STORAGE_EVENTS.keyChanged, onChange);
  }, [refresh]);

  return { ...status, refresh };
}
