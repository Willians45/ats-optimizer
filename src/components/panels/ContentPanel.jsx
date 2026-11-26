import { useRef, useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import Button from '../ui/Button';
import Dropzone from './Dropzone';
import TargetRoleCard from './TargetRoleCard';
import { useCvContext } from '../../context/CvContext';
import { useApiStatus } from '../../hooks/useApiStatus';
import { useGenerateCv } from '../../hooks/useGenerateCv';
import { useToast } from '../ui/Toast';
import { extractTextFromPDF } from '../../utils/pdfExtractor';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}

function SectionTitle({ icon: Icon, title, hint, action }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="text-[#7D2AE8]" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#374151]">
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        {hint ? <span className="text-[10px] text-[#9CA3AF]">{hint}</span> : null}
        {action}
      </div>
    </div>
  );
}

export default function ContentPanel({ onOpenSettings, onOpenPanel }) {
  const {
    cvText,
    setCvText,
    jobDescription,
    setJobDescription,
    jobImage,
    setJobImage,
    optimizedData,
  } = useCvContext();
  const { generate, loading, error } = useGenerateCv();
  const api = useApiStatus();
  const toast = useToast();
  const [extracting, setExtracting] = useState(false);
  const imageInputRef = useRef(null);

  const handleCvFile = async (file) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      toast.error('Sube un PDF. Si es una imagen, pega el texto manualmente.');
      return;
    }
    setExtracting(true);
    try {
      const buffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(buffer);
      setCvText(text);
      toast.success(`CV leído: ${text.length.toLocaleString('es')} caracteres.`);
    } catch (err) {
      toast.error(err?.message || 'No se pudo leer el PDF. Pega el texto manualmente.');
    } finally {
      setExtracting(false);
    }
  };

  const handleJobImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('La captura de la oferta debe ser una imagen (PNG/JPG).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Usa una captura de menos de 3 MB.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const base64 = dataUrl.split(',')[1] || '';
      setJobImage({
        data: base64,
        mimeType: file.type,
        name: file.name,
        preview: dataUrl,
      });
      toast.success('Captura de la oferta añadida.');
    } catch (err) {
      toast.error(err?.message || 'No se pudo cargar la imagen.');
    }
  };

  const needsKey = !api.loading && !api.configured && !api.hasUserKey;

  return (
    <div className="flex flex-col gap-5">
      <TargetRoleCard />

      {needsKey ? (
        <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#B45309]" />
            <div>
              <p className="text-[12px] font-semibold text-[#92400E]">Falta la API key</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#A16207]">
                El servidor no tiene <code className="font-mono">GEMINI_API_KEY</code>. Puedes
                añadir tu propia key en Ajustes para usar la IA.
              </p>
              <button
                type="button"
                onClick={onOpenSettings}
                className="mt-1.5 text-[11px] font-bold text-[#92400E] underline underline-offset-2 hover:text-[#78350F]"
              >
                Abrir Ajustes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section>
        <SectionTitle
          icon={FileText}
          title="Tu CV actual"
          hint={`${cvText.trim().length.toLocaleString('es')} caracteres`}
          action={
            cvText ? (
              <button
                type="button"
                onClick={() => setCvText('')}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#9CA3AF] transition hover:text-[#B91C1C]"
              >
                <Trash2 size={11} /> Limpiar
              </button>
            ) : null
          }
        />

        <Dropzone
          onFile={handleCvFile}
          loading={extracting}
          accept=".pdf,application/pdf"
          title="Arrastra tu CV en PDF"
          hint="Extraemos el texto y reconstruimos las líneas automáticamente."
          className="mb-2"
        />

        <textarea
          value={cvText}
          onChange={(event) => setCvText(event.target.value)}
          rows={7}
          placeholder="…o pega aquí el texto de tu CV. Incluye experiencia, educación y habilidades."
          className="canva-scroll w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[12px] leading-relaxed text-[#0E1318] shadow-[0_1px_2px_rgba(14,19,24,0.03)] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7D2AE8] focus:ring-4 focus:ring-[#7D2AE8]/10"
        />
      </section>

      <section>
        <SectionTitle
          icon={Sparkles}
          title="Oferta de trabajo"
          hint="Opcional · mejora el match"
        />

        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          rows={5}
          placeholder="Pega aquí la descripción del puesto. Extraeremos requisitos y keywords reales."
          className="canva-scroll w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[12px] leading-relaxed text-[#0E1318] shadow-[0_1px_2px_rgba(14,19,24,0.03)] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7D2AE8] focus:ring-4 focus:ring-[#7D2AE8]/10"
        />

        <div className="mt-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              handleJobImage(event.target.files?.[0]);
              event.target.value = '';
            }}
          />

          {jobImage ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white p-2">
              {jobImage.preview ? (
                <img
                  src={jobImage.preview}
                  alt="Captura de la oferta"
                  className="h-10 w-10 rounded-lg border border-[#E5E7EB] object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F4ECFF] text-[#7D2AE8]">
                  <ImageIcon size={16} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-[#0E1318]">
                  {jobImage.name || 'Captura de la oferta'}
                </p>
                <p className="text-[10px] text-[#6B7280]">La IA leerá la imagen junto al CV.</p>
              </div>
              <button
                type="button"
                onClick={() => setJobImage(null)}
                className="rounded-md p-1 text-[#9CA3AF] transition hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                aria-label="Quitar captura"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#D1D5DB] px-2.5 py-1.5 text-[11px] font-semibold text-[#6B7280] transition hover:border-[#B79BF0] hover:text-[#6B21D6]"
            >
              <ImageIcon size={13} /> Añadir captura de la oferta
            </button>
          )}
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[11px] leading-relaxed text-[#B91C1C]">
          {error}
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-1 border-t border-[#ECEEF2] bg-white/95 px-1 pb-1 pt-3 backdrop-blur">
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={generate}
          disabled={loading || !cvText.trim()}
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Wand2 size={17} />}
          {loading ? 'Optimizando con IA…' : optimizedData ? 'Regenerar CV' : 'Generar CV ATS'}
        </Button>
        <p className="mt-1.5 text-center text-[10px] leading-relaxed text-[#9CA3AF]">
          {optimizedData
            ? 'Se reemplazará la versión actual. Puedes deshacer con Ctrl+Z.'
            : 'Tarda unos segundos. Después podrás editar todo sobre el lienzo.'}
        </p>
      </div>

      {optimizedData ? (
        <button
          type="button"
          onClick={() => onOpenPanel?.('ats')}
          className="text-left text-[11px] font-semibold text-[#6B21D6] underline underline-offset-2 hover:text-[#7D2AE8]"
        >
          Ver análisis ATS del CV generado →
        </button>
      ) : null}
    </div>
  );
}
