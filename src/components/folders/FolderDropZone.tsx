import { useDroppable } from '@dnd-kit/core';
import type { CriterionCategory } from '../../domain/types';
import { CategoryIcon } from './iconRegistry';

interface FolderDropZoneProps {
  categoria: CriterionCategory;
  /** true si esta carpeta puntual es el destino vigente de un drop incorrecto. */
  enError: boolean;
}

export function FolderDropZone({ categoria, enError }: FolderDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: categoria.id });

  const estado = enError ? 'error' : isOver ? 'over' : 'idle';

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-1 items-center justify-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors',
        estado === 'error' && 'border-red-400 bg-red-50',
        estado === 'over' && 'border-blue-500 bg-blue-50',
        estado === 'idle' && 'border-slate-200 bg-slate-50/60',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'flex h-14 w-14 flex-none items-center justify-center rounded-full transition-colors',
          estado === 'error' && 'bg-red-100 text-red-600',
          estado === 'over' && 'bg-blue-100 text-blue-600',
          estado === 'idle' && 'bg-white text-blue-500 shadow-sm',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <CategoryIcon nombre={categoria.icono} size={24} />
      </div>
      <span className="text-base font-medium text-slate-700">{categoria.etiqueta}</span>
    </div>
  );
}
