import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Switch,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow, img } from '../../constants/theme';
import { supabase, PedidoOracao } from '../../services/supabase';
import { useIdentity } from '../../contexts/identity';

const AREAS: { label: string; value: string; icon: string }[] = [
  { label: 'Família', value: 'familia', icon: 'people' },
  { label: 'Saúde', value: 'saude', icon: 'medkit' },
  { label: 'Finanças', value: 'financas', icon: 'cash' },
  { label: 'Espiritual', value: 'espiritual', icon: 'leaf' },
  { label: 'Outro', value: 'outro', icon: 'ellipsis-horizontal' },
];

const LIMITE = 500;

function inicialDe(nome?: string) {
  const n = (nome || '').trim();
  return n ? n.charAt(0).toUpperCase() : '🙏';
}

export default function Oracao() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);
  const { identidade, identificado } = useIdentity();

  const [nome, setNome] = useState('');
  const [area, setArea] = useState('');
  const [texto, setTexto] = useState('');
  const [publico, setPublico] = useState(true);
  const [whats, setWhats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [mural, setMural] = useState<PedidoOracao[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [orei, setOrei] = useState<Record<string, boolean>>({});
  const [meus, setMeus] = useState<PedidoOracao[]>([]);
  const [totalOrando, setTotalOrando] = useState(0);

  const carregarMeus = useCallback(async () => {
    if (!identidade?.pessoaId) { setMeus([]); return; }
    const { data } = await supabase.rpc('meus_pedidos', { p_id: identidade.pessoaId });
    setMeus((data as PedidoOracao[]) || []);
  }, [identidade?.pessoaId]);

  const carregarMural = useCallback(async () => {
    const { data } = await supabase
      .from('pedidos_oracao')
      .select('*')
      .eq('publico', true)
      .order('created_at', { ascending: false })
      .limit(30);
    const lista = (data as PedidoOracao[]) || [];
    setMural(lista);
    if (lista.length) {
      const ids = lista.map((p) => p.id);
      const { data: inter } = await supabase
        .from('oracao_intercessoes')
        .select('pedido_id')
        .in('pedido_id', ids);
      const c: Record<string, number> = {};
      (inter || []).forEach((r: any) => { c[r.pedido_id] = (c[r.pedido_id] || 0) + 1; });
      setCounts(c);
    }
  }, []);

  // Número REAL de intercessões (todos os "estou orando" registrados).
  const carregarTotal = useCallback(async () => {
    const { count } = await supabase
      .from('oracao_intercessoes')
      .select('*', { count: 'exact', head: true });
    if (typeof count === 'number') setTotalOrando(count);
  }, []);

  useEffect(() => { carregarMural(); carregarMeus(); carregarTotal(); }, [carregarMural, carregarMeus, carregarTotal]);

  async function enviar() {
    setErro(null);
    if (texto.trim().length < 5) {
      setErro('Escreva seu pedido de oração.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('pedidos_oracao').insert({
        autor_nome: identidade?.nome || nome.trim() || 'Anônimo',
        pessoa_id: identidade?.pessoaId ?? null,
        area: area || null,
        texto: texto.trim(),
        publico,
        permitir_whatsapp: whats,
      });
      if (error) throw error;
      setOk(true);
      setTexto(''); setArea(''); setNome('');
      carregarMural();
      carregarMeus();
      setTimeout(() => setOk(false), 4000);
    } catch {
      setErro('Não conseguimos enviar agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function estouOrando(pedidoId: string) {
    if (orei[pedidoId]) return;
    setOrei((s) => ({ ...s, [pedidoId]: true }));
    setCounts((c) => ({ ...c, [pedidoId]: (c[pedidoId] || 0) + 1 }));
    setTotalOrando((t) => t + 1);
    await supabase.from('oracao_intercessoes').insert({ pedido_id: pedidoId });
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.body, { maxWidth: maxW }]}>
          {/* CABEÇALHO */}
          <View style={styles.headerWrap}>
            <Image source={{ uri: img.logo }} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>PEDIDOS DE ORAÇÃO</Text>
            <Text style={styles.subtitle}>Não carregue seus fardos sozinho.{'\n'}Estamos aqui para orar com você.</Text>
          </View>

          {/* BANNER PROVA SOCIAL (número real) */}
          <View style={styles.proofCard}>
            <View style={styles.proofIcon}>
              <Text style={styles.proofEmoji}>🙏</Text>
            </View>
            <View style={{ flex: 1 }}>
              {totalOrando > 0 ? (
                <Text style={styles.proofTitle}>
                  <Text style={styles.proofNum}>{totalOrando}</Text> {totalOrando === 1 ? 'oração' : 'orações'} de intercessão
                </Text>
              ) : (
                <Text style={styles.proofTitle}>A igreja está aqui por você</Text>
              )}
              <Text style={styles.proofSub}>Seu pedido será recebido com amor e intercessão.</Text>
            </View>
            <View style={styles.proofStack}>
              <View style={[styles.proofDot, { marginLeft: 0 }]}><Ionicons name="heart" size={12} color={colors.bg} /></View>
              <View style={styles.proofDot}><Ionicons name="heart" size={12} color={colors.bg} /></View>
              <View style={styles.proofDot}><Ionicons name="heart" size={12} color={colors.bg} /></View>
            </View>
          </View>

          {/* FORM */}
          <View style={styles.formCard}>
            <View style={styles.formHeadRow}>
              <Ionicons name="person-circle" size={20} color={colors.gold} />
              <Text style={styles.formHeadTxt}>Área do Pedido</Text>
            </View>

            <View style={styles.tiles}>
              {AREAS.map((a) => {
                const active = area === a.value;
                return (
                  <Pressable key={a.value} style={[styles.tile, active && styles.tileActive]} onPress={() => setArea(active ? '' : a.value)}>
                    <Ionicons name={a.icon as any} size={20} color={active ? colors.bg : colors.gold} />
                    <Text style={[styles.tileTxt, active && { color: colors.bg }]} numberOfLines={1}>{a.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {!identificado && (
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome (opcional)"
                placeholderTextColor={colors.textFaint}
              />
            )}

            <Text style={styles.label}>Escreva seu pedido</Text>
            <View style={styles.textareaWrap}>
              <TextInput
                style={styles.textarea}
                value={texto}
                onChangeText={(t) => t.length <= LIMITE && setTexto(t)}
                placeholder="Compartilhe seu pedido de oração..."
                placeholderTextColor={colors.textFaint}
                multiline
              />
              <Text style={styles.counter}>{texto.length}/{LIMITE}</Text>
            </View>

            {/* WhatsApp */}
            <View style={styles.toggleRow}>
              <View style={styles.waIcon}><Ionicons name="logo-whatsapp" size={20} color="#25D366" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Permitir contato via WhatsApp</Text>
                <Text style={styles.toggleSub}>Nossa equipe poderá entrar em contato para orar com você.</Text>
              </View>
              <Switch value={whats} onValueChange={setWhats} trackColor={{ false: colors.border, true: colors.green }} thumbColor={colors.white} />
            </View>

            {/* Compartilhar no mural */}
            <View style={styles.toggleRow}>
              <View style={styles.waIcon}><Ionicons name="people-outline" size={20} color={colors.gold} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Compartilhar no mural</Text>
                <Text style={styles.toggleSub}>A comunidade verá e poderá orar pelo seu pedido.</Text>
              </View>
              <Switch value={publico} onValueChange={setPublico} trackColor={{ false: colors.border, true: colors.green }} thumbColor={colors.white} />
            </View>

            {erro && <Text style={styles.erro}>{erro}</Text>}
            {ok && <Text style={styles.ok}>Recebemos seu pedido. Estamos orando com você. 🤍</Text>}

            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && { opacity: 0.7 }]}
              onPress={enviar}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.bg} /> : (
                <>
                  <Text style={styles.btnEmoji}>🙏</Text>
                  <Text style={styles.btnText}>ENVIAR PEDIDO</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* MEUS PEDIDOS */}
          {identificado && meus.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Meus pedidos</Text>
              </View>
              {meus.map((p) => (
                <View key={p.id} style={styles.meuCard}>
                  <View style={styles.meuTop}>
                    {p.area ? <Text style={styles.muralArea}>{p.area}</Text> : <View />}
                    <View style={[styles.statusPill, p.status === 'respondido' && styles.statusOk]}>
                      <Ionicons name={p.status === 'respondido' ? 'checkmark-circle' : 'time'} size={13} color={p.status === 'respondido' ? colors.green : colors.gold} />
                      <Text style={[styles.statusText, p.status === 'respondido' && { color: colors.green }]}>
                        {p.status === 'respondido' ? 'Respondido' : 'Em intercessão'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.muralTexto}>{p.texto}</Text>
                </View>
              ))}
            </>
          )}

          {/* MURAL */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Mural de Oração</Text>
            <Text style={styles.verTodos}>Ver todos</Text>
          </View>
          <Text style={styles.sectionSub}>Ore pelos pedidos da nossa comunidade.</Text>

          {mural.length === 0 ? (
            <Text style={styles.empty}>Seja o primeiro a compartilhar um pedido. 🙏</Text>
          ) : (
            mural.map((p) => (
              <View key={p.id} style={styles.muralCard}>
                <View style={styles.avatar}><Text style={styles.avatarTxt}>{inicialDe(p.autor_nome)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.muralNome} numberOfLines={1}>{p.autor_nome || 'Anônimo'}</Text>
                  <Text style={styles.muralTexto} numberOfLines={3}>{p.texto}</Text>
                  <View style={styles.interLinha}>
                    <View style={styles.greenDot} />
                    <Text style={styles.interTxt}>Em intercessão{counts[p.id] ? `  ·  ${counts[p.id]}` : ''}</Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.orarBtn, orei[p.id] && styles.orarBtnDone, pressed && styles.pressed]}
                  onPress={() => estouOrando(p.id)}
                >
                  <Ionicons name={orei[p.id] ? 'heart' : 'heart-outline'} size={15} color={orei[p.id] ? colors.bg : colors.green} />
                  <Text style={[styles.orarText, orei[p.id] && { color: colors.bg }]}>{orei[p.id] ? 'ORANDO' : 'ESTOU ORANDO'}</Text>
                </Pressable>
              </View>
            ))
          )}

          {/* VERSÍCULO */}
          <View style={styles.verseBox}>
            <Text style={styles.verseQuote}>“</Text>
            <Text style={styles.verseText}>Orai uns pelos outros.</Text>
            <Text style={styles.verseRef}>— TIAGO 5:16</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  // Cabeçalho
  headerWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 150, height: 75, marginTop: -10, marginBottom: -10 },
  title: { fontFamily: fonts.display, color: colors.gold, fontSize: 30, letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: spacing.sm },

  // Banner prova social
  proofCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#140f06', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.gold, marginBottom: spacing.lg, ...shadow.glow,
  },
  proofIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.gold, backgroundColor: 'rgba(212,175,55,0.08)' },
  proofEmoji: { fontSize: 22 },
  proofTitle: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 14 },
  proofNum: { fontFamily: fonts.bodyBold, color: colors.gold, fontSize: 15 },
  proofSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, lineHeight: 16, marginTop: 2 },
  proofStack: { flexDirection: 'row', alignItems: 'center' },
  proofDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginLeft: -8, borderWidth: 1.5, borderColor: '#140f06' },

  // Form
  formCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md, ...shadow.float },
  formHeadRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  formHeadTxt: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15 },

  tiles: { flexDirection: 'row', gap: 6 },
  tile: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  tileActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  tileTxt: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 10.5 },

  input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 15, borderWidth: 1, borderColor: colors.border },

  label: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 13, marginTop: 2 },
  textareaWrap: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  textarea: { minHeight: 96, color: colors.text, fontFamily: fonts.body, fontSize: 15, textAlignVertical: 'top' },
  counter: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 11, alignSelf: 'flex-end', marginTop: 4 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  waIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  toggleTitle: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 14 },
  toggleSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 11.5, lineHeight: 15, marginTop: 1 },

  erro: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 13 },
  ok: { fontFamily: fonts.bodyMedium, color: colors.greenSoft, fontSize: 13 },

  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md, ...shadow.glow },
  btnEmoji: { fontSize: 16 },
  btnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 15, letterSpacing: 0.5 },

  // Seções
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.md },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.xl },
  sectionTitle: { fontFamily: fonts.displaySemi, color: colors.gold, fontSize: 20 },
  verTodos: { fontFamily: fonts.bodySemi, color: colors.green, fontSize: 13 },
  sectionSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2, marginBottom: spacing.md },

  empty: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: spacing.lg },

  // Mural
  muralCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 18 },
  muralNome: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15 },
  muralTexto: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13.5, lineHeight: 19, marginTop: 2 },
  interLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  interTxt: { fontFamily: fonts.bodyMedium, color: colors.green, fontSize: 12 },
  orarBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center', backgroundColor: 'transparent', borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.green },
  orarBtnDone: { backgroundColor: colors.green, borderColor: colors.green },
  orarText: { fontFamily: fonts.bodyBold, color: colors.green, fontSize: 10.5 },

  // Meus pedidos
  meuCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, marginBottom: spacing.md, ...shadow.float },
  meuTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: spacing.sm },
  statusOk: { borderWidth: 1, borderColor: colors.green },
  statusText: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 12 },
  muralArea: { fontFamily: fonts.bodyMedium, color: colors.gold, fontSize: 12, backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },

  // Versículo
  verseBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl, borderWidth: 1, borderColor: colors.gold, alignItems: 'center' },
  verseQuote: { fontFamily: fonts.display, color: colors.gold, fontSize: 28, lineHeight: 28, marginBottom: -6 },
  verseText: { fontFamily: fonts.body, color: colors.text, fontSize: 16, fontStyle: 'italic', textAlign: 'center' },
  verseRef: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 12, letterSpacing: 1, marginTop: spacing.sm },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
