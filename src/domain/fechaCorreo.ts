const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const MS_POR_DIA = 24 * 60 * 60 * 1000;

interface FechaCorpusParseada {
  dia: number;
  mes: number;
  hora: number;
  minuto: number;
}

function parsearFechaCorpus(fechaTexto: string): FechaCorpusParseada {
  const match = fechaTexto.match(/^(\d{1,2}) de (\p{L}+), (\d{1,2}):(\d{2})$/u);
  if (!match) {
    throw new Error(`No se pudo interpretar la fecha de corpus: "${fechaTexto}"`);
  }
  const [, diaStr, mesNombre, horaStr, minutoStr] = match;
  const mes = MESES.indexOf(mesNombre.toLowerCase());
  if (mes === -1) {
    throw new Error(`Mes desconocido en fecha de corpus: "${fechaTexto}"`);
  }
  return { dia: Number(diaStr), mes, hora: Number(horaStr), minuto: Number(minutoStr) };
}

/**
 * Reproyecta una fecha de corpus —escrita a mano contra `anclaCorpusISO`,
 * fija— a la misma distancia en días desde `referenciaSesion` (hoy), para
 * que el corpus siempre luzca actual sin reescribir su contenido. La hora
 * del correo se conserva tal cual fue redactada.
 */
export function proyectarFechaCorreo(
  fechaTexto: string,
  anclaCorpusISO: string,
  referenciaSesion: Date,
): string {
  const anclaCorpus = new Date(anclaCorpusISO);
  const { dia, mes, hora, minuto } = parsearFechaCorpus(fechaTexto);

  // El corpus solo contiene fechas iguales o anteriores al ancla; si el mes
  // quedara "después" del mes de ancla (o el mismo mes pero un día
  // posterior), pertenece al año calendario previo.
  let anio = anclaCorpus.getFullYear();
  const esAnioPrevio =
    mes > anclaCorpus.getMonth() || (mes === anclaCorpus.getMonth() && dia > anclaCorpus.getDate());
  if (esAnioPrevio) anio -= 1;

  const fechaOriginalMedianoche = new Date(anio, mes, dia);
  const anclaMedianoche = new Date(anclaCorpus.getFullYear(), anclaCorpus.getMonth(), anclaCorpus.getDate());
  const offsetDias = Math.round(
    (fechaOriginalMedianoche.getTime() - anclaMedianoche.getTime()) / MS_POR_DIA,
  );

  const fechaProyectada = new Date(referenciaSesion);
  fechaProyectada.setDate(fechaProyectada.getDate() + offsetDias);

  const horaTxt = String(hora).padStart(2, '0');
  const minutoTxt = String(minuto).padStart(2, '0');
  return `${fechaProyectada.getDate()} de ${MESES[fechaProyectada.getMonth()]}, ${horaTxt}:${minutoTxt}`;
}
