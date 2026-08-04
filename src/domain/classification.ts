import type { CriterionId, Email, TipoError } from './types';

export interface ClassificationAttempt {
  email: Email;
  criterioVigente: CriterionId;
  pestanaActiva: CriterionId;
  carpetaDestino: string;
}

export interface ClassificationResult {
  correcto: boolean;
  tipoError: TipoError;
}

/**
 * Una clasificación es correcta únicamente si la pestaña activa coincide con el
 * criterio vigente del bloque Y la carpeta elegida coincide con la categoría
 * correcta del correo bajo ese criterio.
 */
export function evaluarClasificacion(intento: ClassificationAttempt): ClassificationResult {
  if (intento.pestanaActiva !== intento.criterioVigente) {
    return { correcto: false, tipoError: 'criterio_incorrecto' };
  }

  const categoriaCorrecta = intento.email.clasificacion[intento.criterioVigente];
  if (intento.carpetaDestino !== categoriaCorrecta) {
    return { correcto: false, tipoError: 'categoria_incorrecta' };
  }

  return { correcto: true, tipoError: 'ninguno' };
}
