import { useDroppable } from '@dnd-kit/core';
import type { CriterionCategory } from '../../domain/types';
import { CategoryIcon } from './iconRegistry';

interface FolderDropZoneProps {
  categoria: CriterionCategory;
}

export function FolderDropZone({ categoria }: FolderDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: categoria.id });

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-1 items-center justify-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors',
        isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/60',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-14 w-14 flex-none items-center justify-center rounded-full transition-colors',
          isOver ? 'bg-blue-100 text-blue-600' : 'bg-white text-blue-500 shadow-sm',
        ].join(' ')}
      >
        <CategoryIcon nombre={categoria.icono} size={24} />
      </div>
      <span className="text-base font-medium text-slate-700">{categoria.etiqueta}</span>
    </div>
  );
}
