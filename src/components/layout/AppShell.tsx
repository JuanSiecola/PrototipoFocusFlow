import { Mail, Timer } from 'lucide-react';
import type { ReactNode } from 'react';

interface AppShellProps {
  clasificados: number;
  totalCorreos: number;
  tiempoSesionMs: number;
  children: ReactNode;
}

function formatearTiempo(ms: number): string {
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${String(seg).padStart(2, '0')}`;
}

export function AppShell({ clasificados, totalCorreos, tiempoSesionMs, children }: AppShellProps) {
  const progreso = totalCorreos > 0 ? Math.min(1, clasificados / totalCorreos) : 0;

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex flex-none items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Mail size={20} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">FocusFlow</h1>
        </div>

        <div className="flex items-center gap-5">
          <div
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-600"
            title="Tiempo transcurrido de la sesión"
          >
            <Timer size={16} />
            <span className="text-sm font-semibold tabular-nums">{formatearTiempo(tiempoSesionMs)}</span>
          </div>

          <div className="w-64">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Correos clasificados</span>
              <span className="text-sm font-semibold text-slate-900">
                {clasificados} / {totalCorreos}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${progreso * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-3 gap-4 overflow-hidden p-4">{children}</main>
    </div>
  );
}
