import { Platform } from 'react-native';
import { supabase } from './supabase';

const VAPID_PUBLIC = 'BMtPP7kXWN3YeoYSxZ_Q0Q62UKorMD2MOukNn7zcFXHrXd6IHFeg4MNT6Y9FMMPvnBDu2UytDrm-huHUekhe3Ds';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSuportado(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Já existe inscrição de push neste aparelho?
export async function pushAtivo(): Promise<boolean> {
  if (!pushSuportado()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch { return false; }
}

// Membro ativa os avisos da igreja (palavra do dia etc.)
export async function ativarAvisos(pessoaId?: string | null): Promise<{ ok: boolean; msg: string }> {
  if (!pushSuportado()) {
    return { ok: false, msg: 'Pra receber avisos, instale o app na tela inicial primeiro. 🤍' };
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      return { ok: false, msg: 'Você precisa permitir as notificações pra receber a palavra do dia.' };
    }
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
    }
    const j: any = sub.toJSON();
    const { data, error } = await supabase.rpc('registrar_push', {
      p_endpoint: j.endpoint,
      p_p256dh: j.keys.p256dh,
      p_auth: j.keys.auth,
      p_pessoa: pessoaId ?? null,
    });
    if (error || data !== true) return { ok: false, msg: 'Não foi possível ativar os avisos agora.' };
    return { ok: true, msg: 'Pronto! A partir de amanhã você recebe a Palavra do Dia no celular. 🙏' };
  } catch (e: any) {
    return { ok: false, msg: 'Erro ao ativar: ' + (e?.message || 'tente de novo.') };
  }
}

// Líder de grupo ativa os avisos: registra o aparelho ligado ao grupo (via PIN)
export async function ativarAvisosGrupo(pin: string): Promise<{ ok: boolean; msg: string }> {
  if (!pushSuportado()) {
    return { ok: false, msg: 'Avisos disponíveis no celular pelo app instalado (Adicionar à tela inicial).' };
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      return { ok: false, msg: 'Você precisa permitir as notificações pra receber os avisos.' };
    }
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
    }
    const j: any = sub.toJSON();
    const { data, error } = await supabase.rpc('registrar_push_grupo', {
      p_pin: pin,
      p_endpoint: j.endpoint,
      p_p256dh: j.keys.p256dh,
      p_auth: j.keys.auth,
    });
    if (error || data !== true) {
      return { ok: false, msg: 'Não foi possível ativar os avisos deste grupo.' };
    }
    return { ok: true, msg: 'Avisos ativados! Você será notificado quando alguém entrar no grupo. 🙌' };
  } catch (e: any) {
    return { ok: false, msg: 'Erro ao ativar avisos: ' + (e?.message || 'tente novamente.') };
  }
}
