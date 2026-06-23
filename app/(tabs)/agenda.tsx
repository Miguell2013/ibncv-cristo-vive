import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, shadow, img } from '../../constants/theme';
import { supabase, Evento } from '../../services/supabase';

export default function Agenda() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);
  const cardW = Math.min(width - spacing.md * 2, maxW - spacing.md * 2);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lembrar, setLembrar] = useState<Record<string, boolean>>({});

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true });
    setEventos((data as Evento[]) || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl, alignItems: 'center' }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor={colors.gold} />
      }
    >
      <View style={[styles.body, { maxWidth: maxW }]}>
        <Image source={{ uri: img.logo }} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>AGENDA</Text>
        <View style={styles.goldLine} />
        <Text style={styles.subtitle}>Participe dos nossos cultos e eventos.</Text>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} />
        ) : eventos.length === 0 ? (
          <Text style={styles.empty}>Em breve a programação completa. 🤍</Text>
        ) : (
          eventos.map((e) => (
            <View key={e.id} style={styles.card}>
              {e.imagem_url ? (
                <Image
                  source={{ uri: e.imagem_url }}
                  style={[styles.banner, { width: cardW, height: cardW * 0.52 }]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.bannerFallback, { width: cardW, height: cardW * 0.52 }]}>
                  <Ionicons name={(e.icone as any) || 'calendar'} size={36} color={colors.gold} />
                  <Text style={styles.fallbackTitle}>{e.titulo}</Text>
                </View>
              )}
              <View style={styles.cardFooter}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{e.titulo}</Text>
                  <Text style={styles.cardWhen}>
                    {[e.dia_semana, e.horario].filter(Boolean).join(' · ') || 'Em breve'}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.lembrarBtn, lembrar[e.id] && styles.lembrarOn, pressed && styles.pressed]}
                  onPress={() => setLembrar((s) => ({ ...s, [e.id]: !s[e.id] }))}
                >
                  <Ionicons
                    name={lembrar[e.id] ? 'notifications' : 'notifications-outline'}
                    size={16}
                    color={lembrar[e.id] ? colors.bg : colors.gold}
                  />
                  <Text style={[styles.lembrarText, lembrar[e.id] && { color: colors.bg }]}>
                    {lembrar[e.id] ? 'Lembrete on' : 'Lembrar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <View style={styles.notice}>
          <View style={styles.noticeIcon}>
            <Ionicons name="calendar" size={22} color={colors.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Não perca nenhum evento!</Text>
            <Text style={styles.noticeSub}>Ative os lembretes e participe.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md, alignItems: 'center' },

  logo: { width: 96, height: 54, marginBottom: spacing.sm },
  title: { fontFamily: fonts.display, color: colors.gold, fontSize: 34, letterSpacing: 4 },
  goldLine: { width: 56, height: 2, backgroundColor: colors.gold, marginVertical: spacing.sm, borderRadius: 2 },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg, textAlign: 'center' },

  empty: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: spacing.xxl },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gold, marginBottom: spacing.lg, overflow: 'hidden', ...shadow.glow },
  banner: { backgroundColor: colors.surfaceAlt },
  bannerFallback: { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  fallbackTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  cardTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 17 },
  cardWhen: { fontFamily: fonts.bodyMedium, color: colors.goldSoft, fontSize: 13, marginTop: 2 },
  lembrarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.gold,
  },
  lembrarOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  lembrarText: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 13 },

  notice: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.neon, marginTop: spacing.sm, width: '100%', ...shadow.neonGlow },
  noticeIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.green },
  noticeTitle: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15 },
  noticeSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
