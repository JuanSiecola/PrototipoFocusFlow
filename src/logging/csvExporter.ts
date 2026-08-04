import type { SessionEvent } from './eventLog';

const COLUMNAS = [
  'participante',
  'bloque',
  'criterio_vigente',
  'id_correo',
  'asunto',
  't_llegada_ms',
  't_primera_apertura_ms',
  't_drop_ms',
  'pestana_activa',
  'carpeta_destino',
  'correcto',
  'tiempo_reaccion_ms',
  'intento_nro',
  'tipo_error',
  'timestamp_iso',
] as const;

function escaparCeldaCsv(valor: string | number | boolean | null): string {
  if (valor === null) return '';
  const texto = String(valor);
  if (/[",\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function eventoAFila(evento: SessionEvent): (string | number | boolean | null)[] {
  const comunes = [
    evento.participante,
    evento.bloque,
    evento.criterioVigente,
    evento.idCorreo,
    evento.asunto,
    evento.tLlegadaMs,
  ];

  if (evento.tipo === 'descartado') {
    return [
      ...comunes,
      evento.tPrimeraAperturaMs,
      null,
      null,
      null,
      null,
      null,
      null,
      'no_clasificado',
      evento.timestampIso,
    ];
  }

  return [
    ...comunes,
    evento.tPrimeraAperturaMs,
    evento.tDropMs,
    evento.pestanaActiva,
    evento.carpetaDestino,
    evento.correcto,
    evento.tiempoReaccionMs,
    evento.intentoNro,
    evento.tipoError,
    evento.timestampIso,
  ];
}

export function eventosACsv(eventos: SessionEvent[]): string {
  const filas = [COLUMNAS.join(',')];
  for (const evento of eventos) {
    filas.push(eventoAFila(evento).map(escaparCeldaCsv).join(','));
  }
  return filas.join('\r\n');
}

export function descargarCsv(eventos: SessionEvent[], nombreArchivo = 'focusflow_sesion.csv'): void {
  const csv = eventosACsv(eventos);
  const BOM = String.fromCharCode(0xfeff);
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
