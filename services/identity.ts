import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const KEY = 'ibncv_identidade';

export type Identidade = {
  pessoaId: string;
  nome: string;
  whatsapp: string;
  email?: string | null;
};

// UUID v4 simples (suficiente pra identificar a pessoa sem depender de libs)
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getIdentidade(): Promise<Identidade | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Identidade) : null;
  } catch {
    return null;
  }
}

export async function salvarIdentidade(id: Identidade): Promise<void> {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(id)); } catch {}
}

export async function sair(): Promise<void> {
  try { await AsyncStorage.removeItem(KEY); } catch {}
}

// Identifica a pessoa (sem senha): cria o registro no CRM e guarda no aparelho.
export async function identificar(
  nome: string,
  whatsapp: string,
  email?: string
): Promise<{ ok: boolean; error?: string; identidade?: Identidade }> {
  try {
    const pessoaId = uuidv4();
    const { error } = await supabase.from('pessoas').insert({
      id: pessoaId,
      nome_completo: nome.trim(),
      whatsapp: whatsapp.trim() || null,
      email: email?.trim() || null,
      tipo: 'membro',
    });
    if (error) return { ok: false, error: 'Não conseguimos salvar agora. Tente de novo.' };

    const identidade: Identidade = {
      pessoaId,
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      email: email?.trim() || null,
    };
    await salvarIdentidade(identidade);
    return { ok: true, identidade };
  } catch {
    return { ok: false, error: 'Algo deu errado. Tente novamente.' };
  }
}

export function primeiroNome(nome?: string | null): string {
  if (nome && nome.trim()) return nome.trim().split(' ')[0];
  return 'irmão(ã)';
}
