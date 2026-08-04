import type { CriterionId } from '../domain/types';

/**
 * Toda la parametrización temporal y de orden de la sesión vive acá.
 * Cambiar estos valores no requiere tocar ningún componente.
 */
export const SESSION_CONFIG = {
  /** Valor fijo por defecto; el modelo ya soporta alimentarlo desde una pantalla de ingreso futura. */
  participanteDefault: 'P001',

  /**
   * Fecha de referencia fija de la sesión (martes 17 de marzo de 2026).
   * El criterio "fecha" y el texto de fecha de cada correo del corpus se
   * calculan contra esta referencia, nunca contra la fecha real del sistema,
   * para que la clasificación correcta sea determinista.
   */
  fechaReferenciaISO: '2026-03-17T09:00:00',

  duracionBloqueMs: 120_000,
  intervaloLlegadaMs: 15_000,
  correosPorBloque: 8,
  pausaEntreBloquesMs: 5_000,

  /** Orden de criterios a lo largo de los bloques: bloque 1, 2 y 3. */
  ordenCriterios: ['fecha', 'prioridad', 'departamento'] as CriterionId[],
} as const;

/** Offsets de llegada (ms desde el inicio del bloque): 0, 15000, ..., 105000. */
export const OFFSETS_LLEGADA_MS: number[] = Array.from(
  { length: SESSION_CONFIG.correosPorBloque },
  (_, i) => i * SESSION_CONFIG.intervaloLlegadaMs,
);

export const TICK_INTERVALO_MS = 100;
