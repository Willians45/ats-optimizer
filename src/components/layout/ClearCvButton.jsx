import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { useCvContext } from '../../context/CvContext';
import { isClearWarningDismissed, setClearWarningDismissed } from '../../utils/storage';

export default function ClearCvButton() {
  const { optimizedData, cvText, jobDescription, clearWorkspace } = useCvContext();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [hideWarning, setHideWarning] = useState(false);

  const hasContent =
    Boolean(optimizedData) || Boolean(cvText.trim()) || Boolean(jobDescription.trim());

  const doClear = () => {
    clearWorkspace();
    setOpen(false);
    toast.info('CV borrado. Empieza de cero cuando quieras.');
  };

  const handleClick = () => {
    if (!hasContent) return;
    if (isClearWarningDismissed()) {
      doClear();
      return;
    }
    setHideWarning(false);
    setOpen(true);
  };

  const handleConfirm = () => {
    if (hideWarning) setClearWarningDismissed(true);
    doClear();
  };

  return (
    <>
      <IconButton
        label="Borrar CV"
        onClick={handleClick}
        disabled={!hasContent}
        danger
      >
        <Trash2 size={16} />
      </IconButton>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Borrar el CV"
        description="Se eliminarán el CV, el texto de origen y la oferta. El diseño se conserva."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirm}>
              <Trash2 size={15} /> Borrar CV
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[12px] leading-relaxed text-[#4B5563]">
            Esta acción no se puede deshacer. Si quieres empezar de cero, después podrás crear un
            CV en blanco desde <strong className="text-[#0E1318]">Contenido</strong>.
          </p>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAFB] px-3 py-2.5">
            <input
              type="checkbox"
              checked={hideWarning}
              onChange={(event) => setHideWarning(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#7D2AE8]"
            />
            <span className="text-[11px] leading-relaxed text-[#4B5563]">
              No volver a mostrar esta advertencia
            </span>
          </label>
        </div>
      </Modal>
    </>
  );
}
