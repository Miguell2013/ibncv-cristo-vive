import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, Platform, Linking,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { supabase } from '../services/supabase';

export default function Estudos() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const maxW = Math.min(width, 760);
  const params = useLocalSearchParams<{ url?: string; titulo?: string }>();

  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState<{ url: string; titulo: string } | null>(
    params?.url ? { url: String(params.url), titulo: String(params.titulo || 'Estudo') } : null
  );

  const carregar = useCallback(async () => {
    const r = await supabase.from('estudos').select('*').order('atual', { ascending: false }).order('ordem');
    setLista((r.data as any[]) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  // --- VISUALIZADOR (estudo aberto) ---
  if (aberto) {
    const frameH = Math.max(420, height - (insets.top + 96));
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => (params?.url ? router.back() : setAberto(null))} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.text} /></Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>{aberto.titulo}</Text>
          <Pressable onPress={() => Linking.openURL(aberto.url)} hitSlop={12}><Ionicons name="open-outline" size={22} color={colors.gold} /></Pressable>
        </View>
        {Platform.OS === 'web' ? (
          React.createElement('iframe', { src: aberto.url, style: { width: '100%', height: frameH, border: 'none', backgroundColor: '#fff' }, title: aberto.titulo })
        ) : (
          <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => Linking.openURL(aberto.url)}>
            <Ionicons name="book" size={20} color={colors.bg} /><Text style={styles.btnTxt}>Abrir o estudo</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // --- LISTA / ARQUIVO ---
  const atuais = lista.filter((e) => e.atual);
  const arquivados = lista.filter((e) => !e.atual);

  const Card = ({ e }: { e: any }) => (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => e.url && setAberto({ url: e.url, titulo: e.titulo })}>
      {e.imagem ? <Image source={{ uri: e.imagem }} style={styles.cardImg} resizeMode="cover" /> : null}
      <View style={styles.cardOverlay} />
      <View style={styles.cardTagWrap}><Text style={styles.cardTag}>{e.tag}</Text></View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{e.titulo}</Text>
        {e.descricao ? <Text style={styles.cardSub} numberOfLines={1}>{e.descricao}</Text> : null}
      </View>
      <View style={styles.cardIcon}><Ionicons name="book" size={16} color={colors.gold} /></View>
    </Pressable>
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.text} /></Pressable>
          <Text style={styles.topTitle}>Estudos</Text>
          <View style={{ width: 26 }} />
        </View>

        {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} /> : (
          <>
            {atuais.length > 0 && <Text style={styles.sec}>Em andamento</Text>}
            {atuais.map((e) => <Card key={e.id} e={e} />)}

            {arquivados.length > 0 && <Text style={[styles.sec, { marginTop: spacing.lg }]}>Arquivo</Text>}
            {arquivados.map((e) => <Card key={e.id} e={e} />)}

            {lista.length === 0 && <Text style={styles.vazio}>Em breve novos estudos. 🤍</Text>}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, width: '100%' },
  topTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 17, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },

  sec: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18, alignSelf: 'flex-start', marginBottom: spacing.sm, marginTop: spacing.xs },
  card: { width: '100%', height: 130, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.surface, marginBottom: spacing.md, justifyContent: 'flex-end', ...shadow.float },
  cardImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,9,15,0.45)' },
  cardTagWrap: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  cardTag: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 10, letterSpacing: 1 },
  cardText: { padding: spacing.md },
  cardTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },
  cardSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },
  cardIcon: { position: 'absolute', bottom: spacing.md, right: spacing.md, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gold },

  vazio: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: spacing.xxl },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md, margin: spacing.lg },
  btnTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 15 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
