import { useCallback, useEffect, useRef, useState } from 'react';
import { DISTRACTOR_INTERVALO_MS, type DistractorLevel } from '../config/distractors.config';

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
 * Late cada `DISTRACTOR_INTERVALO_MS` mientras `activo` sea true. En cada
 * latido, si el bloque vigente en ese momento tiene un nivel de distractor
 * asignado (`nivelActivo`), muestra un pop-up de ese nivel; si no tiene
 * ninguno asignado, no muestra nada pero sigue latiendo, por si el bloque
 * siguiente sí tiene uno. No se autocierra: el pop-up queda visible hasta
 * que el participante lo cierra, y recién ahí se agenda el próximo latido.
 * No sabe nada de bloques ni de la bandeja: solo administra qué pop-up
 * mostrar, a partir del nivel vigente que le pasan desde afuera.
 */
export function useDistractorPopups(
  activo: boolean,
  nivelActivo: DistractorLevel | null,
): UseDistractorPopupsResult {
  const [popup, setPopup] = useState<DistractorActivo | null>(null);

  const idRef = useRef(0);
  const spawnTimeoutRef = useRef<number | null>(null);
  const activoRef = useRef(activo);
  activoRef.current = activo;
  const nivelActivoRef = useRef(nivelActivo);
  nivelActivoRef.current = nivelActivo;

  const programarSiguiente = useCallback(() => {
    spawnTimeoutRef.current = window.setTimeout(() => {
      spawnTimeoutRef.current = null;
      const nivel = nivelActivoRef.current;
      if (nivel === null) {
        programarSiguiente();
        return;
      }
      idRef.current += 1;
      setPopup({ id: idRef.current, nivel });
    }, DISTRACTOR_INTERVALO_MS);
  }, []);

  useEffect(() => {
    if (!activo) {
      setPopup(null);
      if (spawnTimeoutRef.current !== null) {
        window.clearTimeout(spawnTimeoutRef.current);
        spawnTimeoutRef.current = null;
      }
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
