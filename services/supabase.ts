import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// SEGURANÇA: aqui só usamos a chave ANON, protegida por RLS.
// NUNCA usar a service_role key ou senha do banco no app.
// Os valores vêm de variáveis de ambiente. NUNCA commitar o .env.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const webStorage = {
  getItem: (k: string) => {
    try { return typeof window !== 'undefined' ? window.localStorage.getItem(k) : null; }
    catch { return null; }
  },
  setItem: (k: string, v: string) => {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(k, v); } catch {}
  },
  removeItem: (k: string) => {
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(k); } catch {}
  },
};
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Faltam variáveis de ambiente. Crie .env com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    _client = createClient(
      url || 'https://placeholder.supabase.co',
      key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwbGFjZWhvbGRlciJ9.placeholder',
      { auth: { storage: AsyncStorage, autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
    );
  } else {
    _client = createClient(url, key, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
        flowType: 'implicit',
      },
    });
  }
  return _client;
}

export const supabase = {
  get auth() { return getClient().auth; },
  get from() { const c = getClient(); return c.from.bind(c); },
  get rpc() { const c = getClient(); return c.rpc.bind(c); },
  get functions() { return getClient().functions; },
  get channel() { const c = getClient(); return c.channel.bind(c); },
  get removeChannel() { const c = getClient(); return c.removeChannel.bind(c); },
};

// ---- Tipos do banco da igreja ----

export type Pessoa = {
  id: string;
  auth_user_id: string | null;
  nome_completo: string;
  whatsapp: string | null;
  email: string | null;
  tipo: 'visitante' | 'novo_convertido' | 'membro';
  como_conheceu: string | null;
  primeira_visita: string | null;
  status: string | null;
  responsavel: string | null;
  observacoes: string | null;
  created_at: string;
};

export type PedidoOracao = {
  id: string;
  pessoa_id: string | null;
  autor_nome: string | null;
  area: string | null;
  texto: string;
  permitir_whatsapp: boolean | null;
  publico: boolean;
  status: string | null;
  created_at: string;
};

export type Evento = {
  id: string;
  titulo: string;
  descricao: string | null;
  dia_semana: string | null;
  data_evento: string | null;
  horario: string | null;
  icone: string | null;
  recorrente: boolean | null;
  ativo: boolean;
  ordem: number | null;
  created_at: string;
};
