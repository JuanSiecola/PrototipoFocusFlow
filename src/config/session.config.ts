import type { CriterionId } from '../domain/types';

/**
 * Toda la parametrización temporal y de orden de la sesión vive acá.
 * Cambiar estos valores no requiere tocar ningún componente.
 */
export const SESSION_CONFIG = {
  /** Valor fijo por defecto; el modelo ya soporta alimentarlo desde una pantalla de ingreso futura. */
  participanteDefault: 'P001',

  /**
   * Fecha fija contra la que está escrito el texto del corpus (ver
   * corpus.ts) — nunca se muestra ni se usa para clasificar. En tiempo de
   * ejecución, cada fecha de correo se reproyecta conservando la misma
   * distancia en días desde esta ancla, pero contada desde
   * `fechaReferenciaSesion` (la fecha real de hoy), para que el corpus
   * siempre luzca actual sin reescribir su contenido.
   */
  anclaCorpusISO: '2026-03-17T09:00:00',

  /** Fecha real de "hoy", calculada una única vez al cargar la sesión. */
  fechaReferenciaSesion: new Date(),

  /**
   * Duración por defecto de cada bloque, en minutos. Es editable por bloque
   * desde la pantalla de inicio (ver StartScreen / App): estos valores son
   * solo el punto de partida que se ofrece antes de arrancar.
   */
  duracionBloqueMinDefault: 2,

  correosPorBloque: 8,
  pausaEntreBloquesMs: 5_000,

  /** Cuánto queda en rojo la carpeta donde se soltó un correo mal clasificado. */
  errorFeedbackDuracionMs: 1_200,

  /**
   * Aciertos acumulados dentro de un bloque (los errores intermedios no
   * reinician el contador) que hacen avanzar al bloque siguiente antes de
   * que se agote su duración configurada.
   */
  aciertosParaAvanzar: 5,

  /** Orden de criterios a lo largo de los bloques: bloque 1, 2 y 3. */
  ordenCriterios: ['fecha', 'prioridad', 'departamento'] as CriterionId[],
} as const;

export const TICK_INTERVALO_MS = 100;
