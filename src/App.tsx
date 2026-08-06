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
import { useCallback, useState } from 'react';
import { DistractorPopup } from './components/distractors/DistractorPopup';
import { ErrorToast } from './components/feedback/ErrorToast';
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

export default function App() {
  const emailQueue = useEmailQueue();
  const [pestanaActiva, setPestanaActiva] = useState<CriterionId>(SESSION_CONFIG.ordenCriterios[0]);
  const [eventos, setEventos] = useState<SessionEvent[]>([]);
  const [totalClasificados, setTotalClasificados] = useState(0);
  const [recienClasificadoId, setRecienClasificadoId] = useState<string | null>(null);
  const [errorToastTrigger, setErrorToastTrigger] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [duracionesBloqueMin, setDuracionesBloqueMin] = useState<number[]>(() =>
    SESSION_CONFIG.ordenCriterios.map(() => SESSION_CONFIG.duracionBloqueMinDefault),
  );
  const [volumenesPopup, setVolumenesPopup] = useState<Record<DistractorLevel, number>>(() =>
    Object.fromEntries(DISTRACTOR_SECUENCIA.map((nivel) => [nivel, DISTRACTOR_VOLUMEN_DEFAULT_PCT])) as Record<
      DistractorLevel,
      number
    >,
  );

  const handleDismissErrorToast = useCallback(() => setErrorToastTrigger(0), []);

  const handleCambiarDuracion = useCallback((indice: number, minutos: number) => {
    setDuracionesBloqueMin((prev) => prev.map((valor, i) => (i === indice ? minutos : valor)));
  }, []);

  const handleCambiarVolumen = useCallback((nivel: DistractorLevel, porcentaje: number) => {
    setVolumenesPopup((prev) => ({ ...prev, [nivel]: porcentaje }));
  }, []);

  const engine = useSessionEngine({
    duracionesBloqueMs: duracionesBloqueMin.map((min) => Math.round(min * 60_000)),
    onEmailArrival: (email, ctx) => {
      emailQueue.agregarCorreo(email, ctx.arrivalTsMs, ctx.esPrimerCorreoDelBloque);
    },
    // Al cambiar el criterio, los correos que quedaron sin clasificar NO se
    // descartan: siguen en la bandeja y pasan a evaluarse contra el nuevo
    // criterio vigente (evaluarClasificacion ya usa el criterio actual, no
    // el que regía cuando el correo llegó).
    onBlockEnd: () => {},
    onSessionEnd: (ctx) => {
      const descartes = emailQueue.pendientes.map((item) =>
        crearEventoDescartado({
          participante: SESSION_CONFIG.participanteDefault,
          bloque: ctx.bloqueNumero,
          criterioVigente: ctx.criterioVigente,
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
  const distractores = useDistractorPopups(sesionActiva);

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
      participante: SESSION_CONFIG.participanteDefault,
      bloque: engine.bloqueNumero,
      criterioVigente: engine.criterioVigente,
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
      setTotalClasificados((n) => n + 1);
      setRecienClasificadoId(emailId);
      window.setTimeout(() => {
        emailQueue.removerCorreo(emailId);
        setRecienClasificadoId(null);
      }, 500);
    } else {
      setErrorToastTrigger((t) => t + 1);
    }
  }

  if (engine.fase === 'inicio') {
    return (
      <StartScreen
        duracionesBloqueMin={duracionesBloqueMin}
        onCambiarDuracion={handleCambiarDuracion}
        volumenesPopup={volumenesPopup}
        onCambiarVolumen={handleCambiarVolumen}
        onStart={engine.iniciar}
      />
    );
  }

  if (engine.fase === 'fin') {
    return <SummaryScreen eventos={eventos} onDescargar={() => descargarCsv(eventos)} />;
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
      <AppShell
        clasificados={totalClasificados}
        totalCorreos={SESSION_CONFIG.correosPorBloque * SESSION_CONFIG.ordenCriterios.length}
        tiempoSesionMs={engine.tiempoSesionMs}
      >
        <InboxColumn
          items={emailQueue.pendientes}
          seleccionadoId={emailQueue.correoSeleccionadoId}
          recienClasificadoId={recienClasificadoId}
          onAbrir={(id) => emailQueue.abrirCorreo(id, engine.ahoraMs())}
        />
        <EmailReaderColumn item={correoAbierto} />
        <FoldersColumn pestanaActiva={pestanaActiva} onCambiarPestana={setPestanaActiva} />
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

      <ErrorToast trigger={errorToastTrigger} onDismiss={handleDismissErrorToast} />

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
