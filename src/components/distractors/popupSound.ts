import type { DistractorLevel } from '../../config/distractors.config';

let audioContext: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function reproducirTono(
  ctx: AudioContext,
  frecuencia: number,
  inicioSeg: number,
  duracionSeg: number,
  volumen: number,
  forma: OscillatorType,
) {
  const oscilador = ctx.createOscillator();
  const ganancia = ctx.createGain();
  oscilador.type = forma;
  oscilador.frequency.value = frecuencia;
  oscilador.connect(ganancia);
  ganancia.connect(ctx.destination);

  const inicio = ctx.currentTime + inicioSeg;
  const fin = inicio + duracionSeg;
  ganancia.gain.setValueAtTime(0, inicio);
  ganancia.gain.linearRampToValueAtTime(volumen, inicio + 0.01);
  ganancia.gain.linearRampToValueAtTime(0, fin);

  oscilador.start(inicio);
  oscilador.stop(fin + 0.02);
}

/**
 * Sonido de cada nivel de pop-up, sintetizado con Web Audio (sin archivos
 * externos). Funciona sin bloqueo de autoplay porque para esta altura de la
 * sesión ya hubo un gesto del usuario (el click en "Comenzar").
 *
 * `volumenPct` (0-100) escala el volumen "de diseño" de cada tono: 100 =
 * los valores tal cual están abajo, 0 = silencio. Es el mismo % que se
 * configura en la pantalla de inicio.
 */
export function reproducirSonidoPopup(nivel: DistractorLevel, volumenPct: number): void {
  const factor = Math.min(100, Math.max(0, volumenPct)) / 100;
  if (factor === 0) return;

  const ctx = obtenerContexto();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  if (nivel === 'nivel1') {
    // Ding único y liviano, tipo notificación de navegador.
    reproducirTono(ctx, 900, 0, 0.1, 0.045 * factor, 'sine');
    return;
  }

  if (nivel === 'nivel2') {
    // Campanita suave de dos notas, tipo notificación de Windows.
    reproducirTono(ctx, 587, 0, 0.12, 0.045 * factor, 'sine');
    reproducirTono(ctx, 784, 0.1, 0.16, 0.045 * factor, 'sine');
    return;
  }

  // nivel3: chirrido de alerta de dos tonos.
  reproducirTono(ctx, 585, 0, 0.12, 0.03 * factor, 'square');
  reproducirTono(ctx, 784, 0.1, 0.12, 0.03 * factor, 'square');
}
