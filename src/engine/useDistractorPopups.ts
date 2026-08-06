import { useEffect, useRef, useState } from 'react';
import {
  DISTRACTOR_DURACION_MS,
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
 * Hace aparecer un pop-up distractor cada `DISTRACTOR_INTERVALO_MS` mientras
 * `activo` sea true, ciclando `DISTRACTOR_SECUENCIA`. Cada uno se autocierra
 * a los `DISTRACTOR_DURACION_MS` si el participante no lo cierra antes. No
 * sabe nada de bloques ni de la bandeja: solo administra qué pop-up mostrar.
 */
export function useDistractorPopups(activo: boolean): UseDistractorPopupsResult {
  const [popup, setPopup] = useState<DistractorActivo | null>(null);

  const contadorRef = useRef(0);
  const idRef = useRef(0);
  const autoCierreRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activo) {
      setPopup(null);
      return;
    }

    const spawnId = window.setInterval(() => {
      const nivel = DISTRACTOR_SECUENCIA[contadorRef.current % DISTRACTOR_SECUENCIA.length];
      contadorRef.current += 1;
      idRef.current += 1;
      const nuevoId = idRef.current;

      setPopup({ id: nuevoId, nivel });

      if (autoCierreRef.current !== null) window.clearTimeout(autoCierreRef.current);
      autoCierreRef.current = window.setTimeout(() => {
        setPopup((actual) => (actual?.id === nuevoId ? null : actual));
      }, DISTRACTOR_DURACION_MS);
    }, DISTRACTOR_INTERVALO_MS);

    return () => {
      window.clearInterval(spawnId);
      if (autoCierreRef.current !== null) window.clearTimeout(autoCierreRef.current);
    };
  }, [activo]);

  const cerrar = () => {
    setPopup(null);
    if (autoCierreRef.current !== null) {
      window.clearTimeout(autoCierreRef.current);
      autoCierreRef.current = null;
    }
  };

  return { popup, cerrar };
}
