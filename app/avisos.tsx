import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { supabase } from '../services/supabase';
import { useIdentity } from '../contexts/identity';

function dataBR(iso?: string | null) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return ''; }
}

export default function Avisos() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);
  const { identidade, identificado } = useIdentity();

  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    if (!identidade?.pessoaId) { setLoading(false); return; }
    const r = await supabase.rpc('minhas_notificacoes', { p_id: identidade.pessoaId });
    setLista((r.data as any[]) ?? []);
    setLoading(false);
    await supabase.rpc('marcar_notificacoes_lidas', { p_id: identidade.pessoaId });
  }, [identidade?.pessoaId]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.text} /></Pressable>
          <Text style={styles.topTitle}>Avisos</Text>
          <View style={{ width: 26 }} />
        </View>

        {!identificado ? (
          <View style={styles.vazio}>
            <Ionicons name="notifications-off-outline" size={36} color={colors.textFaint} />
            <Text style={styles.vazioTxt}>Cadastre-se pra receber os avisos da igreja. 🤍</Text>
            <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => router.push('/entrar' as any)}>
              <Text style={styles.btnTxt}>Fazer cadastro</Text>
            </Pressable>
          </View>
        ) : loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} />
        ) : lista.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="notifications-outline" size={36} color={colors.textFaint} />
            <Text style={styles.vazioTxt}>Você não tem avisos por enquanto. 🙏</Text>
          </View>
        ) : (
          lista.map((n) => (
            <View key={n.id} style={[styles.card, !n.lida && styles.cardNova]}>
              <View style={styles.cardHead}>
                <Ionicons name="heart" size={16} color={colors.gold} />
                <Text style={styles.cardTitulo}>{n.titulo}</Text>
                {!n.lida && <View style={styles.dot} />}
              </View>
              {n.corpo ? <Text style={styles.cardCorpo}>{n.corpo}</Text> : null}
              <Text style={styles.cardData}>{dataBR(n.created_at)}</Text>
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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  topTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },

  vazio: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  vazioTxt: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center' },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...shadow.float },
  cardNova: { borderColor: colors.gold },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  cardTitulo: { flex: 1, fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.gold },
  cardCorpo: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  cardData: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, marginTop: spacing.sm },

  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  btnTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 14 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
