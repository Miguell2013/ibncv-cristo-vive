import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform, Linking,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { supabase } from '../services/supabase';

const CANAL_URL = 'https://www.youtube.com/@IgrejaBatistaNacionalAbaeté';

export default function AoVivo() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 760);
  const playerW = Math.min(width, maxW) - spacing.md * 2;
  const playerH = Math.round((playerW * 9) / 16);

  const [canalId, setCanalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from('config').select('valor').eq('chave', 'youtube_channel_id').maybeSingle();
    setCanalId((data?.valor || '').trim() || null);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const embedUrl = canalId
    ? `https://www.youtube.com/embed/live_stream?channel=${canalId}&autoplay=1&rel=0`
    : null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.text} /></Pressable>
          <View style={styles.aoVivoTag}><View style={styles.dot} /><Text style={styles.aoVivoTxt}>AO VIVO</Text></View>
          <View style={{ width: 26 }} />
        </View>

        <Text style={styles.titulo}>Culto ao vivo</Text>
        <Text style={styles.sub}>Participe de onde você estiver. Quando não houver transmissão, você vê o último culto. 🤍</Text>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} />
        ) : embedUrl && Platform.OS === 'web' ? (
          <View style={[styles.playerWrap, { width: playerW, height: playerH }]}>
            {React.createElement('iframe', {
              src: embedUrl,
              width: '100%',
              height: '100%',
              frameBorder: '0',
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
              allowFullScreen: true,
              style: { border: 'none', borderRadius: 14 },
            })}
          </View>
        ) : (
          <Pressable style={({ pressed }) => [styles.fallback, pressed && styles.pressed]} onPress={() => Linking.openURL(CANAL_URL)}>
            <Ionicons name="logo-youtube" size={40} color={colors.danger} />
            <Text style={styles.fallbackTxt}>{embedUrl ? 'Toque pra abrir o culto no YouTube' : 'A transmissão será configurada em breve.'}</Text>
            <Text style={styles.fallbackLink}>Abrir canal no YouTube</Text>
          </Pressable>
        )}

        <Pressable style={({ pressed }) => [styles.canalBtn, pressed && styles.pressed]} onPress={() => Linking.openURL(CANAL_URL)}>
          <Ionicons name="logo-youtube" size={18} color={colors.text} />
          <Text style={styles.canalBtnTxt}>Ver o canal e cultos anteriores</Text>
        </Pressable>

        <Text style={styles.verso}>“Onde estiverem dois ou três reunidos em meu nome, ali estou no meio deles.” — Mateus 18.20</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md, alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: spacing.md },
  aoVivoTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.danger },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  aoVivoTxt: { fontFamily: fonts.bodyBold, color: colors.danger, fontSize: 11, letterSpacing: 1 },

  titulo: { fontFamily: fonts.display, color: colors.text, fontSize: 24, textAlign: 'center', marginTop: spacing.xs },
  sub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: spacing.xs, marginBottom: spacing.lg },

  playerWrap: { backgroundColor: '#000', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.gold, ...shadow.glow },

  fallback: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  fallbackTxt: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: spacing.lg },
  fallbackLink: { fontFamily: fonts.bodyBold, color: colors.gold, fontSize: 14, marginTop: spacing.xs },

  canalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.lg },
  canalBtnTxt: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 14 },

  verso: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: spacing.xl, lineHeight: 18 },
  pressed: { opacity: 0.85 },
});
