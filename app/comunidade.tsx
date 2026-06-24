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

export default function Comunidade() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);
  const { identidade, identificado } = useIdentity();

  const [deps, setDeps] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [meusDeps, setMeusDeps] = useState<string[]>([]);
  const [meuGrupo, setMeuGrupo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    const [d, g] = await Promise.all([
      supabase.from('departamentos').select('*').eq('ativo', true).order('ordem'),
      supabase.from('grupos_comunhao').select('*').eq('ativo', true).order('ordem'),
    ]);
    setDeps((d.data as any[]) ?? []);
    setGrupos((g.data as any[]) ?? []);
    if (identidade?.pessoaId) {
      const m = await supabase.rpc('meus_departamentos', { p_id: identidade.pessoaId });
      setMeusDeps(((m.data as any[]) ?? []).map((x) => x.id));
    }
    setLoading(false);
  }, [identidade?.pessoaId]);

  useEffect(() => { carregar(); }, [carregar]);

  async function participar(grupoId: string) {
    if (!identidade?.pessoaId) { router.push('/entrar' as any); return; }
    setMeuGrupo(grupoId);
    await supabase.rpc('entrar_grupo', { p_id: identidade.pessoaId, p_whatsapp: identidade.whatsapp, p_grupo: grupoId });
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.text} /></Pressable>
          <Text style={styles.topTitle}>Comunidade</Text>
          <View style={{ width: 26 }} />
        </View>

        {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} /> : (
          <>
            {/* DEPARTAMENTOS */}
            <Text style={styles.sec}>Departamentos</Text>
            <Text style={styles.secSub}>
              {identificado ? 'Você é parte do(s) departamento(s) marcado(s).' : 'Cadastre-se pra ser direcionado ao seu departamento.'}
            </Text>
            <View style={styles.grid}>
              {deps.map((d) => {
                const meu = meusDeps.includes(d.id);
                return (
                  <View key={d.id} style={[styles.depCard, meu && styles.depCardOn]}>
                    <Ionicons name={(d.icone as any) || 'people'} size={26} color={meu ? colors.gold : colors.textMuted} />
                    <Text style={[styles.depNome, meu && { color: colors.text }]}>{d.nome}</Text>
                    {meu && <View style={styles.meuBadge}><Ionicons name="checkmark" size={12} color={colors.bg} /></View>}
                  </View>
                );
              })}
            </View>

            {/* GRUPOS DE COMUNHÃO */}
            <Text style={[styles.sec, { marginTop: spacing.xl }]}>Grupos de Comunhão</Text>
            <Text style={styles.secSub}>Pequenos grupos pra crescer e cuidar uns dos outros.</Text>
            {grupos.length === 0 ? (
              <View style={styles.vazio}>
                <Ionicons name="home-outline" size={32} color={colors.textFaint} />
                <Text style={styles.vazioTxt}>Em breve os grupos vão aparecer aqui. 🙏</Text>
              </View>
            ) : (
              grupos.map((g) => {
                const dentro = meuGrupo === g.id;
                return (
                  <View key={g.id} style={styles.grupoCard}>
                    <Text style={styles.grupoNome}>{g.nome}</Text>
                    {g.lider ? <Text style={styles.grupoInfo}><Ionicons name="person" size={13} color={colors.goldSoft} /> Líder: {g.lider}</Text> : null}
                    {(g.dia_semana || g.horario) ? <Text style={styles.grupoInfo}><Ionicons name="time" size={13} color={colors.goldSoft} /> {[g.dia_semana, g.horario].filter(Boolean).join(' · ')}</Text> : null}
                    {(g.endereco || g.bairro) ? <Text style={styles.grupoInfo}><Ionicons name="location" size={13} color={colors.goldSoft} /> {[g.endereco, g.bairro].filter(Boolean).join(' - ')}</Text> : null}
                    <Pressable style={({ pressed }) => [dentro ? styles.btnDentro : styles.btn, pressed && styles.pressed]} onPress={() => participar(g.id)} disabled={dentro}>
                      <Text style={dentro ? styles.btnDentroTxt : styles.btnTxt}>{dentro ? '✓ Você participa' : 'Quero participar'}</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </>
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

  sec: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 20, marginBottom: 2 },
  secSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  depCard: { width: '31%', backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.border, position: 'relative' },
  depCardOn: { borderColor: colors.gold, ...shadow.glow },
  depNome: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  meuBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },

  vazio: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  vazioTxt: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center' },

  grupoCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...shadow.float },
  grupoNome: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 17, marginBottom: spacing.xs },
  grupoInfo: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },
  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.sm + 2, alignItems: 'center', marginTop: spacing.md },
  btnTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 14 },
  btnDentro: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: spacing.sm + 2, alignItems: 'center', marginTop: spacing.md, borderWidth: 1, borderColor: colors.green },
  btnDentroTxt: { fontFamily: fonts.bodySemi, color: colors.green, fontSize: 14 },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
