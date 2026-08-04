import { Mail } from 'lucide-react';
import type { ReactNode } from 'react';

interface AppShellProps {
  clasificados: number;
  totalBloque: number;
  children: ReactNode;
}

export function AppShell({ clasificados, totalBloque, children }: AppShellProps) {
  const progreso = totalBloque > 0 ? Math.min(1, clasificados / totalBloque) : 0;

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex flex-none items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Mail size={20} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">FocusFlow</h1>
        </div>

        <div className="w-64">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500">Correos clasificados</span>
            <span className="text-sm font-semibold text-slate-900">
              {clasificados} / {totalBloque}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progreso * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-3 gap-4 overflow-hidden p-4">{children}</main>
    </div>
  );
}
