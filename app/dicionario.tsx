import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { fetchDicionario, type TermoDic } from '../services/biblia';

const CARD = '#0F1E36';
const TILE = '#0B1626';
const HAIR = 'rgba(212,175,55,0.22)';

function semAcento(s: string) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function Dicionario() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 760);

  const [termos, setTermos] = useState<TermoDic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<string | null>(null);

  useEffect(() => { fetchDicionario().then((t) => { setTermos(t); setLoading(false); }); }, []);

  const filtrados = useMemo(() => {
    const q = semAcento(busca.trim());
    if (!q) return termos;
    return termos.filter((t) => semAcento(t.term).includes(q) || semAcento(t.definition).includes(q));
  }, [busca, termos]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltarBtn}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
          <Text style={styles.topTitle}>Dicionário Bíblico</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.buscaWrap}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            style={styles.busca}
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar termo..."
            placeholderTextColor={colors.textFaint}
          />
          {busca.length > 0 && (
            <Pressable onPress={() => setBusca('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={colors.textFaint} /></Pressable>
          )}
        </View>

        {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} /> : (
          <>
            {filtrados.length === 0 && <Text style={styles.vazio}>Nenhum termo encontrado.</Text>}
            {filtrados.map((t) => {
              const open = aberto === t.term;
              return (
                <Pressable key={t.term} style={styles.card} onPress={() => setAberto(open ? null : t.term)}>
                  <View style={styles.cardHead}>
                    <Text style={styles.termo}>{t.term}</Text>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.gold} />
                  </View>
                  {(t.original || t.transliteration) ? (
                    <Text style={styles.original}>
                      {t.original ? t.original : ''}{t.transliteration ? `  ·  ${t.transliteration}` : ''}{t.strong ? `  ·  ${t.strong}` : ''}
                    </Text>
                  ) : null}
                  {open && (
                    <>
                      <Text style={styles.definicao}>{t.definition}</Text>
                      {t.reference ? <Text style={styles.ref}>{t.reference}</Text> : null}
                    </>
                  )}
                </Pressable>
              );
            })}
            <Text style={styles.rodape}>{termos.length} termos · em expansão</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: spacing.md },
  voltarBtn: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  topTitle: { fontFamily: fonts.displaySemi, color: colors.gold, fontSize: 20, flex: 1, textAlign: 'center' },

  buscaWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: TILE, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderWidth: 1, borderColor: HAIR, marginBottom: spacing.md },
  busca: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 },

  card: { width: '100%', backgroundColor: CARD, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: HAIR, marginBottom: spacing.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  termo: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 17 },
  original: { fontFamily: fonts.body, color: colors.goldSoft, fontSize: 13, marginTop: 3 },
  definicao: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14.5, lineHeight: 22, marginTop: spacing.sm },
  ref: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 12, marginTop: spacing.sm },

  vazio: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: spacing.xl },
  rodape: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.lg },
});
