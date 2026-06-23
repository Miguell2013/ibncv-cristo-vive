import { Platform } from 'react-native';
import { supabase } from './supabase';

export type AuthResult = { ok: boolean; error?: string };

function traduzErro(msg: string): string {
  const m = (msg || '').toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já tem conta. Tente entrar.';
  if (m.includes('password') && m.includes('6')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (m.includes('email')) return 'E-mail inválido.';
  return 'Algo deu errado. Tente novamente.';
}

// Criar conta (membro) — acesso na hora (confirmação de e-mail desligada no Supabase)
export async function signUp(nome: string, email: string, senha: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { full_name: nome.trim() } },
    });
    if (error) return { ok: false, error: traduzErro(error.message) };

    const uid = data.user?.id;
    if (uid) {
      // cria/garante o registro de pessoa no CRM (não bloqueia o login se falhar)
      await supabase.from('pessoas').insert({
        auth_user_id: uid,
        nome_completo: nome.trim(),
        email: email.trim(),
        tipo: 'membro',
      });
    }
    // Se a confirmação de e-mail estiver desligada, já vem sessão. Senão, tenta entrar.
    if (!data.session) {
      await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Algo deu errado. Tente novamente.' };
  }
}

export async function signIn(email: string, senha: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) return { ok: false, error: traduzErro(error.message) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Algo deu errado. Tente novamente.' };
  }
}

export async function signOut(): Promise<void> {
  try { await supabase.auth.signOut(); } catch {}
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const redirectTo =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'ibncv://';
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) return { ok: false, error: traduzErro(error.message) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Algo deu errado. Tente novamente.' };
  }
}

// Nome amigável do usuário logado (vem do JWT, sem consultar o banco)
export function nomeDoUsuario(user: any): string {
  const full = user?.user_metadata?.full_name as string | undefined;
  if (full && full.trim()) return full.trim().split(' ')[0]; // primeiro nome
  const email = user?.email as string | undefined;
  return email ? email.split('@')[0] : 'irmão(ã)';
}
