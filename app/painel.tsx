import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { supabase, Pessoa, PedidoOracao } from '../services/supabase';

const PIN_KEY = 'ibncv_painel_pin';

const TIPO_LABEL: Record<string, { txt: string; cor: string }> = {
  visitante: { txt: 'Visitante', cor: colors.gold },
  novo_convertido: { txt: 'Novo convertido', cor: colors.green },
  membro: { txt: 'Membro', cor: colors.neon },
};

function dataBR(iso?: string | null) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return ''; }
}

export default function Painel() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 760);

  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [resumo, setResumo] = useState<any>(null);
  const [aba, setAba] = useState<'pessoas' | 'pedidos'>('pessoas');
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([]);

  const carregar = useCallback(async (p: string) => {
    const [r, ps, pd] = await Promise.all([
      supabase.rpc('painel_resumo', { p_pin: p }),
      supabase.rpc('painel_pessoas', { p_pin: p }),
      supabase.rpc('painel_pedidos', { p_pin: p }),
    ]);
    setResumo((r.data as any[])?.[0] ?? null);
    setPessoas((ps.data as Pessoa[]) ?? []);
    setPedidos((pd.data as PedidoOracao[]) ?? []);
  }, []);

  const entrar = useCallback(async (p: string) => {
    setErro(null); setLoading(true);
    const { data, error } = await supabase.rpc('painel_pin_ok', { p_pin: p });
    if (error || data !== true) {
      setLoading(false);
      setErro('PIN incorreto.');
      return false;
    }
    await AsyncStorage.setItem(PIN_KEY, p);
    await carregar(p);
    setAuthed(true);
    setLoading(false);
    return true;
  }, [carregar]);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(PIN_KEY);
      if (saved) { setPin(saved); entrar(saved); }
    })();
  }, [entrar]);

  async function responder(id: string) {
    await supabase.rpc('painel_responder', { p_pin: pin, p_pedido: id });
    setPedidos((arr) => arr.map((x) => (x.id === id ? { ...x, status: 'respondido' } : x)));
  }

  async function sair() {
    await AsyncStorage.removeItem(PIN_KEY);
    setAuthed(false); setPin(''); setResumo(null);
  }

  // ---- TELA DE PIN ----
  if (!authed) {
    return (
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.center, { paddingTop: insets.top }]}>
          <View style={[styles.pinCard, { maxWidth: 360 }]}>
            <View style={styles.lock}><Ionicons name="lock-closed" size={30} color={colors.gold} /></View>
            <Text style={styles.pinTitle}>Painel da Equipe</Text>
            <Text style={styles.pinSub}>Acesso restrito aos líderes. Digite o PIN.</Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder="• • • • • •"
              placeholderTextColor={colors.textFaint}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
            {erro && <Text style={styles.erro}>{erro}</Text>}
            <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && { opacity: 0.7 }]} onPress={() => entrar(pin)} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.btnText}>Entrar</Text>}
            </Pressable>
            <Pressable onPress={() => router.back()}><Text style={styles.voltar}>Voltar</Text></Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ---- PAINEL ----
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.text} /></Pressable>
          <Text style={styles.topTitle}>Painel da Equipe</Text>
          <Pressable onPress={sair} hitSlop={12}><Ionicons name="log-out-outline" size={22} color={colors.danger} /></Pressable>
        </View>

        {/* RESUMO */}
        <View style={styles.resumoRow}>
          <Resumo n={resumo?.visitantes} label="Visitantes" cor={colors.gold} />
          <Resumo n={resumo?.convertidos} label="Convertidos" cor={colors.green} />
          <Resumo n={resumo?.membros} label="Membros" cor={colors.neon} />
          <Resumo n={resumo?.pedidos_abertos} label="Pedidos" cor={colors.goldSoft} />
        </View>

        {/* ABAS */}
        <View style={styles.tabs}>
          <Pressable style={[styles.tab, aba === 'pessoas' && styles.tabOn]} onPress={() => setAba('pessoas')}>
            <Text style={[styles.tabTxt, aba === 'pessoas' && styles.tabTxtOn]}>Pessoas ({pessoas.length})</Text>
          </Pressable>
          <Pressable style={[styles.tab, aba === 'pedidos' && styles.tabOn]} onPress={() => setAba('pedidos')}>
            <Text style={[styles.tabTxt, aba === 'pedidos' && styles.tabTxtOn]}>Pedidos ({pedidos.length})</Text>
          </Pressable>
        </View>

        {aba === 'pessoas' ? (
          pessoas.length === 0 ? <Text style={styles.empty}>Ninguém cadastrado ainda.</Text> :
          pessoas.map((p) => {
            const t = TIPO_LABEL[p.tipo] || { txt: p.tipo, cor: colors.textMuted };
            return (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardNome}>{p.nome_completo}</Text>
                  <View style={[styles.badge, { borderColor: t.cor }]}><Text style={[styles.badgeTxt, { color: t.cor }]}>{t.txt}</Text></View>
                </View>
                {p.whatsapp ? <Text style={styles.linha}><Ionicons name="logo-whatsapp" size={13} color={colors.green} /> {p.whatsapp}</Text> : null}
                {p.email ? <Text style={styles.linha}><Ionicons name="mail" size={13} color={colors.textFaint} /> {p.email}</Text> : null}
                {(p as any).endereco ? <Text style={styles.linha}><Ionicons name="location" size={13} color={colors.textFaint} /> {(p as any).endereco}</Text> : null}
                <Text style={styles.data}>{dataBR(p.created_at)}{p.como_conheceu ? ` · ${p.como_conheceu}` : ''}</Text>
                {p.observacoes ? <Text style={styles.obs}>“{p.observacoes}”</Text> : null}
              </View>
            );
          })
        ) : (
          pedidos.length === 0 ? <Text style={styles.empty}>Nenhum pedido ainda.</Text> :
          pedidos.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardNome}>{p.autor_nome || 'Anônimo'}</Text>
                {p.area ? <View style={[styles.badge, { borderColor: colors.gold }]}><Text style={[styles.badgeTxt, { color: colors.gold }]}>{p.area}</Text></View> : null}
              </View>
              <Text style={styles.pedTxt}>{p.texto}</Text>
              <View style={styles.pedFoot}>
                <Text style={styles.data}>{dataBR(p.created_at)}{p.permitir_whatsapp ? ' · aceita WhatsApp' : ''}</Text>
                {p.status === 'respondido' ? (
                  <View style={styles.respOk}><Ionicons name="checkmark-circle" size={14} color={colors.green} /><Text style={styles.respOkTxt}>Respondido</Text></View>
                ) : (
                  <Pressable style={({ pressed }) => [styles.respBtn, pressed && styles.pressed]} onPress={() => responder(p.id)}>
                    <Text style={styles.respBtnTxt}>Marcar respondido</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Resumo({ n, label, cor }: { n?: number; label: string; cor: string }) {
  return (
    <View style={styles.resumoCard}>
      <Text style={[styles.resumoN, { color: cor }]}>{n ?? 0}</Text>
      <Text style={styles.resumoL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  pinCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.gold, ...shadow.card },
  lock: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.gold, marginBottom: spacing.md },
  pinTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 22 },
  pinSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  pinInput: { width: '100%', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: spacing.md, textAlign: 'center', color: colors.text, fontFamily: fonts.bodyBold, fontSize: 24, letterSpacing: 8, borderWidth: 1, borderColor: colors.border },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  topTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },

  resumoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  resumoCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  resumoN: { fontFamily: fonts.bodyBold, fontSize: 22 },
  resumoL: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 11, marginTop: 2 },

  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabTxt: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 13 },
  tabTxtOn: { color: colors.bg },

  empty: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: spacing.xl },

  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  cardNome: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 16, flex: 1 },
  badge: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeTxt: { fontFamily: fonts.bodySemi, fontSize: 11 },
  linha: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 3 },
  data: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, marginTop: 4 },
  obs: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, fontStyle: 'italic', marginTop: spacing.xs },

  pedTxt: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  pedFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, flexWrap: 'wrap', gap: spacing.sm },
  respBtn: { backgroundColor: colors.green, borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  respBtnTxt: { fontFamily: fonts.bodySemi, color: colors.bg, fontSize: 12 },
  respOk: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  respOkTxt: { fontFamily: fonts.bodySemi, color: colors.green, fontSize: 12 },

  erro: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 13, marginTop: spacing.md },
  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.lg, width: '100%', ...shadow.glow },
  btnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 16 },
  voltar: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 14, marginTop: spacing.md },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
