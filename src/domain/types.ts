export type CriterionId = 'fecha' | 'prioridad' | 'departamento';

export interface EmailAttachment {
  nombre: string;
  tamano: string;
}

export interface Email {
  id: string;
  remitente: string;
  emailRemitente: string;
  asunto: string;
  fechaTexto: string;
  cuerpo: string;
  adjunto?: EmailAttachment;
  clasificacion: Record<CriterionId, string>;
}

export interface CriterionCategory {
  id: string;
  etiqueta: string;
  icono: string;
}

export interface Criterion {
  id: CriterionId;
  etiqueta: string;
  categorias: CriterionCategory[];
}

/**
 * `ninguno` clasificación correcta.
 * `categoria_incorrecta` pestaña correcta, carpeta incorrecta.
 * `criterio_incorrecto` pestaña activa distinta del criterio vigente del bloque.
 * `no_clasificado` el correo fue descartado al cierre del bloque sin clasificar.
 */
export type TipoError =
  | 'ninguno'
  | 'categoria_incorrecta'
  | 'criterio_incorrecto'
  | 'no_clasificado';
