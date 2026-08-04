import { CheckCircle2, Download } from 'lucide-react';
import type { AttemptEvent, SessionEvent } from '../../logging/eventLog';

interface SummaryScreenProps {
  eventos: SessionEvent[];
  onDescargar: () => void;
}

export function SummaryScreen({ eventos, onDescargar }: SummaryScreenProps) {
  const intentos = eventos.filter((e): e is AttemptEvent => e.tipo === 'intento');
  const descartados = eventos.filter((e) => e.tipo === 'descartado');
  const correctos = intentos.filter((e) => e.correcto).length;
  const fallidos = intentos.filter((e) => !e.correcto).length;
  const totalCorreos = correctos + descartados.length;

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Sesión finalizada</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gracias por completar la actividad. Este es un resumen de tu sesión.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-3">
          <Stat label="Correos clasificados" value={`${correctos} / ${totalCorreos}`} />
          <Stat label="Sin clasificar" value={String(descartados.length)} />
          <Stat label="Intentos totales" value={String(intentos.length)} />
          <Stat label="Intentos fallidos" value={String(fallidos)} />
        </dl>

        <button
          type="button"
          onClick={onDescargar}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
        >
          <Download size={16} />
          Descargar CSV
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-left">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
