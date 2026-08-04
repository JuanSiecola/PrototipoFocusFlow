import type { Criterion, CriterionId } from '../domain/types';

/**
 * Ids de categoría, centralizados para que corpus.ts y criteria.config.ts
 * nunca se desincronicen por un string mal tipeado.
 */
export const CATEGORIA_FECHA = {
  HOY: 'hoy',
  ESTA_SEMANA: 'esta_semana',
  ESTE_MES: 'este_mes',
  MAS_DE_UN_MES: 'mas_de_un_mes',
} as const;

export const CATEGORIA_PRIORIDAD = {
  URGENTE: 'urgente',
  PRIORITARIO: 'prioritario',
  PERSONAL: 'personal',
  SPAM: 'spam',
} as const;

export const CATEGORIA_DEPARTAMENTO = {
  RRHH: 'rrhh',
  FINANZAS: 'finanzas',
  SOPORTE_TECNICO: 'soporte_tecnico',
  COMPRAS: 'compras',
} as const;

export const CRITERIOS: Criterion[] = [
  {
    id: 'fecha',
    etiqueta: 'Fecha',
    categorias: [
      { id: CATEGORIA_FECHA.HOY, etiqueta: 'Hoy', icono: 'Clock' },
      { id: CATEGORIA_FECHA.ESTA_SEMANA, etiqueta: 'Esta semana', icono: 'CalendarDays' },
      { id: CATEGORIA_FECHA.ESTE_MES, etiqueta: 'Este mes', icono: 'CalendarRange' },
      { id: CATEGORIA_FECHA.MAS_DE_UN_MES, etiqueta: 'Más de un mes', icono: 'CalendarX' },
    ],
  },
  {
    id: 'prioridad',
    etiqueta: 'Prioridad',
    categorias: [
      { id: CATEGORIA_PRIORIDAD.URGENTE, etiqueta: 'Urgente', icono: 'AlertTriangle' },
      { id: CATEGORIA_PRIORIDAD.PRIORITARIO, etiqueta: 'Prioritario', icono: 'Flag' },
      { id: CATEGORIA_PRIORIDAD.PERSONAL, etiqueta: 'Personal', icono: 'User' },
      { id: CATEGORIA_PRIORIDAD.SPAM, etiqueta: 'Spam', icono: 'Ban' },
    ],
  },
  {
    id: 'departamento',
    etiqueta: 'Departamento',
    categorias: [
      { id: CATEGORIA_DEPARTAMENTO.RRHH, etiqueta: 'Recursos Humanos', icono: 'Users' },
      { id: CATEGORIA_DEPARTAMENTO.FINANZAS, etiqueta: 'Finanzas', icono: 'DollarSign' },
      {
        id: CATEGORIA_DEPARTAMENTO.SOPORTE_TECNICO,
        etiqueta: 'Soporte Técnico',
        icono: 'Headphones',
      },
      { id: CATEGORIA_DEPARTAMENTO.COMPRAS, etiqueta: 'Compras', icono: 'ShoppingCart' },
    ],
  },
];

export function getCriterio(id: CriterionId): Criterion {
  const criterio = CRITERIOS.find((c) => c.id === id);
  if (!criterio) {
    throw new Error(`Criterio desconocido: ${id}`);
  }
  return criterio;
}
