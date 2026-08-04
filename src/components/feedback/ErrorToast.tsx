import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorToastProps {
  /** Contador que se incrementa en cada intento fallido; 0 significa "sin mensaje". */
  trigger: number;
  onDismiss: () => void;
}

const DURACION_MS = 2500;

/**
 * El mensaje nunca debe revelar cuál era la carpeta correcta ni el criterio
 * vigente: solo informa que la clasificación fue errónea.
 */
export function ErrorToast({ trigger, onDismiss }: ErrorToastProps) {
  useEffect(() => {
    if (trigger === 0) return;
    const id = window.setTimeout(onDismiss, DURACION_MS);
    return () => window.clearTimeout(id);
  }, [trigger, onDismiss]);

  if (trigger === 0) return null;

  return (
    <div
      role="alert"
      className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center"
    >
      <div
        key={trigger}
        className="animate-toast-in pointer-events-auto flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
      >
        <AlertCircle size={18} className="flex-none text-red-400" />
        Mal clasificado
      </div>
    </div>
  );
}
