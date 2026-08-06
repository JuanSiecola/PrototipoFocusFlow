import { useCallback, useState } from 'react';
import type { Email } from '../domain/types';

export interface InboxItemState {
  email: Email;
  /** ms relativos al inicio de la sesión. */
  arrivalTsMs: number;
  firstOpenedTsMs: number | null;
  lastOpenedTsMs: number | null;
}

export interface UseEmailQueueResult {
  pendientes: InboxItemState[];
  correoSeleccionadoId: string | null;
  agregarCorreo: (email: Email, ahoraMs: number, abrirAutomaticamente?: boolean) => void;
  abrirCorreo: (id: string, ahoraMs: number) => void;
  seleccionarCorreo: (id: string | null) => void;
  removerCorreo: (id: string) => void;
}

/**
 * Estado de la bandeja de entrada. No sabe nada de bloques, criterios ni
 * temporización de sesión: solo administra qué correos están pendientes y
 * cuándo fueron abiertos.
 */
export function useEmailQueue(): UseEmailQueueResult {
  const [pendientes, setPendientes] = useState<InboxItemState[]>([]);
  const [correoSeleccionadoId, setCorreoSeleccionadoId] = useState<string | null>(null);

  const agregarCorreo = useCallback(
    (email: Email, ahoraMs: number, abrirAutomaticamente = false) => {
      setPendientes((prev) => [
        ...prev,
        {
          email,
          arrivalTsMs: ahoraMs,
          firstOpenedTsMs: abrirAutomaticamente ? ahoraMs : null,
          lastOpenedTsMs: abrirAutomaticamente ? ahoraMs : null,
        },
      ]);
      if (abrirAutomaticamente) {
        setCorreoSeleccionadoId(email.id);
      }
    },
    [],
  );

  const abrirCorreo = useCallback((id: string, ahoraMs: number) => {
    setPendientes((prev) =>
      prev.map((item) =>
        item.email.id === id
          ? { ...item, firstOpenedTsMs: item.firstOpenedTsMs ?? ahoraMs, lastOpenedTsMs: ahoraMs }
          : item,
      ),
    );
    setCorreoSeleccionadoId(id);
  }, []);

  const seleccionarCorreo = useCallback((id: string | null) => {
    setCorreoSeleccionadoId(id);
  }, []);

  const removerCorreo = useCallback((id: string) => {
    setPendientes((prev) => prev.filter((item) => item.email.id !== id));
    setCorreoSeleccionadoId((prev) => (prev === id ? null : prev));
  }, []);

  return {
    pendientes,
    correoSeleccionadoId,
    agregarCorreo,
    abrirCorreo,
    seleccionarCorreo,
    removerCorreo,
  };
}
