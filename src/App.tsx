import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useCallback, useEffect, useState } from 'react';
import { DistractorPopup } from './components/distractors/DistractorPopup';
import { FoldersColumn } from './components/folders/FoldersColumn';
import { InboxColumn } from './components/inbox/InboxColumn';
import { AppShell } from './components/layout/AppShell';
import { EmailReaderColumn } from './components/reader/EmailReaderColumn';
import { StartScreen } from './components/screens/StartScreen';
import { SummaryScreen } from './components/screens/SummaryScreen';
import {
  DISTRACTOR_SECUENCIA,
  DISTRACTOR_VOLUMEN_DEFAULT_PCT,
  type DistractorLevel,
} from './config/distractors.config';
import { SESSION_CONFIG } from './config/session.config';
import { evaluarClasificacion } from './domain/classification';
import type { CriterionId } from './domain/types';
import { useDistractorPopups } from './engine/useDistractorPopups';
import { useEmailQueue } from './engine/useEmailQueue';
import { useSessionEngine } from './engine/useSessionEngine';
import { descargarCsv } from './logging/csvExporter';
import {
  contarIntentosPrevios,
  crearEventoDescartado,
  crearEventoIntento,
  type SessionEvent,
} from './logging/eventLog';

interface FocusFlowSesionProps {
  duracionesBloqueMin: number[];
  onCambiarDuracion: (indice: number, minutos: number) => void;
  volumenesPopup: Record<DistractorLevel, number>;
  onCambiarVolumen: (nivel: DistractorLevel, porcentaje: number) => void;
  distractoresPorBloque: DistractorLevel[][];
  onCambiarDistractorBloque: (indice: number, nivel: DistractorLevel, activo: boolean) => void;
  /** Reinicia la sesión volviendo la duración y el volumen a sus valores por defecto, para que otro participante pueda empezar sin recargar la página. */
  onReiniciarNuevoParticipante: () => void;
  /** Reinicia la sesión conservando la duración y el volumen ya configurados. */
  onReiniciarMismaConfig: () => void;
}

function FocusFlowSesion({
  duracionesBloqueMin,
  onCambiarDuracion,
  volumenesPopup,
  onCambiarVolumen,
  distractoresPorBloque,
  onCambiarDistractorBloque,
  onReiniciarNuevoParticipante,
  onReiniciarMismaConfig,
}: FocusFlowSesionProps) {
  const emailQueue = useEmailQueue();
  const [participanteId, setParticipanteId] = useState<string>(SESSION_CONFIG.participanteDefault);
  const [pestanaActiva, setPestanaActiva] = useState<CriterionId>(SESSION_CONFIG.ordenCriterios[0]);
  const [eventos, setEventos] = useState<SessionEvent[]>([]);
  const [recienClasificadoId, setRecienClasificadoId] = useState<string | null>(null);
  const [errorCarpetaId, setErrorCarpetaId] = useState<string | null>(null);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [aciertosBloque, setAciertosBloque] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  function distractoresDelBloque(bloqueNumero: number): DistractorLevel[] {
    return distractoresPorBloque[bloqueNumero - 1] ?? [];
  }

  const engine = useSessionEngine({
    duracionesBloqueMs: duracionesBloqueMin.map((min) => Math.round(min * 60_000)),
    onEmailArrival: (email, ctx) => {
      // Solo el primer correo de TODA la sesión se abre solo (bloque 1). En
      // los bloques siguientes, esPrimerCorreoDelBloque también es true para
      // su primer correo, pero abrirlo automáticamente le robaría el foco
      // del panel de lectura al correo que el participante ya tenía
      // abierto, dando la sensación de que la bandeja se desordena.
      const esElPrimeroDeLaSesion = ctx.esPrimerCorreoDelBloque && ctx.bloqueNumero === 1;
      emailQueue.agregarCorreo(email, ctx.arrivalTsMs, esElPrimeroDeLaSesion);
    },
    // Al cambiar el criterio, los correos que quedaron sin clasificar NO se
    // descartan: siguen en la bandeja y pasan a evaluarse contra el nuevo
    // criterio vigente (evaluarClasificacion ya usa el criterio actual, no
    // el que regía cuando el correo llegó).
    onBlockEnd: () => {},
    onSessionEnd: (ctx) => {
      const descartes = emailQueue.pendientes.map((item) =>
        crearEventoDescartado({
          participante: participanteId,
          bloque: ctx.bloqueNumero,
          criterioVigente: ctx.criterioVigente,
          distractorBloque: distractoresDelBloque(ctx.bloqueNumero),
          email: item.email,
          tLlegadaMs: item.arrivalTsMs,
          tPrimeraAperturaMs: item.firstOpenedTsMs,
        }),
      );
      if (descartes.length > 0) {
        setEventos((prev) => [...prev, ...descartes]);
      }
    },
  });

  const sesionActiva = engine.fase === 'bloque' || engine.fase === 'pausa';
  const nivelesBloqueActual = distractoresDelBloque(engine.bloqueNumero);
  const distractores = useDistractorPopups(sesionActiva, nivelesBloqueActual);

  // Los aciertos que hacen falta para avanzar de bloque se cuentan solo
  // dentro del bloque vigente: se reinician tanto si el bloque cambió por
  // tiempo como si cambió por haber llegado al umbral.
  useEffect(() => {
    setAciertosBloque(0);
  }, [engine.bloqueNumero]);

  // El feedback rojo se limpia acá, no en FolderDropZone: como FoldersColumn
  // solo renderiza las carpetas de la pestaña activa, si el timer viviera en
  // el componente y el participante cambiara de pestaña y volviera antes de
  // que se cumpliera, se remonta y repite la animación desde cero.
  useEffect(() => {
    if (errorTrigger === 0) return;
    const id = window.setTimeout(() => setErrorCarpetaId(null), SESSION_CONFIG.errorFeedbackDuracionMs);
    return () => window.clearTimeout(id);
  }, [errorTrigger]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);

    const emailId = String(event.active.id);
    const carpetaDestino = event.over ? String(event.over.id) : null;
    if (!carpetaDestino) return;

    const item = emailQueue.pendientes.find((p) => p.email.id === emailId);
    if (!item || item.firstOpenedTsMs === null) return;

    const resultado = evaluarClasificacion({
      email: item.email,
      criterioVigente: engine.criterioVigente,
      pestanaActiva,
      carpetaDestino,
    });

    const evento = crearEventoIntento({
      participante: participanteId,
      bloque: engine.bloqueNumero,
      criterioVigente: engine.criterioVigente,
      distractorBloque: nivelesBloqueActual,
      email: item.email,
      tLlegadaMs: item.arrivalTsMs,
      tPrimeraAperturaMs: item.firstOpenedTsMs,
      tUltimaAperturaMs: item.lastOpenedTsMs ?? item.firstOpenedTsMs,
      tDropMs: engine.ahoraMs(),
      pestanaActiva,
      carpetaDestino,
      resultado,
      intentoNro: contarIntentosPrevios(eventos, emailId) + 1,
    });
    setEventos((prev) => [...prev, evento]);

    if (resultado.correcto) {
      setRecienClasificadoId(emailId);
      window.setTimeout(() => {
        emailQueue.removerCorreo(emailId);
        setRecienClasificadoId(null);
      }, 500);

      const siguienteAciertos = aciertosBloque + 1;
      setAciertosBloque(siguienteAciertos);
      if (siguienteAciertos >= SESSION_CONFIG.aciertosParaAvanzar) {
        engine.forzarFinDeBloque();
      }
    } else {
      setErrorCarpetaId(carpetaDestino);
      setErrorTrigger((t) => t + 1);
    }
  }

  function handleVolverAlInicio() {
    const confirmar = window.confirm('¿Volver al inicio? Se perderá el progreso de la sesión actual.');
    if (confirmar) {
      onReiniciarMismaConfig();
    }
  }

  if (engine.fase === 'inicio') {
    return (
      <StartScreen
        participanteId={participanteId}
        onCambiarParticipanteId={setParticipanteId}
        duracionesBloqueMin={duracionesBloqueMin}
        onCambiarDuracion={onCambiarDuracion}
        volumenesPopup={volumenesPopup}
        onCambiarVolumen={onCambiarVolumen}
        distractoresPorBloque={distractoresPorBloque}
        onCambiarDistractorBloque={onCambiarDistractorBloque}
        onStart={engine.iniciar}
      />
    );
  }

  if (engine.fase === 'fin') {
    return (
      <SummaryScreen
        eventos={eventos}
        onDescargar={() => descargarCsv(eventos)}
        onReiniciarNuevoParticipante={onReiniciarNuevoParticipante}
        onReiniciarMismaConfig={onReiniciarMismaConfig}
      />
    );
  }

  const correoAbierto =
    emailQueue.pendientes.find((p) => p.email.id === emailQueue.correoSeleccionadoId) ?? null;
  const activeItem = activeId
    ? (emailQueue.pendientes.find((p) => p.email.id === activeId) ?? null)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <AppShell onVolverAlInicio={handleVolverAlInicio}>
        <InboxColumn
          items={emailQueue.pendientes}
          seleccionadoId={emailQueue.correoSeleccionadoId}
          recienClasificadoId={recienClasificadoId}
          onAbrir={(id) => emailQueue.abrirCorreo(id, engine.ahoraMs())}
        />
        <EmailReaderColumn item={correoAbierto} />
        <FoldersColumn
          pestanaActiva={pestanaActiva}
          onCambiarPestana={setPestanaActiva}
          errorCarpetaId={errorCarpetaId}
        />
      </AppShell>

      <DragOverlay>
        {activeItem ? (
          <div className="w-72 rounded-xl border border-blue-300 bg-white p-3 shadow-lg">
            <p className="truncate text-sm font-medium text-slate-900">
              {activeItem.email.remitente}
            </p>
            <p className="truncate text-sm text-slate-500">{activeItem.email.asunto}</p>
          </div>
        ) : null}
      </DragOverlay>

      {distractores.popup && (
        <DistractorPopup
          key={distractores.popup.id}
          popupId={distractores.popup.id}
          nivel={distractores.popup.nivel}
          volumenPct={volumenesPopup[distractores.popup.nivel]}
          onClose={distractores.cerrar}
        />
      )}
    </DndContext>
  );
}

function duracionesPorDefecto(): number[] {
  return SESSION_CONFIG.ordenCriterios.map(() => SESSION_CONFIG.duracionBloqueMinDefault);
}

function volumenesPorDefecto(): Record<DistractorLevel, number> {
  return Object.fromEntries(
    DISTRACTOR_SECUENCIA.map((nivel) => [nivel, DISTRACTOR_VOLUMEN_DEFAULT_PCT]),
  ) as Record<DistractorLevel, number>;
}

/** Por defecto cada bloque arranca con un único nivel asignado, en el mismo orden que antes recorría el ciclo automático. */
function distractoresPorDefecto(): DistractorLevel[][] {
  return DISTRACTOR_SECUENCIA.map((nivel) => [nivel]);
}

export default function App() {
  // Cambiar el key remonta FocusFlowSesion desde cero: reinicia de una todo
  // su estado (bandeja, eventos, motor de bloques, pop-ups) sin necesidad de
  // recargar la página. La duración y el volumen viven acá arriba, fuera de
  // ese remount, para poder decidir si se reinician a su valor por defecto o
  // se conservan tal como quedaron configurados.
  const [sessionKey, setSessionKey] = useState(0);
  const [duracionesBloqueMin, setDuracionesBloqueMin] = useState<number[]>(duracionesPorDefecto);
  const [volumenesPopup, setVolumenesPopup] =
    useState<Record<DistractorLevel, number>>(volumenesPorDefecto);
  const [distractoresPorBloque, setDistractoresPorBloque] =
    useState<DistractorLevel[][]>(distractoresPorDefecto);

  const handleCambiarDuracion = useCallback((indice: number, minutos: number) => {
    setDuracionesBloqueMin((prev) => prev.map((valor, i) => (i === indice ? minutos : valor)));
  }, []);

  const handleCambiarVolumen = useCallback((nivel: DistractorLevel, porcentaje: number) => {
    setVolumenesPopup((prev) => ({ ...prev, [nivel]: porcentaje }));
  }, []);

  const handleCambiarDistractorBloque = useCallback(
    (indice: number, nivel: DistractorLevel, activo: boolean) => {
      setDistractoresPorBloque((prev) =>
        prev.map((niveles, i) => {
          if (i !== indice) return niveles;
          const siguientes = activo ? [...niveles, nivel] : niveles.filter((n) => n !== nivel);
          // Se reordena según DISTRACTOR_SECUENCIA para que el ciclado dentro
          // del bloque (ver useDistractorPopups) sea siempre el mismo orden
          // canónico, sin depender de en qué orden se tildaron los checkboxes.
          return DISTRACTOR_SECUENCIA.filter((n) => siguientes.includes(n));
        }),
      );
    },
    [],
  );

  const handleReiniciarNuevoParticipante = useCallback(() => {
    setDuracionesBloqueMin(duracionesPorDefecto());
    setVolumenesPopup(volumenesPorDefecto());
    setDistractoresPorBloque(distractoresPorDefecto());
    setSessionKey((k) => k + 1);
  }, []);

  const handleReiniciarMismaConfig = useCallback(() => {
    setSessionKey((k) => k + 1);
  }, []);

  return (
    <FocusFlowSesion
      key={sessionKey}
      duracionesBloqueMin={duracionesBloqueMin}
      onCambiarDuracion={handleCambiarDuracion}
      volumenesPopup={volumenesPopup}
      onCambiarVolumen={handleCambiarVolumen}
      distractoresPorBloque={distractoresPorBloque}
      onCambiarDistractorBloque={handleCambiarDistractorBloque}
      onReiniciarNuevoParticipante={handleReiniciarNuevoParticipante}
      onReiniciarMismaConfig={handleReiniciarMismaConfig}
    />
  );
}
