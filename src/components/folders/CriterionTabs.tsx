import { CRITERIOS } from '../../config/criteria.config';
import type { CriterionId } from '../../domain/types';

interface CriterionTabsProps {
  activo: CriterionId;
  onChange: (id: CriterionId) => void;
}

/**
 * Las tres pestañas se ven siempre disponibles y ninguna indica cuál es la
 * correcta en el momento: el estilo del tab activo es puramente de
 * navegación, no una pista de validez.
 */
export function CriterionTabs({ activo, onChange }: CriterionTabsProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
      {CRITERIOS.map((criterio) => (
        <button
          key={criterio.id}
          type="button"
          onClick={() => onChange(criterio.id)}
          className={[
            'flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
            activo === criterio.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          {criterio.etiqueta}
        </button>
      ))}
    </div>
  );
}
