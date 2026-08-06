export type DistractorLevel = 'nivel1' | 'nivel2' | 'nivel3';

export interface DistractorContent {
  titulo: string;
  mensaje: string;
}

/** Cada cuántos ms aparece un nuevo pop-up mientras la sesión está activa. */
export const DISTRACTOR_INTERVALO_MS = 20_000;

/** Cuánto queda visible un pop-up si el participante no lo cierra antes. */
export const DISTRACTOR_DURACION_MS = 10_000;

/**
 * Volumen por defecto de cada nivel, en % (100 = el diseñado en
 * popupSound.ts, 0 = silencio). Editable por nivel desde la pantalla de
 * inicio; estos valores son solo el punto de partida.
 */
export const DISTRACTOR_VOLUMEN_DEFAULT_PCT = 100;

/**
 * Se repite en este orden mientras dure la sesión (nivel1, nivel2, nivel3,
 * nivel1, ...), así todos los participantes quedan expuestos por igual a
 * los tres tipos de distractor, sin depender del azar.
 */
export const DISTRACTOR_SECUENCIA: DistractorLevel[] = ['nivel1', 'nivel2', 'nivel3'];

export const DISTRACTOR_CONTENIDO: Record<DistractorLevel, DistractorContent> = {
  nivel1: {
    titulo: 'Publicidad',
    mensaje:
      'Ahorrá horas cada semana automatizando tareas repetitivas de tu bandeja. Descubrí cómo, gratis por 14 días.',
  },
  nivel2: {
    titulo: 'Actualización de Windows',
    mensaje:
      'Hay actualizaciones importantes disponibles. Guardá tu trabajo: el equipo podría reiniciarse automáticamente.',
  },
  nivel3: {
    titulo: 'Alerta de seguridad',
    mensaje: 'Tu antivirus detectó un archivo sospechoso. Ejecutá un análisis completo para proteger tu equipo.',
  },
};
