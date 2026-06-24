import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { supabase } from '../services/supabase';
import { useIdentity } from '../contexts/identity';

export default function Ministerios() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);
  const { identidade } = useIdentity();

  const [lista, setLista] = useState<any[]>([]);
  const [enviados, setEnviados] = useState<string[]>([]);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    const m = await supabase.from('ministerios').select('*').eq('ativo', true).order('ordem');
    setLista((m.data as any[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function abrir(minId: string) {
    if (!identidade?.pessoaId) { router.push('/entrar' as any); return; }
    setAbertoId(minId); setDesc('');
  }

  async function enviar(minId: string) {
    if (!identidade?.pessoaId) { router.push('/entrar' as any); return; }
    setEnviando(true);
    await supabase.rpc('quero_servir', {
      p_id: identidade.pessoaId,
      p_nome: identidade.nome,
      p_whatsapp: identidade.whatsapp,
      p_ministerio: minId,
      p_descricao: desc,
    });
    setEnviados((arr) => [...arr, minId]);
    setAbertoId(null); setDesc(''); setEnviando(false);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.text} /></Pressable>
          <Text style={styles.topTitle}>Ministérios</Text>
          <View style={{ width: 26 }} />
        </View>

        <Text style={styles.sec}>Encontre seu lugar pra servir</Text>
        <Text style={styles.secSub}>Toque em "Quero servir" e nossa equipe entra em contato com você. 🤍</Text>

        {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} /> : (
          lista.map((m) => {
            const enviado = enviados.includes(m.id);
            const aberto = abertoId === m.id;
            return (
              <View key={m.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.icon}>
                    <Ionicons name={(m.icone as any) || 'people'} size={24} color={colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nome}>{m.nome}</Text>
                    {m.descricao ? <Text style={styles.desc}>{m.descricao}</Text> : null}
                  </View>
                </View>

                {enviado ? (
                  <View style={styles.btnDentro}>
                    <Text style={styles.btnDentroTxt}>✓ Interesse enviado</Text>
                  </View>
                ) : aberto ? (
                  <View>
                    <TextInput
                      style={styles.textarea}
                      value={desc}
                      onChangeText={setDesc}
                      placeholder="Conte como você pode ajudar — talentos, experiência, disponibilidade (opcional)"
                      placeholderTextColor={colors.textFaint}
                      multiline
                    />
                    <View style={styles.acoes}>
                      <Pressable style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]} onPress={() => { setAbertoId(null); setDesc(''); }}>
                        <Text style={styles.btnGhostTxt}>Cancelar</Text>
                      </Pressable>
                      <Pressable style={({ pressed }) => [styles.btn, { flex: 1 }, pressed && styles.pressed, enviando && { opacity: 0.7 }]} onPress={() => enviar(m.id)} disabled={enviando}>
                        {enviando ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.btnTxt}>Enviar interesse</Text>}
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => abrir(m.id)}>
                    <Text style={styles.btnTxt}>Quero servir</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}

        <Text style={styles.privacy}>Servir é um privilégio. "Cada um exerça o dom que recebeu." 1 Pe 4.10 🙏</Text>
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
  secSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginBottom: spacing.lg },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...shadow.float },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  icon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gold },
  nome: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 17 },
  desc: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },

  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  btnTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 14 },
  btnDentro: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: spacing.sm + 2, alignItems: 'center', borderWidth: 1, borderColor: colors.green },
  btnDentroTxt: { fontFamily: fonts.bodySemi, color: colors.green, fontSize: 14 },
  textarea: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, minHeight: 80, textAlignVertical: 'top', color: colors.text, fontFamily: fonts.body, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  acoes: { flexDirection: 'row', gap: spacing.sm },
  btnGhost: { borderRadius: radius.pill, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  btnGhostTxt: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 14 },

  privacy: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
