import { Mail } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Mail size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">FocusFlow</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Vas a recibir correos en tu bandeja de entrada. Abrilos y arrastralos a la carpeta que
          corresponda, en la columna de la derecha.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
