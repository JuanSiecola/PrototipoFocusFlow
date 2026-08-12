import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DISTRACTOR_INTERVALO_MS,
  DISTRACTOR_SECUENCIA,
  type DistractorLevel,
} from '../config/distractors.config';

export interface DistractorActivo {
  /** Cambia en cada aparición, incluso repitiendo nivel, para poder reiniciar animaciones. */
  id: number;
  nivel: DistractorLevel;
}

export interface UseDistractorPopupsResult {
  popup: DistractorActivo | null;
  cerrar: () => void;
}

/**
 * Hace aparecer un pop-up distractor a los `DISTRACTOR_INTERVALO_MS` de
 * iniciada la sesión, ciclando `DISTRACTOR_SECUENCIA`. No se autocierra: el
 * pop-up queda visible hasta que el participante lo cierra, y recién ahí se
 * agenda la próxima aparición. No sabe nada de bloques ni de la bandeja:
 * solo administra qué pop-up mostrar.
 */
export function useDistractorPopups(activo: boolean): UseDistractorPopupsResult {
  const [popup, setPopup] = useState<DistractorActivo | null>(null);

  const contadorRef = useRef(0);
  const idRef = useRef(0);
  const spawnTimeoutRef = useRef<number | null>(null);
  const activoRef = useRef(activo);
  activoRef.current = activo;

  const programarSiguiente = useCallback(() => {
    spawnTimeoutRef.current = window.setTimeout(() => {
      const nivel = DISTRACTOR_SECUENCIA[contadorRef.current % DISTRACTOR_SECUENCIA.length];
      contadorRef.current += 1;
      idRef.current += 1;
      setPopup({ id: idRef.current, nivel });
    }, DISTRACTOR_INTERVALO_MS);
  }, []);

  useEffect(() => {
    if (!activo) {
      setPopup(null);
      return;
    }

    programarSiguiente();

    return () => {
      if (spawnTimeoutRef.current !== null) {
        window.clearTimeout(spawnTimeoutRef.current);
        spawnTimeoutRef.current = null;
      }
    };
  }, [activo, programarSiguiente]);

  const cerrar = useCallback(() => {
    setPopup(null);
    if (activoRef.current) programarSiguiente();
  }, [programarSiguiente]);

  return { popup, cerrar };
}
