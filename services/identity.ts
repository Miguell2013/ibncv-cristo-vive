import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const KEY = 'ibncv_identidade';

export type Identidade = {
  pessoaId: string;
  nome: string;
  whatsapp: string;
  email?: string | null;
  nascimento?: string | null; // ISO AAAA-MM-DD
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  endereco?: string | null;
};

export type DadosCadastro = {
  nome: string;
  whatsapp: string;
  email?: string;
  nascimento?: string; // DD/MM/AAAA
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
};

// "DD/MM/AAAA" -> "AAAA-MM-DD" (ou null se inválido)
function isoData(s?: string): string | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

// "AAAA-MM-DD" -> "DD/MM/AAAA" (pra exibir/editar)
export function brData(iso?: string | null): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

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
  d: DadosCadastro
): Promise<{ ok: boolean; error?: string; identidade?: Identidade }> {
  try {
    const pessoaId = uuidv4();
    const rua = d.rua?.trim() || null;
    const numero = d.numero?.trim() || null;
    const bairro = d.bairro?.trim() || null;
    const cidade = d.cidade?.trim() || null;
    const enderecoComposto =
      [rua && numero ? `${rua}, ${numero}` : rua, bairro, cidade].filter(Boolean).join(' - ') || null;

    const { error } = await supabase.from('pessoas').insert({
      id: pessoaId,
      nome_completo: d.nome.trim(),
      whatsapp: d.whatsapp.trim() || null,
      email: d.email?.trim() || null,
      data_nascimento: isoData(d.nascimento),
      rua, numero, bairro, cidade,
      endereco: enderecoComposto,
      tipo: 'membro',
    });
    if (error) return { ok: false, error: 'Não conseguimos salvar agora. Tente de novo.' };

    const identidade: Identidade = {
      pessoaId,
      nome: d.nome.trim(),
      whatsapp: d.whatsapp.trim(),
      email: d.email?.trim() || null,
      nascimento: isoData(d.nascimento),
      rua, numero, bairro, cidade,
      endereco: enderecoComposto,
    };
    await salvarIdentidade(identidade);
    return { ok: true, identidade };
  } catch {
    return { ok: false, error: 'Algo deu errado. Tente novamente.' };
  }
}

export async function atualizarPerfil(
  atual: Identidade,
  d: DadosCadastro
): Promise<{ ok: boolean; error?: string; identidade?: Identidade }> {
  try {
    const rua = d.rua?.trim() || null;
    const numero = d.numero?.trim() || null;
    const bairro = d.bairro?.trim() || null;
    const cidade = d.cidade?.trim() || null;
    const endereco =
      [rua && numero ? `${rua}, ${numero}` : rua, bairro, cidade].filter(Boolean).join(' - ') || null;
    const nascimento = isoData(d.nascimento);
    const nome = d.nome?.trim() || atual.nome;
    const email = d.email?.trim() || null;

    const { error } = await supabase.rpc('atualizar_membro', {
      p_id: atual.pessoaId,
      p_whatsapp: atual.whatsapp,
      p_nome: nome,
      p_email: email,
      p_nascimento: nascimento,
      p_rua: rua,
      p_numero: numero,
      p_bairro: bairro,
      p_cidade: cidade,
      p_endereco: endereco,
    });
    if (error) return { ok: false, error: 'Não conseguimos salvar agora. Tente de novo.' };

    const novo: Identidade = { ...atual, nome, email, nascimento, rua, numero, bairro, cidade, endereco };
    await salvarIdentidade(novo);
    return { ok: true, identidade: novo };
  } catch {
    return { ok: false, error: 'Algo deu errado. Tente novamente.' };
  }
}

export function primeiroNome(nome?: string | null): string {
  if (nome && nome.trim()) return nome.trim().split(' ')[0];
  return 'irmão(ã)';
}
