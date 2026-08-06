import { useCallback, useEffect, useRef, useState } from 'react';
import { CORPUS_POR_BLOQUE } from '../config/corpus';
import { SESSION_CONFIG, TICK_INTERVALO_MS } from '../config/session.config';
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
  /** Duración de cada bloque en ms, en el mismo orden que `SESSION_CONFIG.ordenCriterios`. */
  duracionesBloqueMs: number[];
  onEmailArrival: (email: Email, ctx: LlegadaContexto) => void;
  onBlockEnd: (ctx: FinBloqueContexto) => void;
  /** `ctx` refleja el último bloque corrido, ya que la sesión termina inmediatamente después de su pausa. */
  onSessionEnd: (ctx: FinBloqueContexto) => void;
}

export interface SessionEngineState {
  fase: FaseSesion;
  /** 1-based; 0 antes de iniciar. No debe mostrarse al participante. */
  bloqueNumero: number;
  /** No debe mostrarse al participante: revelarlo arruina el paradigma. */
  criterioVigente: CriterionId;
  tiempoRestanteMs: number;
  /** ms transcurridos desde el inicio de la sesión completa; seguro de mostrar. */
  tiempoSesionMs: number;
  iniciar: () => void;
  /** ms transcurridos desde el inicio de la sesión, para timestamping de eventos de UI. */
  ahoraMs: () => number;
}

/**
 * Reparte los `correosPorBloque` correos en partes iguales a lo largo de
 * `duracionBloqueMs`, dejando siempre un último intervalo libre después de
 * la llegada del último correo para poder clasificarlo antes de que cierre
 * el bloque. Así, sea cual sea la duración configurada, las llegadas
 * siempre respetan (se ajustan a) esos minutos.
 */
function calcularOffsetsLlegada(duracionBloqueMs: number): number[] {
  const intervalo = duracionBloqueMs / SESSION_CONFIG.correosPorBloque;
  return Array.from({ length: SESSION_CONFIG.correosPorBloque }, (_, i) => i * intervalo);
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
  const [tiempoRestanteMs, setTiempoRestanteMs] = useState(0);
  const [tiempoSesionMs, setTiempoSesionMs] = useState(0);

  const faseRef = useRef<FaseSesion>('inicio');
  const bloqueIndexRef = useRef(0);
  const sessionStartRef = useRef<number | null>(null);
  const phaseStartRef = useRef(0);
  const llegadasEmitidasRef = useRef<boolean[]>([]);
  const offsetsLlegadaRef = useRef<number[]>([]);

  const duracionesBloqueMsRef = useRef(options.duracionesBloqueMs);
  duracionesBloqueMsRef.current = options.duracionesBloqueMs;

  const onEmailArrivalRef = useRef(options.onEmailArrival);
  const onBlockEndRef = useRef(options.onBlockEnd);
  const onSessionEndRef = useRef(options.onSessionEnd);
  onEmailArrivalRef.current = options.onEmailArrival;
  onBlockEndRef.current = options.onBlockEnd;
  onSessionEndRef.current = options.onSessionEnd;

  const duracionBloque = useCallback(
    (indice: number) =>
      duracionesBloqueMsRef.current[indice] ?? SESSION_CONFIG.duracionBloqueMinDefault * 60_000,
    [],
  );

  const ahoraMs = useCallback(() => {
    if (sessionStartRef.current === null) return 0;
    return Math.round(performance.now() - sessionStartRef.current);
  }, []);

  const iniciarBloque = useCallback(
    (indice: number, ahora: number) => {
      const duracion = duracionBloque(indice);
      bloqueIndexRef.current = indice;
      offsetsLlegadaRef.current = calcularOffsetsLlegada(duracion);
      llegadasEmitidasRef.current = new Array(SESSION_CONFIG.correosPorBloque).fill(false);
      phaseStartRef.current = ahora;
      faseRef.current = 'bloque';
      setFase('bloque');
      setBloqueNumero(indice + 1);
      setCriterioVigente(SESSION_CONFIG.ordenCriterios[indice]);
      setTiempoRestanteMs(duracion);
    },
    [duracionBloque],
  );

  const iniciar = useCallback(() => {
    const ahora = performance.now();
    sessionStartRef.current = ahora;
    iniciarBloque(0, ahora);
  }, [iniciarBloque]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const ahora = performance.now();
      const sessionStart = sessionStartRef.current;
      if (sessionStart === null) return;

      setTiempoSesionMs(Math.max(0, ahora - sessionStart));

      if (faseRef.current === 'bloque') {
        const elapsed = ahora - phaseStartRef.current;
        const indice = bloqueIndexRef.current;
        const criterio = SESSION_CONFIG.ordenCriterios[indice];
        const correos = CORPUS_POR_BLOQUE[indice];
        const duracion = duracionBloque(indice);

        offsetsLlegadaRef.current.forEach((offset, i) => {
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

        setTiempoRestanteMs(Math.max(0, duracion - elapsed));

        if (elapsed >= duracion) {
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
            const ultimoIndice = bloqueIndexRef.current;
            faseRef.current = 'fin';
            setFase('fin');
            onSessionEndRef.current({
              bloqueNumero: ultimoIndice + 1,
              criterioVigente: SESSION_CONFIG.ordenCriterios[ultimoIndice],
            });
          }
        }
      }
    }, TICK_INTERVALO_MS);

    return () => window.clearInterval(id);
  }, [iniciarBloque, duracionBloque]);

  return {
    fase,
    bloqueNumero,
    criterioVigente,
    tiempoRestanteMs,
    tiempoSesionMs,
    iniciar,
    ahoraMs,
  };
}
