import type { ClassificationResult } from '../domain/classification';
import type { CriterionId, Email } from '../domain/types';

interface CamposComunes {
  participante: string;
  bloque: number;
  criterioVigente: CriterionId;
  idCorreo: string;
  asunto: string;
  tLlegadaMs: number;
  timestampIso: string;
}

export interface AttemptEvent extends CamposComunes {
  tipo: 'intento';
  tPrimeraAperturaMs: number;
  tDropMs: number;
  pestanaActiva: CriterionId;
  carpetaDestino: string;
  correcto: boolean;
  tiempoReaccionMs: number;
  intentoNro: number;
  tipoError: ClassificationResult['tipoError'];
}

export interface DiscardedEvent extends CamposComunes {
  tipo: 'descartado';
  tPrimeraAperturaMs: number | null;
}

export type SessionEvent = AttemptEvent | DiscardedEvent;

export function contarIntentosPrevios(eventos: SessionEvent[], idCorreo: string): number {
  return eventos.filter((e) => e.tipo === 'intento' && e.idCorreo === idCorreo).length;
}

export function crearEventoIntento(params: {
  participante: string;
  bloque: number;
  criterioVigente: CriterionId;
  email: Email;
  tLlegadaMs: number;
  tPrimeraAperturaMs: number;
  tUltimaAperturaMs: number;
  tDropMs: number;
  pestanaActiva: CriterionId;
  carpetaDestino: string;
  resultado: ClassificationResult;
  intentoNro: number;
}): AttemptEvent {
  return {
    tipo: 'intento',
    participante: params.participante,
    bloque: params.bloque,
    criterioVigente: params.criterioVigente,
    idCorreo: params.email.id,
    asunto: params.email.asunto,
    tLlegadaMs: params.tLlegadaMs,
    tPrimeraAperturaMs: params.tPrimeraAperturaMs,
    tDropMs: params.tDropMs,
    pestanaActiva: params.pestanaActiva,
    carpetaDestino: params.carpetaDestino,
    correcto: params.resultado.correcto,
    tiempoReaccionMs: params.tDropMs - params.tUltimaAperturaMs,
    intentoNro: params.intentoNro,
    tipoError: params.resultado.tipoError,
    timestampIso: new Date().toISOString(),
  };
}

export function crearEventoDescartado(params: {
  participante: string;
  bloque: number;
  criterioVigente: CriterionId;
  email: Email;
  tLlegadaMs: number;
  tPrimeraAperturaMs: number | null;
}): DiscardedEvent {
  return {
    tipo: 'descartado',
    participante: params.participante,
    bloque: params.bloque,
    criterioVigente: params.criterioVigente,
    idCorreo: params.email.id,
    asunto: params.email.asunto,
    tLlegadaMs: params.tLlegadaMs,
    tPrimeraAperturaMs: params.tPrimeraAperturaMs,
    timestampIso: new Date().toISOString(),
  };
}
