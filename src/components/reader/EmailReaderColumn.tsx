import { Download, Mail, Paperclip } from 'lucide-react';
import type { InboxItemState } from '../../engine/useEmailQueue';

interface EmailReaderColumnProps {
  item: InboxItemState | null;
}

export function EmailReaderColumn({ item }: EmailReaderColumnProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-none items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Mail size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-900">Correo abierto</h2>
      </header>

      {!item ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
          <Mail size={32} strokeWidth={1.5} />
          <p className="text-sm">Seleccioná un correo para leerlo</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-14 flex-none text-slate-400">De:</dt>
              <dd className="min-w-0 text-slate-800">
                {item.email.remitente}{' '}
                <span className="text-slate-400">&lt;{item.email.emailRemitente}&gt;</span>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 flex-none text-slate-400">Asunto:</dt>
              <dd className="font-medium text-slate-900">{item.email.asunto}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 flex-none text-slate-400">Fecha:</dt>
              <dd className="text-slate-800">{item.email.fechaTexto}</dd>
            </div>
          </dl>

          <div className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
            {item.email.cuerpo}
          </div>

          {item.email.adjunto && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Paperclip size={16} className="flex-none text-slate-400" />
              <span className="flex-1 truncate text-sm text-slate-700">
                {item.email.adjunto.nombre}
              </span>
              <span className="flex-none text-xs text-slate-400">{item.email.adjunto.tamano}</span>
              <button
                type="button"
                className="flex-none text-slate-400 transition hover:text-slate-600"
                aria-label="Descargar adjunto"
              >
                <Download size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
