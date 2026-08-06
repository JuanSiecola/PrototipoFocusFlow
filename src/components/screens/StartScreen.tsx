import { Mail } from 'lucide-react';
import type { ChangeEvent, FocusEvent } from 'react';
import { DISTRACTOR_CONTENIDO, DISTRACTOR_SECUENCIA, type DistractorLevel } from '../../config/distractors.config';
import { SESSION_CONFIG } from '../../config/session.config';

interface StartScreenProps {
  duracionesBloqueMin: number[];
  onCambiarDuracion: (indice: number, minutos: number) => void;
  volumenesPopup: Record<DistractorLevel, number>;
  onCambiarVolumen: (nivel: DistractorLevel, porcentaje: number) => void;
  onStart: () => void;
}

const DURACION_MIN = 1;
const DURACION_MAX = 30;

export function StartScreen({
  duracionesBloqueMin,
  onCambiarDuracion,
  volumenesPopup,
  onCambiarVolumen,
  onStart,
}: StartScreenProps) {
  const handleChange = (indice: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.valueAsNumber;
    onCambiarDuracion(indice, Number.isNaN(valor) ? 0 : valor);
  };

  const handleBlur = (indice: number) => (e: FocusEvent<HTMLInputElement>) => {
    const valor = Math.min(DURACION_MAX, Math.max(DURACION_MIN, Number(e.target.value) || DURACION_MIN));
    onCambiarDuracion(indice, valor);
  };

  const handleCambiarVolumen = (nivel: DistractorLevel) => (e: ChangeEvent<HTMLInputElement>) => {
    onCambiarVolumen(nivel, e.target.valueAsNumber);
  };

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

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Duración de cada bloque
          </p>
          <div className="mt-3 space-y-2">
            {SESSION_CONFIG.ordenCriterios.map((criterioId, indice) => (
              <div key={criterioId} className="flex items-center justify-between gap-3">
                <label htmlFor={`duracion-${criterioId}`} className="text-sm text-slate-600">
                  Bloque {indice + 1}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`duracion-${criterioId}`}
                    type="number"
                    inputMode="numeric"
                    min={DURACION_MIN}
                    max={DURACION_MAX}
                    step={1}
                    value={duracionesBloqueMin[indice]}
                    onChange={handleChange(indice)}
                    onBlur={handleBlur(indice)}
                    className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-sm text-slate-400">min</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Volumen de los pop-ups
          </p>
          <div className="mt-3 space-y-3">
            {DISTRACTOR_SECUENCIA.map((nivel) => (
              <div key={nivel} className="flex items-center gap-3">
                <label htmlFor={`volumen-${nivel}`} className="w-36 flex-none truncate text-sm text-slate-600">
                  {DISTRACTOR_CONTENIDO[nivel].titulo}
                </label>
                <input
                  id={`volumen-${nivel}`}
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={volumenesPopup[nivel]}
                  onChange={handleCambiarVolumen(nivel)}
                  className="h-1.5 flex-1 accent-blue-600"
                />
                <span className="w-10 flex-none text-right text-sm text-slate-400">
                  {volumenesPopup[nivel]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
