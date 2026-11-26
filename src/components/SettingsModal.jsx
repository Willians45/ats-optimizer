import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  Save,
  Server,
  Trash2,
} from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Select from './ui/Select';
import { useToast } from './ui/Toast';
import { getApiStatus, testApiKey } from '../services/gemini';
import {
  clearUserApiKey,
  getPreferredModel,
  getUserApiKey,
  maskApiKey,
  setPreferredModel,
  setUserApiKey,
} from '../utils/storage';
import { ALLOWED_MODELS, DEFAULT_MODEL, MODEL_SHORT_LABELS } from '../../shared/cvSchema.js';
import { cn } from '../utils/cn';

export default function SettingsModal({ isOpen, onClose }) {
  const toast = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [status, setStatus] = useState({ loading: true, data: null, error: '' });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const storedKey = getUserApiKey();

  const loadStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await getApiStatus();
      setStatus({ loading: false, data, error: '' });
      setModel((current) => {
        if (current) return current;
        return getPreferredModel() || data?.defaultModel || DEFAULT_MODEL;
      });
    } catch (error) {
      setStatus({
        loading: false,
        data: null,
        error: error?.message || 'No se pudo consultar el proxy.',
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setApiKey(getUserApiKey());
    setModel(getPreferredModel() || DEFAULT_MODEL);
    setResult(null);
    setShowKey(false);
    loadStatus();
  }, [isOpen, loadStatus]);

  useEffect(() => {
    const allowed = status.data?.allowedModels?.length
      ? status.data.allowedModels
      : ALLOWED_MODELS;
    setModel((current) => {
      if (allowed.includes(current)) return current;
      if (allowed.includes(DEFAULT_MODEL)) return DEFAULT_MODEL;
      return allowed[0] || DEFAULT_MODEL;
    });
  }, [status.data]);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      await testApiKey(apiKey.trim());
      setResult({ type: 'success', message: 'Conexión correcta. Gemini respondió bien.' });
      toast.success('La API key funciona correctamente.');
    } catch (error) {
      setResult({ type: 'error', message: error?.message || 'La conexión falló.' });
      toast.error(error?.message || 'La conexión falló.');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const clean = apiKey.trim();
    const hadKey = Boolean(getUserApiKey());
    setSaving(true);
    if (clean) {
      const saved = setUserApiKey(clean);
      if (!saved) {
        setSaving(false);
        toast.error('No se pudo guardar la key en este navegador.');
        return;
      }
    } else if (hadKey) {
      clearUserApiKey();
    }
    setPreferredModel(model);
    setSaving(false);
    toast.success(
      clean
        ? 'Ajustes guardados.'
        : hadKey
          ? 'API key eliminada de este navegador.'
          : 'Preferencias guardadas.',
    );
    loadStatus();
    onClose?.();
  };

  const handleDelete = () => {
    clearUserApiKey();
    setApiKey('');
    setResult(null);
    toast.info('API key propia eliminada de este navegador.');
    loadStatus();
  };

  const serverReady = Boolean(status.data?.configured);
  const usingByok = Boolean(storedKey);
  const ready = serverReady || usingByok;
  const models = status.data?.allowedModels?.length ? status.data.allowedModels : ALLOWED_MODELS;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Ajustes"
      description="Configura el modelo y el acceso a Gemini."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
          <Button
            variant="secondary"
            onClick={handleTest}
            disabled={testing}
            className="w-full sm:w-auto"
          >
            {testing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {testing ? 'Probando…' : 'Probar conexión'}
          </Button>
          <Button variant="gradient" onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            <Save size={15} /> Guardar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border p-3',
            ready ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-[#FECACA] bg-[#FEF2F2]',
          )}
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              ready ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]',
            )}
          >
            <Server size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-[12px] font-bold',
                ready ? 'text-[#166534]' : 'text-[#991B1B]',
              )}
            >
              {status.loading
                ? 'Comprobando el servicio…'
                : serverReady
                  ? 'Servicio configurado'
                  : usingByok
                    ? 'Usando tu API key (BYOK)'
                    : 'Sin API KEY configurada'}
            </p>
            {status.loading ? (
              <p
                className={cn(
                  'mt-0.5 text-[11px] leading-relaxed',
                  ready ? 'text-[#15803D]' : 'text-[#B91C1C]',
                )}
              >
                Consultando el estado del servicio.
              </p>
            ) : serverReady ? (
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#15803D]">
                Modelo: {status.data?.defaultModel || DEFAULT_MODEL}.
              </p>
            ) : usingByok ? (
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#15803D]">
                Key guardada en este navegador: {maskApiKey(storedKey)}.
              </p>
            ) : null}
            {status.error ? (
              <p className="mt-1 flex items-center gap-1 text-[10.5px] text-[#B45309]">
                <AlertCircle size={11} /> {status.error}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="gemini-key" className="flex items-center gap-1.5 text-[11px] font-bold text-[#374151]">
              <KeyRound size={13} className="text-[#7D2AE8]" /> Tu API key de Gemini
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#6B21D6] hover:text-[#7D2AE8]"
            >
              Obtener key <ExternalLink size={10} />
            </a>
          </div>
          <div className="relative">
            <input
              id="gemini-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="AIzaSy…"
              autoComplete="off"
              spellCheck={false}
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 pr-20 font-mono text-[12px] text-[#0E1318] shadow-[0_1px_2px_rgba(14,19,24,0.03)] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7D2AE8] focus:ring-4 focus:ring-[#7D2AE8]/10"
            />
            <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setShowKey((value) => !value)}
                className="rounded-md p-1.5 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#0E1318]"
                aria-label={showKey ? 'Ocultar key' : 'Mostrar key'}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {storedKey ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md p-1.5 text-[#B91C1C] transition hover:bg-[#FEF2F2]"
                  aria-label="Eliminar key guardada"
                  title="Eliminar key guardada"
                >
                  <Trash2 size={14} />
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-1 text-[10.5px] leading-relaxed text-[#9CA3AF]">
            Se guarda solo en este navegador.
          </p>
        </div>

        <div>
          <label htmlFor="gemini-model" className="mb-1.5 block text-[11px] font-bold text-[#374151]">
            Modelo preferido
          </label>
          <Select
            id="gemini-model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            {models.map((id) => (
              <option key={id} value={id}>
                {MODEL_SHORT_LABELS[id] || id}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-[10.5px] leading-relaxed text-[#9CA3AF]">
            Recomendado: {MODEL_SHORT_LABELS[DEFAULT_MODEL] || DEFAULT_MODEL}. El servidor valida
            que esté permitido.
          </p>
        </div>

        {result ? (
          <div
            className={cn(
              'flex items-start gap-2 rounded-xl border px-3 py-2 text-[11px] leading-relaxed',
              result.type === 'success'
                ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
                : 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]',
            )}
          >
            {result.type === 'success' ? (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
            )}
            {result.message}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
