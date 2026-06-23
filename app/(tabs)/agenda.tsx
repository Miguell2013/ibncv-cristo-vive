import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { supabase, Evento } from '../../services/supabase';

function formatarData(d: string | null): string | null {
  if (!d) return null;
  try {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  } catch { return d; }
}

export default function Agenda() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); carregar(); }}
          tintColor={colors.gold}
        />
      }
    >
      <View style={[styles.body, { maxWidth: maxW }]}>
        <Text style={styles.kicker}>AGENDA</Text>
        <Text style={styles.title}>Nossos cultos e encontros</Text>
        <View style={styles.goldLine} />
        <Text style={styles.subtitle}>Venha estar conosco. Toda semana há um lugar pra você.</Text>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} />
        ) : eventos.length === 0 ? (
          <Text style={styles.empty}>Em breve a programação completa. 🤍</Text>
        ) : (
          eventos.map((e) => (
            <View key={e.id} style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name={(e.icone as any) || 'calendar'} size={24} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{e.titulo}</Text>
                {e.descricao ? <Text style={styles.cardDesc}>{e.descricao}</Text> : null}
                <View style={styles.metaRow}>
                  {e.dia_semana ? (
                    <View style={styles.metaPill}>
                      <Ionicons name="time-outline" size={13} color={colors.goldSoft} />
                      <Text style={styles.metaText}>{e.dia_semana}{e.horario ? ` · ${e.horario}` : ''}</Text>
                    </View>
                  ) : e.data_evento ? (
                    <View style={styles.metaPill}>
                      <Ionicons name="calendar-outline" size={13} color={colors.goldSoft} />
                      <Text style={styles.metaText}>{formatarData(e.data_evento)}{e.horario ? ` · ${e.horario}` : ''}</Text>
                    </View>
                  ) : null}
                  {e.recorrente ? (
                    <View style={styles.metaPill}>
                      <Ionicons name="repeat" size={13} color={colors.greenSoft} />
                      <Text style={[styles.metaText, { color: colors.greenSoft }]}>Toda semana</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  kicker: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 12, letterSpacing: 3 },
  title: { fontFamily: fonts.display, color: colors.text, fontSize: 26, marginTop: 2 },
  goldLine: { width: 56, height: 2, backgroundColor: colors.gold, marginVertical: spacing.sm, borderRadius: 2 },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 22, marginBottom: spacing.lg },

  empty: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: spacing.xxl },

  card: {
    flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },
  cardDesc: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: spacing.sm },
  metaText: { fontFamily: fonts.bodyMedium, color: colors.goldSoft, fontSize: 12 },
});
