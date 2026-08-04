import { useCallback, useEffect, useRef, useState } from 'react';
import { CORPUS_POR_BLOQUE } from '../config/corpus';
import { OFFSETS_LLEGADA_MS, SESSION_CONFIG, TICK_INTERVALO_MS } from '../config/session.config';
import type { CriterionId, Email } from '../domain/types';

export type FaseSesion = 'inicio' | 'bloque' | 'pausa' | 'fin';

export interface LlegadaContexto {
  bloqueNumero: number;
  criterioVigente: CriterionId;
  arrivalTsMs: number;
  esPrimerCorreoDelBloque: boolean;
}

export interface FinBloqueContexto {
  bloqueNumero: number;
  criterioVigente: CriterionId;
}

export interface UseSessionEngineOptions {
  onEmailArrival: (email: Email, ctx: LlegadaContexto) => void;
  onBlockEnd: (ctx: FinBloqueContexto) => void;
  onSessionEnd: () => void;
}

export interface SessionEngineState {
  fase: FaseSesion;
  /** 1-based; 0 antes de iniciar. No debe mostrarse al participante. */
  bloqueNumero: number;
  /** No debe mostrarse al participante: revelarlo arruina el paradigma. */
  criterioVigente: CriterionId;
  tiempoRestanteMs: number;
  iniciar: () => void;
  /** ms transcurridos desde el inicio de la sesión, para timestamping de eventos de UI. */
  ahoraMs: () => number;
}

/**
 * Máquina de estados de la sesión: bloques, temporización y llegadas de
 * correos. No conoce el contenido de la bandeja de entrada ni de los
 * eventos registrados; se comunica exclusivamente a través de callbacks.
 */
export function useSessionEngine(options: UseSessionEngineOptions): SessionEngineState {
  const [fase, setFase] = useState<FaseSesion>('inicio');
  const [bloqueNumero, setBloqueNumero] = useState(0);
  const [criterioVigente, setCriterioVigente] = useState<CriterionId>(
    SESSION_CONFIG.ordenCriterios[0],
  );
  const [tiempoRestanteMs, setTiempoRestanteMs] = useState<number>(SESSION_CONFIG.duracionBloqueMs);

  const faseRef = useRef<FaseSesion>('inicio');
  const bloqueIndexRef = useRef(0);
  const sessionStartRef = useRef<number | null>(null);
  const phaseStartRef = useRef(0);
  const llegadasEmitidasRef = useRef<boolean[]>([]);

  const onEmailArrivalRef = useRef(options.onEmailArrival);
  const onBlockEndRef = useRef(options.onBlockEnd);
  const onSessionEndRef = useRef(options.onSessionEnd);
  onEmailArrivalRef.current = options.onEmailArrival;
  onBlockEndRef.current = options.onBlockEnd;
  onSessionEndRef.current = options.onSessionEnd;

  const ahoraMs = useCallback(() => {
    if (sessionStartRef.current === null) return 0;
    return Math.round(performance.now() - sessionStartRef.current);
  }, []);

  const iniciarBloque = useCallback((indice: number, ahora: number) => {
    bloqueIndexRef.current = indice;
    llegadasEmitidasRef.current = new Array(SESSION_CONFIG.correosPorBloque).fill(false);
    phaseStartRef.current = ahora;
    faseRef.current = 'bloque';
    setFase('bloque');
    setBloqueNumero(indice + 1);
    setCriterioVigente(SESSION_CONFIG.ordenCriterios[indice]);
    setTiempoRestanteMs(SESSION_CONFIG.duracionBloqueMs);
  }, []);

  const iniciar = useCallback(() => {
    const ahora = performance.now();
    sessionStartRef.current = ahora;
    iniciarBloque(0, ahora);
  }, [iniciarBloque]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const ahora = performance.now();
      const sessionStart = sessionStartRef.current ?? ahora;

      if (faseRef.current === 'bloque') {
        const elapsed = ahora - phaseStartRef.current;
        const indice = bloqueIndexRef.current;
        const criterio = SESSION_CONFIG.ordenCriterios[indice];
        const correos = CORPUS_POR_BLOQUE[indice];

        OFFSETS_LLEGADA_MS.forEach((offset, i) => {
          if (!llegadasEmitidasRef.current[i] && elapsed >= offset) {
            llegadasEmitidasRef.current[i] = true;
            onEmailArrivalRef.current(correos[i], {
              bloqueNumero: indice + 1,
              criterioVigente: criterio,
              arrivalTsMs: Math.round(ahora - sessionStart),
              esPrimerCorreoDelBloque: i === 0,
            });
          }
        });

        setTiempoRestanteMs(Math.max(0, SESSION_CONFIG.duracionBloqueMs - elapsed));

        if (elapsed >= SESSION_CONFIG.duracionBloqueMs) {
          onBlockEndRef.current({ bloqueNumero: indice + 1, criterioVigente: criterio });
          phaseStartRef.current = ahora;
          faseRef.current = 'pausa';
          setFase('pausa');
          setTiempoRestanteMs(SESSION_CONFIG.pausaEntreBloquesMs);
        }
        return;
      }

      if (faseRef.current === 'pausa') {
        const elapsed = ahora - phaseStartRef.current;
        setTiempoRestanteMs(Math.max(0, SESSION_CONFIG.pausaEntreBloquesMs - elapsed));

        if (elapsed >= SESSION_CONFIG.pausaEntreBloquesMs) {
          const siguienteIndice = bloqueIndexRef.current + 1;
          if (siguienteIndice < SESSION_CONFIG.ordenCriterios.length) {
            iniciarBloque(siguienteIndice, ahora);
          } else {
            faseRef.current = 'fin';
            setFase('fin');
            onSessionEndRef.current();
          }
        }
      }
    }, TICK_INTERVALO_MS);

    return () => window.clearInterval(id);
  }, [iniciarBloque]);

  return {
    fase,
    bloqueNumero,
    criterioVigente,
    tiempoRestanteMs,
    iniciar,
    ahoraMs,
  };
}
