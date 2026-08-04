import type { Email } from '../domain/types';
import { CATEGORIA_DEPARTAMENTO, CATEGORIA_FECHA, CATEGORIA_PRIORIDAD } from './criteria.config';

/**
 * Corpus de 24 correos, 8 por bloque, sin repetición entre bloques.
 * Cada correo tiene asignada su categoría correcta bajo los tres criterios a
 * la vez (fecha, prioridad, departamento), como una carta del Berg tiene
 * color, forma y número simultáneamente.
 *
 * La distribución está balanceada 2/2/2/2 en las tres dimensiones dentro de
 * cada bloque (y por lo tanto también en el corpus completo), para que
 * ninguna carpeta quede sin uso y no se pueda acertar por frecuencia.
 *
 * Las fechas están escritas contra SESSION_CONFIG.fechaReferenciaISO
 * (17 de marzo de 2026) — ver session.config.ts.
 */

const CORPUS_BLOQUE_1: Email[] = [
  {
    id: 'b1c1',
    remitente: 'María González',
    emailRemitente: 'maria.gonzalez@empresa.com',
    asunto: 'Solicitud de licencia médica',
    fechaTexto: '17 de marzo, 09:24',
    cuerpo:
      'Hola,\n\nQuisiera solicitar licencia médica por dos días, desde el 18 al 19 de marzo, ya que debo realizarme estudios indicados por mi médico. Adjunto el certificado correspondiente y quedo a disposición por cualquier información adicional.\n\nAgradezco si pueden confirmar la recepción de la documentación y los pasos a seguir.\n\nSaludos,\nMaría González',
    adjunto: { nombre: 'certificado_medico.pdf', tamano: '156 KB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.HOY,
      prioridad: CATEGORIA_PRIORIDAD.PRIORITARIO,
      departamento: CATEGORIA_DEPARTAMENTO.RRHH,
    },
  },
  {
    id: 'b1c2',
    remitente: 'Diego Aramburu',
    emailRemitente: 'diego.aramburu@empresa.com',
    asunto: 'No puedo acceder a la VPN',
    fechaTexto: '17 de marzo, 08:15',
    cuerpo:
      'Hola,\n\nDesde esta mañana no logro conectarme a la VPN y necesito entrar al servidor de proyectos para una entrega de hoy al mediodía. Ya probé reiniciar el cliente y cambiar de red, pero sigue sin funcionar.\n\n¿Me pueden ayudar lo antes posible? Se me complica bastante si no lo resuelvo en la próxima hora.\n\nGracias,\nDiego Aramburu',
    clasificacion: {
      fecha: CATEGORIA_FECHA.HOY,
      prioridad: CATEGORIA_PRIORIDAD.URGENTE,
      departamento: CATEGORIA_DEPARTAMENTO.SOPORTE_TECNICO,
    },
  },
  {
    id: 'b1c3',
    remitente: 'Lucía Ferreyra',
    emailRemitente: 'lucia.ferreyra@empresa.com',
    asunto: 'Pago a proveedor vence hoy, riesgo de corte',
    fechaTexto: '16 de marzo, 17:40',
    cuerpo:
      'Hola,\n\nEl proveedor de energía nos avisó que si no acreditamos el pago pendiente antes de las 18 h de hoy, procede a cortar el suministro de la planta. Necesito que alguien autorice la transferencia con urgencia, ya está todo cargado en el sistema.\n\nCualquier demora nos deja sin producción mañana. Quedo atenta.\n\nSaludos,\nLucía Ferreyra',
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTA_SEMANA,
      prioridad: CATEGORIA_PRIORIDAD.URGENTE,
      departamento: CATEGORIA_DEPARTAMENTO.FINANZAS,
    },
  },
  {
    id: 'b1c4',
    remitente: 'Martín Sosa',
    emailRemitente: 'martin.sosa@empresa.com',
    asunto: '¿Sumamos un pedido de café para la oficina?',
    fechaTexto: '16 de marzo, 10:05',
    cuerpo:
      'Hola,\n\nEstoy por hacer un pedido grande de café e insumos para la cocina, ¿alguien más quiere sumar algo antes de que cierre el pedido? Si es así, avisenme antes del mediodía.\n\nAprovecho que el proveedor tiene descuento por cantidad esta semana.\n\nSaludos,\nMartín',
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTA_SEMANA,
      prioridad: CATEGORIA_PRIORIDAD.PERSONAL,
      departamento: CATEGORIA_DEPARTAMENTO.COMPRAS,
    },
  },
  {
    id: 'b1c5',
    remitente: 'Valentina Ríos',
    emailRemitente: 'valentina.rios@empresa.com',
    asunto: 'Factura 0345 pendiente de tu aprobación',
    fechaTexto: '5 de marzo, 11:30',
    cuerpo:
      'Hola,\n\nTe escribo porque la factura 0345 del proveedor de insumos sigue pendiente de aprobación en el sistema y el vencimiento es la semana que viene. Adjunto el PDF para que lo puedas revisar con tiempo.\n\n¿Podés confirmarme cuando quede aprobada para programar el pago?\n\nGracias,\nValentina Ríos',
    adjunto: { nombre: 'factura_0345.pdf', tamano: '212 KB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTE_MES,
      prioridad: CATEGORIA_PRIORIDAD.PRIORITARIO,
      departamento: CATEGORIA_DEPARTAMENTO.FINANZAS,
    },
  },
  {
    id: 'b1c6',
    remitente: 'Seguridad Total Antivirus',
    emailRemitente: 'promociones@seguridadtotal-corp.com',
    asunto: 'Aprovechá 40% OFF en licencias antivirus para tu empresa',
    fechaTexto: '9 de marzo, 14:00',
    cuerpo:
      'Estimado cliente,\n\nAprovechá nuestra promoción exclusiva de marzo: licencias antivirus corporativas con 40% de descuento por tiempo limitado, incluye soporte 24/7 y protección para todos tus dispositivos.\n\nEscribinos para conocer todos los planes disponibles antes de que termine la oferta.\n\nEquipo Comercial,\nSeguridad Total Antivirus',
    adjunto: { nombre: 'catalogo_seguridad.pdf', tamano: '1,1 MB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTE_MES,
      prioridad: CATEGORIA_PRIORIDAD.SPAM,
      departamento: CATEGORIA_DEPARTAMENTO.SOPORTE_TECNICO,
    },
  },
  {
    id: 'b1c7',
    remitente: 'Nicolás Pereyra',
    emailRemitente: 'nicolas.pereyra@empresa.com',
    asunto: 'Colecta para el regalo de Marisa',
    fechaTexto: '22 de enero, 16:20',
    cuerpo:
      'Hola,\n\nOrganizamos una colecta para el regalo de despedida de Marisa, que se jubila a fin de mes. Si querés sumarte, avisame y te paso el alias.\n\nLa idea es juntar todo antes de su último día e ir a comer algo entre todos.\n\nUn abrazo,\nNicolás',
    clasificacion: {
      fecha: CATEGORIA_FECHA.MAS_DE_UN_MES,
      prioridad: CATEGORIA_PRIORIDAD.PERSONAL,
      departamento: CATEGORIA_DEPARTAMENTO.RRHH,
    },
  },
  {
    id: 'b1c8',
    remitente: 'Insumos del Plata',
    emailRemitente: 'ofertas@insumosdelplata.com.ar',
    asunto: 'Descuentos de verano en insumos de oficina',
    fechaTexto: '9 de febrero, 09:50',
    cuerpo:
      'Estimados,\n\nLes acercamos nuestro catálogo de verano con precios especiales en resmas, tóners y artículos de librería para empresas. Válido hasta agotar stock.\n\nConsultanos por pedidos mayoristas y condiciones de pago a 30 días.\n\nSaludos cordiales,\nEquipo Comercial — Insumos del Plata',
    clasificacion: {
      fecha: CATEGORIA_FECHA.MAS_DE_UN_MES,
      prioridad: CATEGORIA_PRIORIDAD.SPAM,
      departamento: CATEGORIA_DEPARTAMENTO.COMPRAS,
    },
  },
];

const CORPUS_BLOQUE_2: Email[] = [
  {
    id: 'b2c1',
    remitente: 'Camila Duarte',
    emailRemitente: 'camila.duarte@empresa.com',
    asunto: 'El sistema de pagos está caído, no podemos pagar a nadie',
    fechaTexto: '17 de marzo, 10:50',
    cuerpo:
      'Hola,\n\nEl sistema de pagos se cayó hace media hora y tenemos tres transferencias a proveedores que vencen hoy. Ya avisé a soporte pero necesito que alguien lo escale porque si no pagamos antes de las 16 h perdemos las condiciones acordadas.\n\n¿Podés ayudarme a destrabar esto?\n\nGracias,\nCamila Duarte',
    clasificacion: {
      fecha: CATEGORIA_FECHA.HOY,
      prioridad: CATEGORIA_PRIORIDAD.URGENTE,
      departamento: CATEGORIA_DEPARTAMENTO.FINANZAS,
    },
  },
  {
    id: 'b2c2',
    remitente: 'Federico Lombardi',
    emailRemitente: 'federico.lombardi@empresa.com',
    asunto: 'Tercer aviso: seguimos sin acceso al sistema de tickets',
    fechaTexto: '16 de marzo, 09:10',
    cuerpo:
      'Hola,\n\nEsta es la tercera vez que escribo por el mismo problema: todo el equipo de atención al cliente sigue sin poder entrar al sistema de tickets desde el lunes. Ya perdimos dos días de seguimiento a reclamos de clientes.\n\nNecesitamos una solución hoy mismo, esto ya está afectando el servicio.\n\nSaludos,\nFederico Lombardi',
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTA_SEMANA,
      prioridad: CATEGORIA_PRIORIDAD.URGENTE,
      departamento: CATEGORIA_DEPARTAMENTO.SOPORTE_TECNICO,
    },
  },
  {
    id: 'b2c3',
    remitente: 'Sofía Bianchi',
    emailRemitente: 'sofia.bianchi@empresa.com',
    asunto: 'Recordatorio: evaluación de desempeño pendiente',
    fechaTexto: '3 de marzo, 15:15',
    cuerpo:
      'Hola,\n\nTe recuerdo que todavía no completaste el formulario de autoevaluación de desempeño correspondiente a este semestre. Adjunto el archivo por si no lo tenés a mano.\n\nEl plazo cierra a fin de mes, así que te pido que lo envíes con tiempo para poder coordinar la devolución con tu líder.\n\nGracias,\nSofía Bianchi',
    adjunto: { nombre: 'formulario_autoevaluacion.pdf', tamano: '98 KB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTE_MES,
      prioridad: CATEGORIA_PRIORIDAD.PRIORITARIO,
      departamento: CATEGORIA_DEPARTAMENTO.RRHH,
    },
  },
  {
    id: 'b2c4',
    remitente: 'Tomás Acosta',
    emailRemitente: 'tomas.acosta@empresa.com',
    asunto: 'Seguimiento: orden de compra de equipamiento sin confirmar',
    fechaTexto: '30 de enero, 13:25',
    cuerpo:
      'Hola,\n\nTe escribo por la orden de compra 0128 de las notebooks nuevas, que todavía figura sin confirmar por parte del proveedor. Ya pasó bastante tiempo desde el pedido inicial y el equipo la está esperando.\n\nAdjunto la orden para que la tengas a mano. ¿Podés confirmarme el estado esta semana?\n\nSaludos,\nTomás Acosta',
    adjunto: { nombre: 'orden_compra_0128.pdf', tamano: '145 KB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.MAS_DE_UN_MES,
      prioridad: CATEGORIA_PRIORIDAD.PRIORITARIO,
      departamento: CATEGORIA_DEPARTAMENTO.COMPRAS,
    },
  },
  {
    id: 'b2c5',
    remitente: 'Julieta Medina',
    emailRemitente: 'julieta.medina@empresa.com',
    asunto: '¿Me prestás un cargador tipo C?',
    fechaTexto: '17 de marzo, 13:05',
    cuerpo:
      'Holaa, disculpá la molestia. Se me quedó el cargador de la notebook en casa y tengo una reunión en veinte minutos. ¿Tenés uno tipo C que me puedas prestar hasta la tarde?\n\nTe lo devuelvo antes de irme, prometido.\n\nGracias!\nJulieta',
    clasificacion: {
      fecha: CATEGORIA_FECHA.HOY,
      prioridad: CATEGORIA_PRIORIDAD.PERSONAL,
      departamento: CATEGORIA_DEPARTAMENTO.SOPORTE_TECNICO,
    },
  },
  {
    id: 'b2c6',
    remitente: 'Agustín Rossi',
    emailRemitente: 'agustin.rossi@empresa.com',
    asunto: 'Reintegro del asado del viernes',
    fechaTexto: '16 de marzo, 18:30',
    cuerpo:
      'Hola,\n\nTe paso el resumen de lo que gastamos entre todos para el asado del viernes, para que me reintegres tu parte cuando puedas. Fueron 4200 pesos por persona, incluyendo bebidas.\n\nCualquier cosa avisame si el número no te cierra.\n\nSaludos,\nAgustín',
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTA_SEMANA,
      prioridad: CATEGORIA_PRIORIDAD.PERSONAL,
      departamento: CATEGORIA_DEPARTAMENTO.FINANZAS,
    },
  },
  {
    id: 'b2c7',
    remitente: 'Formación RRHH Online',
    emailRemitente: 'info@formacionrrhh-online.com',
    asunto: 'Últimos cupos: curso online de liderazgo y gestión de personas',
    fechaTexto: '13 de marzo, 08:40',
    cuerpo:
      'Estimado/a,\n\nTe escribimos para contarte que quedan últimos cupos para nuestro curso online de liderazgo y gestión de recursos humanos, con certificado incluido. Ideal para equipos de RRHH que buscan actualizarse.\n\nInscribite antes de fin de mes y accedé a un descuento especial por inscripción anticipada.\n\nEquipo de Formación RRHH Online',
    adjunto: { nombre: 'brochure_curso.pdf', tamano: '2,4 MB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTE_MES,
      prioridad: CATEGORIA_PRIORIDAD.SPAM,
      departamento: CATEGORIA_DEPARTAMENTO.RRHH,
    },
  },
  {
    id: 'b2c8',
    remitente: 'Oficina Total',
    emailRemitente: 'promos@oficinatotal.com.ar',
    asunto: 'Renová el mobiliario de tu oficina con hasta 25% OFF',
    fechaTexto: '12 de febrero, 11:00',
    cuerpo:
      'Estimados,\n\nDescubrí nuestra nueva línea de sillas y escritorios ergonómicos para oficinas, con hasta 25% de descuento por compras corporativas durante este mes.\n\nEscribinos para coordinar una visita a nuestro showroom o pedir un presupuesto sin compromiso.\n\nSaludos,\nOficina Total',
    clasificacion: {
      fecha: CATEGORIA_FECHA.MAS_DE_UN_MES,
      prioridad: CATEGORIA_PRIORIDAD.SPAM,
      departamento: CATEGORIA_DEPARTAMENTO.COMPRAS,
    },
  },
];

const CORPUS_BLOQUE_3: Email[] = [
  {
    id: 'b3c1',
    remitente: 'Carolina Funes',
    emailRemitente: 'carolina.funes@empresa.com',
    asunto: 'After office de hoy a las 19',
    fechaTexto: '17 de marzo, 12:15',
    cuerpo:
      'Holaa, les recuerdo que hoy después de las 19 nos juntamos en la terraza para el after office del mes. Va a haber algo para picar y música.\n\nSi alguien quiere sumar algo o invitar a alguien del equipo, están todos invitados.\n\nNos vemos ahí,\nCarolina',
    clasificacion: {
      fecha: CATEGORIA_FECHA.HOY,
      prioridad: CATEGORIA_PRIORIDAD.PERSONAL,
      departamento: CATEGORIA_DEPARTAMENTO.RRHH,
    },
  },
  {
    id: 'b3c2',
    remitente: 'Ezequiel Paz',
    emailRemitente: 'ezequiel.paz@empresa.com',
    asunto: 'Necesito resolver un tema de obra social antes del jueves',
    fechaTexto: '16 de marzo, 08:50',
    cuerpo:
      'Hola,\n\nTengo un turno médico el jueves y en la obra social me dicen que figuro sin cobertura activa por un tema administrativo de la empresa. Ya llamé dos veces y no consigo que lo resuelvan del otro lado.\n\n¿Podrían gestionarlo con urgencia? Si no se resuelve antes pierdo el turno.\n\nGracias,\nEzequiel Paz',
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTA_SEMANA,
      prioridad: CATEGORIA_PRIORIDAD.URGENTE,
      departamento: CATEGORIA_DEPARTAMENTO.RRHH,
    },
  },
  {
    id: 'b3c3',
    remitente: 'Rocío Ibáñez',
    emailRemitente: 'rocio.ibanez@empresa.com',
    asunto: 'Aprobación del presupuesto del segundo trimestre',
    fechaTexto: '2 de marzo, 10:00',
    cuerpo:
      'Hola,\n\nAdjunto la planilla con el presupuesto propuesto para el segundo trimestre, desglosado por área. Necesitamos tu aprobación para poder cerrarlo con Dirección antes de que arranque el trimestre.\n\nCualquier ajuste que quieras hacer, decime y lo vemos juntos.\n\nSaludos,\nRocío Ibáñez',
    adjunto: { nombre: 'presupuesto_q2.xlsx', tamano: '340 KB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTE_MES,
      prioridad: CATEGORIA_PRIORIDAD.PRIORITARIO,
      departamento: CATEGORIA_DEPARTAMENTO.FINANZAS,
    },
  },
  {
    id: 'b3c4',
    remitente: 'Banco Rioplatense',
    emailRemitente: 'tarjetas@bancorioplatense.com.ar',
    asunto: 'Tu empresa puede acceder a la tarjeta corporativa Rioplatense Business',
    fechaTexto: '28 de enero, 09:30',
    cuerpo:
      'Estimado cliente,\n\nQueremos contarte que tu empresa ya está preaprobada para la tarjeta corporativa Rioplatense Business, con beneficios exclusivos en viajes y sin costo de mantenimiento el primer año.\n\nSolicitala en cualquier sucursal o a través de tu ejecutivo de cuenta.\n\nBanco Rioplatense',
    adjunto: { nombre: 'tarjeta_corporativa.pdf', tamano: '480 KB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.MAS_DE_UN_MES,
      prioridad: CATEGORIA_PRIORIDAD.SPAM,
      departamento: CATEGORIA_DEPARTAMENTO.FINANZAS,
    },
  },
  {
    id: 'b3c5',
    remitente: 'Santiago Molina',
    emailRemitente: 'santiago.molina@empresa.com',
    asunto: 'El sistema de facturación se cayó, nadie puede emitir comprobantes',
    fechaTexto: '17 de marzo, 11:35',
    cuerpo:
      'Hola,\n\nDesde hace una hora el sistema de facturación no responde y ya se está acumulando una fila de clientes esperando su comprobante en el local. Reinicié el servicio dos veces y sigue igual.\n\nNecesito que alguien de guardia lo revise ya, esto está parando la operación.\n\nGracias,\nSantiago Molina',
    clasificacion: {
      fecha: CATEGORIA_FECHA.HOY,
      prioridad: CATEGORIA_PRIORIDAD.URGENTE,
      departamento: CATEGORIA_DEPARTAMENTO.SOPORTE_TECNICO,
    },
  },
  {
    id: 'b3c6',
    remitente: 'Antonella Castro',
    emailRemitente: 'antonella.castro@empresa.com',
    asunto: '¿Tenés un adaptador HDMI de sobra?',
    fechaTexto: '16 de marzo, 15:45',
    cuerpo:
      'Hola! Perdí el adaptador HDMI que usaba para la sala de reuniones y tengo una presentación importante mañana. ¿No tenés uno de sobra que me puedas prestar?\n\nCon que me lo dejes en mi escritorio ya me sirve, gracias total.\n\nSaludos,\nAntonella',
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTA_SEMANA,
      prioridad: CATEGORIA_PRIORIDAD.PERSONAL,
      departamento: CATEGORIA_DEPARTAMENTO.SOPORTE_TECNICO,
    },
  },
  {
    id: 'b3c7',
    remitente: 'Bruno Ortega',
    emailRemitente: 'bruno.ortega@empresa.com',
    asunto: 'Cotización de insumos: necesito tu visto bueno esta semana',
    fechaTexto: '11 de marzo, 16:10',
    cuerpo:
      'Hola,\n\nAdjunto la cotización final del proveedor para los insumos del segundo trimestre. Los precios están sujetos a confirmación hasta el viernes, así que necesitaría tu visto bueno antes de esa fecha para no perder las condiciones.\n\nCualquier duda, la charlamos cuando quieras.\n\nSaludos,\nBruno Ortega',
    adjunto: { nombre: 'cotizacion_insumos.pdf', tamano: '205 KB' },
    clasificacion: {
      fecha: CATEGORIA_FECHA.ESTE_MES,
      prioridad: CATEGORIA_PRIORIDAD.PRIORITARIO,
      departamento: CATEGORIA_DEPARTAMENTO.COMPRAS,
    },
  },
  {
    id: 'b3c8',
    remitente: 'ProveeTech Insumos',
    emailRemitente: 'ventas@proveetech.com.ar',
    asunto: 'Descuentos por volumen en insumos de oficina y tecnología',
    fechaTexto: '3 de febrero, 10:20',
    cuerpo:
      'Estimados,\n\nLes presentamos nuestro catálogo de insumos de oficina y tecnología para empresas, con descuentos especiales por volumen en compras superiores a 50 unidades.\n\nConsultá condiciones de pago y tiempos de entrega escribiendo a este correo.\n\nSaludos,\nProveeTech Insumos',
    clasificacion: {
      fecha: CATEGORIA_FECHA.MAS_DE_UN_MES,
      prioridad: CATEGORIA_PRIORIDAD.SPAM,
      departamento: CATEGORIA_DEPARTAMENTO.COMPRAS,
    },
  },
];

/** Índice 0 = bloque 1 (fecha), índice 1 = bloque 2 (prioridad), índice 2 = bloque 3 (departamento). */
export const CORPUS_POR_BLOQUE: Email[][] = [CORPUS_BLOQUE_1, CORPUS_BLOQUE_2, CORPUS_BLOQUE_3];
