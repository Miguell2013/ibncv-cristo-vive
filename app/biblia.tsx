import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, fonts, radius, spacing, shadow, img } from '../constants/theme';
import { fetchLivros, fetchLivroPorOrdem, fetchVersiculos, fetchAudioUrl, type Livro, type Versiculo } from '../services/biblia';

export default function Biblia() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 760);
  const params = useLocalSearchParams<{ order?: string; chapter?: string }>();

  const [test, setTest] = useState<'AT' | 'NT'>('AT');
  const [livros, setLivros] = useState<Livro[]>([]);
  const [livro, setLivro] = useState<Livro | null>(null);
  const [cap, setCap] = useState<number | null>(null);
  const [versos, setVersos] = useState<Versiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [carregandoCap, setCarregandoCap] = useState(false);

  // áudio
  const [audioLoading, setAudioLoading] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [audioMsg, setAudioMsg] = useState<string | null>(null);
  const audioRef = useRef<any>(null);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    fetchLivros(test).then((l) => { if (vivo) { setLivros(l); setLoading(false); } });
    return () => { vivo = false; };
  }, [test]);

  const abrirCapitulo = useCallback(async (l: Livro, n: number) => {
    pararAudio();
    setLivro(l); setCap(n); setVersos([]); setCarregandoCap(true);
    if (l.testament !== test) setTest(l.testament);
    const v = await fetchVersiculos(l.id, n);
    setVersos(v); setCarregandoCap(false);
  }, [test]);

  // abrir direto de um link (plano de leitura)
  useEffect(() => {
    if (!params?.order) return;
    const ord = parseInt(String(params.order), 10);
    const ch = parseInt(String(params.chapter || '1'), 10) || 1;
    fetchLivroPorOrdem(ord).then((l) => { if (l) abrirCapitulo(l, ch); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.order, params?.chapter]);

  function pararAudio() {
    try { audioRef.current?.pause?.(); } catch {}
    audioRef.current = null;
    setTocando(false);
  }

  async function ouvir() {
    if (tocando) { pararAudio(); return; }
    if (!livro || !cap || !versos.length) return;
    setAudioMsg(null); setAudioLoading(true);
    const texto = versos.map((v) => v.text).join(' ');
    const url = await fetchAudioUrl(livro.name, cap, texto);
    setAudioLoading(false);
    if (!url) { setAudioMsg('Áudio indisponível neste momento.'); return; }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const a = new (window as any).Audio(url);
        audioRef.current = a;
        a.onended = () => setTocando(false);
        await a.play();
        setTocando(true);
      } catch { setAudioMsg('Não foi possível tocar o áudio.'); }
    } else {
      setAudioMsg('Áudio disponível na versão web.');
    }
  }

  // ——— LEITOR (capítulo aberto) ———
  if (livro && cap) {
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
          <View style={[styles.body, { maxWidth: maxW }]}>
            <View style={styles.leitorTop}>
              <Pressable onPress={() => { pararAudio(); setCap(null); }} hitSlop={12} style={styles.voltarBtn}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </Pressable>
              <Text style={styles.leitorTitulo} numberOfLines={1}>{livro.name} {cap}</Text>
              <Pressable onPress={ouvir} hitSlop={12} style={styles.audioBtn}>
                {audioLoading ? <ActivityIndicator color={colors.gold} size="small" /> : (
                  <Ionicons name={tocando ? 'pause' : 'volume-high'} size={20} color={colors.gold} />
                )}
              </Pressable>
            </View>
            {audioMsg ? <Text style={styles.audioMsg}>{audioMsg}</Text> : null}

            {carregandoCap ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} /> : (
              <View style={styles.versosWrap}>
                {versos.map((v) => (
                  <Text key={v.verse_num} style={styles.verso}>
                    <Text style={styles.versoNum}>{v.verse_num} </Text>{v.text}
                  </Text>
                ))}
              </View>
            )}

            {/* navegação de capítulo */}
            <View style={styles.navCap}>
              <Pressable disabled={cap <= 1} onPress={() => abrirCapitulo(livro, cap - 1)} style={[styles.navBtn, cap <= 1 && styles.navOff]}>
                <Ionicons name="chevron-back" size={18} color={cap <= 1 ? colors.textFaint : colors.bg} />
                <Text style={[styles.navTxt, cap <= 1 && { color: colors.textFaint }]}>Anterior</Text>
              </Pressable>
              <Pressable disabled={cap >= livro.chapters_count} onPress={() => abrirCapitulo(livro, cap + 1)} style={[styles.navBtn, cap >= livro.chapters_count && styles.navOff]}>
                <Text style={[styles.navTxt, cap >= livro.chapters_count && { color: colors.textFaint }]}>Próximo</Text>
                <Ionicons name="chevron-forward" size={18} color={cap >= livro.chapters_count ? colors.textFaint : colors.bg} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ——— GRADE DE CAPÍTULOS ———
  if (livro) {
    const caps = Array.from({ length: livro.chapters_count }, (_, i) => i + 1);
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        <View style={[styles.body, { maxWidth: maxW }]}>
          <View style={styles.leitorTop}>
            <Pressable onPress={() => setLivro(null)} hitSlop={12} style={styles.voltarBtn}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
            <Text style={styles.leitorTitulo}>{livro.name}</Text>
            <View style={{ width: 36 }} />
          </View>
          <Text style={styles.subtl}>Escolha o capítulo</Text>
          <View style={styles.capGrid}>
            {caps.map((n) => (
              <Pressable key={n} style={styles.capCell} onPress={() => abrirCapitulo(livro, n)}>
                <Text style={styles.capNum}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // ——— LISTA DE LIVROS ———
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltarTopo}><Ionicons name="chevron-back" size={24} color={colors.gold} /></Pressable>

        <View style={styles.headerWrap}>
          <Image source={{ uri: img.logo }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>BÍBLIA SAGRADA</Text>
          <Text style={styles.subtitle}>Almeida (Bíblia Livre) · com áudio</Text>
        </View>

        {/* atalho plano de leitura */}
        <Pressable style={styles.planoCard} onPress={() => router.push('/plano' as any)}>
          <View style={styles.planoIcon}><Ionicons name="calendar" size={20} color={colors.gold} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planoTitulo}>Plano de Leitura Anual</Text>
            <Text style={styles.planoSub}>Leia a Bíblia em 1 ano — canônico ou cronológico</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gold} />
        </Pressable>

        {/* atalho dicionário */}
        <Pressable style={styles.planoCard} onPress={() => router.push('/dicionario' as any)}>
          <View style={styles.planoIcon}><Ionicons name="search" size={20} color={colors.gold} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planoTitulo}>Dicionário Bíblico</Text>
            <Text style={styles.planoSub}>Significado de termos com original e Strong</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gold} />
        </Pressable>

        {/* AT / NT */}
        <View style={styles.testRow}>
          <Pressable style={[styles.testBtn, test === 'AT' && styles.testOn]} onPress={() => setTest('AT')}>
            <Text style={[styles.testTxt, test === 'AT' && { color: colors.bg }]}>Antigo Testamento</Text>
          </Pressable>
          <Pressable style={[styles.testBtn, test === 'NT' && styles.testOn]} onPress={() => setTest('NT')}>
            <Text style={[styles.testTxt, test === 'NT' && { color: colors.bg }]}>Novo Testamento</Text>
          </Pressable>
        </View>

        {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} /> : (
          <View style={styles.livrosWrap}>
            {livros.map((l) => (
              <Pressable key={l.id} style={styles.livroCell} onPress={() => setLivro(l)}>
                <Text style={styles.livroNome} numberOfLines={1}>{l.name}</Text>
                <Text style={styles.livroCaps}>{l.chapters_count}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const CARD = '#0F1E36';
const TILE = '#0B1626';
const HAIR = 'rgba(212,175,55,0.22)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  voltarTopo: { position: 'absolute', left: spacing.md, top: 14, zIndex: 20 },
  headerWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 150, height: 75, marginTop: -8, marginBottom: -8 },
  title: { fontFamily: fonts.display, color: colors.gold, fontSize: 26, letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 4 },

  planoCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: CARD, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: HAIR, marginBottom: spacing.lg, ...shadow.glow },
  planoIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: TILE, borderWidth: 1.5, borderColor: colors.gold },
  planoTitulo: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15 },
  planoSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, marginTop: 2 },

  testRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  testBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: TILE, borderWidth: 1, borderColor: HAIR },
  testOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  testTxt: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 13 },

  livrosWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  livroCell: { width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: HAIR },
  livroNome: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 14, flex: 1 },
  livroCaps: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, marginLeft: 6 },

  subtl: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginBottom: spacing.md, alignSelf: 'flex-start' },
  capGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, width: '100%' },
  capCell: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: CARD, borderWidth: 1, borderColor: HAIR, alignItems: 'center', justifyContent: 'center' },
  capNum: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 16 },

  leitorTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: spacing.sm },
  voltarBtn: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  leitorTitulo: { fontFamily: fonts.displaySemi, color: colors.gold, fontSize: 20, flex: 1, textAlign: 'center' },
  audioBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gold, backgroundColor: TILE },
  audioMsg: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: spacing.sm },

  versosWrap: { width: '100%', backgroundColor: CARD, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: HAIR },
  verso: { fontFamily: fonts.body, color: colors.text, fontSize: 16, lineHeight: 27, marginBottom: 6 },
  versoNum: { fontFamily: fonts.bodyBold, color: colors.gold, fontSize: 12 },

  navCap: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, width: '100%', marginTop: spacing.lg },
  navBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.sm + 2 },
  navOff: { backgroundColor: TILE, borderWidth: 1, borderColor: HAIR },
  navTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 13 },
});
