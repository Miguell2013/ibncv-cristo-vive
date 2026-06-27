import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { fetchPlanos, fetchDiasPlano, type PlanoLeitura, type DiaPlano } from '../services/biblia';

const CARD = '#0F1E36';
const TILE = '#0B1626';
const HAIR = 'rgba(212,175,55,0.22)';

function diaDoAno(): number {
  const now = new Date();
  const ini = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - ini.getTime();
  return Math.min(365, Math.floor(diff / 86400000));
}

function lidosKey(planId: string) { return `ibncv_plano_${planId}`; }
function carregarLidos(planId: string): Set<number> {
  try {
    const raw = (window as any)?.localStorage?.getItem(lidosKey(planId));
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}
function salvarLidos(planId: string, s: Set<number>) {
  try { (window as any)?.localStorage?.setItem(lidosKey(planId), JSON.stringify([...s])); } catch {}
}

export default function Plano() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 760);

  const [planos, setPlanos] = useState<PlanoLeitura[]>([]);
  const [sel, setSel] = useState<PlanoLeitura | null>(null);
  const [dias, setDias] = useState<DiaPlano[]>([]);
  const [loading, setLoading] = useState(true);
  const [carregandoDias, setCarregandoDias] = useState(false);
  const [lidos, setLidos] = useState<Set<number>>(new Set());

  const hoje = diaDoAno();

  useEffect(() => { fetchPlanos().then((p) => { setPlanos(p); setLoading(false); }); }, []);

  const escolher = useCallback(async (p: PlanoLeitura) => {
    setSel(p); setDias([]); setCarregandoDias(true);
    setLidos(carregarLidos(p.id));
    const d = await fetchDiasPlano(p.id);
    setDias(d); setCarregandoDias(false);
  }, []);

  function toggleLido(n: number) {
    if (!sel) return;
    setLidos((prev) => {
      const s = new Set(prev);
      s.has(n) ? s.delete(n) : s.add(n);
      salvarLidos(sel.id, s);
      return s;
    });
  }

  function abrir(d: DiaPlano) {
    const p = d.passages?.[0];
    if (!p) return;
    router.push({ pathname: '/biblia', params: { order: String(p.order), chapter: String(p.start) } } as any);
  }

  // ——— LISTA DE DIAS ———
  if (sel) {
    const total = sel.total_days || dias.length;
    const feitos = lidos.size;
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        <View style={[styles.body, { maxWidth: maxW }]}>
          <View style={styles.topRow}>
            <Pressable onPress={() => setSel(null)} hitSlop={12} style={styles.voltarBtn}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
            <Text style={styles.topTitle} numberOfLines={1}>{sel.name}</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.progressoCard}>
            <Text style={styles.progressoTxt}><Text style={styles.progressoNum}>{feitos}</Text> de {total} dias lidos</Text>
            <View style={styles.barBg}><View style={[styles.barFill, { width: `${Math.round((feitos / total) * 100)}%` }]} /></View>
          </View>

          {carregandoDias ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} /> : (
            dias.map((d) => {
              const lido = lidos.has(d.day_number);
              const ehHoje = d.day_number === hoje;
              return (
                <View key={d.day_number} style={[styles.diaCard, ehHoje && styles.diaHoje]}>
                  <Pressable onPress={() => toggleLido(d.day_number)} hitSlop={8} style={[styles.check, lido && styles.checkOn]}>
                    {lido && <Ionicons name="checkmark" size={15} color={colors.bg} />}
                  </Pressable>
                  <Pressable style={{ flex: 1 }} onPress={() => abrir(d)}>
                    <Text style={styles.diaLabel}>Dia {d.day_number}{ehHoje ? '  ·  hoje' : ''}</Text>
                    <Text style={[styles.diaRef, lido && styles.diaRefLido]}>{d.reference}</Text>
                  </Pressable>
                  <Pressable onPress={() => abrir(d)} hitSlop={8}><Ionicons name="book-outline" size={18} color={colors.gold} /></Pressable>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    );
  }

  // ——— ESCOLHA DE PLANO ———
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltarBtn}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
          <Text style={styles.topTitle}>Plano de Leitura</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.intro}>Leia a Bíblia inteira em um ano. Escolha um plano e acompanhe seu progresso.</Text>

        {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} /> : (
          planos.map((p) => (
            <Pressable key={p.id} style={styles.planoCard} onPress={() => escolher(p)}>
              <View style={styles.planoIcon}>
                <Ionicons name={p.plan_type === 'cronologico' ? 'time' : 'list'} size={22} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planoNome}>{p.name}</Text>
                <Text style={styles.planoDesc}>{p.plan_type === 'cronologico' ? 'Na ordem dos acontecimentos' : 'Na ordem dos livros'} · {p.total_days} dias</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gold} />
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: spacing.sm },
  voltarBtn: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  topTitle: { fontFamily: fonts.displaySemi, color: colors.gold, fontSize: 20, flex: 1, textAlign: 'center' },
  intro: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: spacing.lg },

  planoCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: CARD, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: HAIR, marginBottom: spacing.md, ...shadow.float },
  planoIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: TILE, borderWidth: 1.5, borderColor: colors.gold },
  planoNome: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 16 },
  planoDesc: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12.5, marginTop: 2 },

  progressoCard: { width: '100%', backgroundColor: CARD, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: HAIR, marginBottom: spacing.md },
  progressoTxt: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 13, marginBottom: 8 },
  progressoNum: { fontFamily: fonts.bodyBold, color: colors.gold },
  barBg: { height: 8, borderRadius: 4, backgroundColor: TILE, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.gold },

  diaCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: CARD, borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: HAIR, marginBottom: spacing.sm },
  diaHoje: { borderColor: colors.gold },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.gold },
  diaLabel: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 11, letterSpacing: 0.5 },
  diaRef: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 15, marginTop: 1 },
  diaRefLido: { color: colors.textFaint, textDecorationLine: 'line-through' },
});
