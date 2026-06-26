// Efeito sonoro de toque (clique suave) — gerado por código via Web Audio.
// Não precisa de arquivo de áudio. Só web/PWA.

let ctx: AudioContext | null = null;
let habilitado = true;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

export function setSomHabilitado(v: boolean) {
  habilitado = v;
  try { (window as any).localStorage.setItem('ibncv_som', v ? '1' : '0'); } catch {}
}

export function somHabilitado(): boolean {
  try {
    const v = (window as any).localStorage.getItem('ibncv_som');
    if (v === '0') return false;
  } catch {}
  return habilitado;
}

// Toca um clique curto e suave.
export function playTap() {
  if (!somHabilitado()) return;
  const c = getCtx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.03);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch {}
}
