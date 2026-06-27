import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// A Bíblia (texto + áudio + planos) já está hospedada no projeto Amara Kiala.
// Lemos de lá com a chave ANON (pública), apenas leitura, protegido por RLS.
const BIBLIA_URL = 'https://mfqcgsjnclokmcbujsiw.supabase.co';
const BIBLIA_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcWNnc2puY2xva21jYnVqc2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDUwODUsImV4cCI6MjA5NTU4MTA4NX0.cvR8J4KvQZjSrANMlM9IPJYy7OIp-w-C8qRiF8J9dqc';

const LANG = 'pt';
const VERSION = 'BLIVRE';

const biblia = createClient(BIBLIA_URL, BIBLIA_ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type Livro = {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'AT' | 'NT';
  chapters_count: number;
  order_num: number;
};
export type Versiculo = { verse_num: number; text: string };
export type PlanoLeitura = {
  id: string;
  name: string;
  description: string | null;
  plan_type: string;
  total_days: number;
};
export type DiaPlano = {
  day_number: number;
  reference: string;
  passages: { book: string; order: number; start: number; end: number; testament: 'AT' | 'NT' }[];
};

// ——— Livros ———
export async function fetchLivros(testament: 'AT' | 'NT'): Promise<Livro[]> {
  const { data } = await biblia
    .from('bible_books')
    .select('id,name,abbreviation,testament,chapters_count,order_num')
    .eq('language', LANG).eq('version', VERSION).eq('testament', testament)
    .order('order_num');
  return (data as Livro[]) ?? [];
}

export async function fetchLivroPorOrdem(orderNum: number): Promise<Livro | null> {
  const { data } = await biblia
    .from('bible_books')
    .select('id,name,abbreviation,testament,chapters_count,order_num')
    .eq('language', LANG).eq('version', VERSION).eq('order_num', orderNum)
    .limit(1).maybeSingle();
  return (data as Livro) ?? null;
}

// ——— Versículos de um capítulo ———
export async function fetchVersiculos(bookId: string, chapter: number): Promise<Versiculo[]> {
  const { data: cap } = await biblia
    .from('bible_chapters').select('id')
    .eq('book_id', bookId).eq('chapter_num', chapter).limit(1).maybeSingle();
  if (!cap) return [];
  const { data } = await biblia
    .from('bible_verses').select('verse_num,text')
    .eq('chapter_id', (cap as any).id).order('verse_num');
  return (data as Versiculo[]) ?? [];
}

// ——— Áudio (voz neural via edge function bible-tts no Amara) ———
export async function fetchAudioUrl(book: string, chapter: number, text: string): Promise<string | null> {
  try {
    const { data, error } = await biblia.functions.invoke('bible-tts', {
      body: { lang: LANG, book, chapter, text },
    });
    if (error) return null;
    return (data as any)?.url ?? null;
  } catch {
    return null;
  }
}

// ——— Planos de leitura ———
export async function fetchPlanos(): Promise<PlanoLeitura[]> {
  const { data } = await biblia
    .from('reading_plans')
    .select('id,name,description,plan_type,total_days')
    .eq('language', LANG).eq('is_published', true)
    .order('sort_order');
  return (data as PlanoLeitura[]) ?? [];
}

export async function fetchDiasPlano(planId: string): Promise<DiaPlano[]> {
  const { data } = await biblia
    .from('reading_plan_days')
    .select('day_number,reference,passages')
    .eq('plan_id', planId)
    .order('day_number');
  return (data as DiaPlano[]) ?? [];
}
