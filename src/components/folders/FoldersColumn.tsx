import { FolderClosed } from 'lucide-react';
import { getCriterio } from '../../config/criteria.config';
import type { CriterionId } from '../../domain/types';
import { CriterionTabs } from './CriterionTabs';
import { FolderDropZone } from './FolderDropZone';

interface FoldersColumnProps {
  pestanaActiva: CriterionId;
  onCambiarPestana: (id: CriterionId) => void;
  /** Carpeta destino del último drop incorrecto vigente, o null si no hay ninguno. */
  errorCarpetaId: string | null;
}

export function FoldersColumn({
  pestanaActiva,
  onCambiarPestana,
  errorCarpetaId,
}: FoldersColumnProps) {
  const criterio = getCriterio(pestanaActiva);

  return (
    <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-none items-center gap-2 border-b border-slate-200 px-4 py-3">
        <FolderClosed size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-900">Carpetas</h2>
      </header>

      <div className="flex-none p-3 pb-0">
        <CriterionTabs activo={pestanaActiva} onChange={onCambiarPestana} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
        <div className="flex min-h-full flex-col gap-3">
          {criterio.categorias.map((categoria) => (
            <FolderDropZone
              key={categoria.id}
              categoria={categoria}
              enError={categoria.id === errorCarpetaId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
