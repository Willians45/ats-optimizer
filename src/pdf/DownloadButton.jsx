import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCvContext } from '../context/CvContext';
import { useToast } from '../components/ui/Toast';

function buildFileName(data) {
  const name = data?.datosPersonales?.nombre || 'CV';
  const role = data?.datosPersonales?.headline || data?.meta?.cargoObjetivo || 'ATS';
  const base = `${name}-${role}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${base || 'CV-ATS'}.pdf`;
}

export default function DownloadButton({
  variant = 'gradient',
  size = 'md',
  className,
  label = 'Descargar PDF',
}) {
  const { optimizedData, template, accent, language } = useCvContext();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    if (!optimizedData) {
      toast.info('Genera o carga un CV antes de descargar.');
      return;
    }
    setLoading(true);
    try {
      const [{ pdf }, { default: CVDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./CVDocument'),
      ]);
      const blob = await pdf(
        <CVDocument
          data={optimizedData}
          template={template}
          accent={accent}
          language={language}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = buildFileName(optimizedData);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast.success('PDF descargado. Ya puedes postularte.');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo generar el PDF. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={loading || !optimizedData}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {loading ? 'Generando…' : label}
    </Button>
  );
}
