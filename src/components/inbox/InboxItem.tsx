import { useDraggable } from '@dnd-kit/core';
import { CheckCircle2 } from 'lucide-react';
import type { InboxItemState } from '../../engine/useEmailQueue';

interface InboxItemProps {
  item: InboxItemState;
  seleccionado: boolean;
  recienClasificado: boolean;
  onAbrir: (id: string) => void;
}

export function InboxItem({ item, seleccionado, recienClasificado, onAbrir }: InboxItemProps) {
  const abierto = item.firstOpenedTsMs !== null;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.email.id,
    disabled: !abierto,
  });

  const abrir = () => onAbrir(item.email.id);

  return (
    <div
      ref={setNodeRef}
      {...(abierto ? listeners : {})}
      {...(abierto ? attributes : {})}
      role="button"
      tabIndex={0}
      onClick={abrir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          abrir();
        }
      }}
      className={[
        'group relative animate-inbox-in select-none rounded-xl border p-3 outline-none transition-colors',
        seleccionado
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300',
        abierto ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        isDragging ? 'opacity-40' : '',
        recienClasificado ? 'animate-inbox-success' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        {!abierto && <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-blue-500" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{item.email.remitente}</p>
          <p className="truncate text-sm text-slate-500">{item.email.asunto}</p>
        </div>
        {recienClasificado && <CheckCircle2 size={18} className="flex-none text-emerald-500" />}
      </div>
      <span
        className={[
          'mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium',
          abierto ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600',
        ].join(' ')}
      >
        {abierto ? 'Sin clasificar' : 'No leído'}
      </span>
    </div>
  );
}
