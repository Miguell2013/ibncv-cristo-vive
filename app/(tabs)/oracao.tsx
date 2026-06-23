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
  ImageBackground,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, shadow, img } from '../../constants/theme';
import { supabase, PedidoOracao } from '../../services/supabase';

const AREAS: { label: string; value: string }[] = [
  { label: 'Família', value: 'familia' },
  { label: 'Saúde', value: 'saude' },
  { label: 'Finanças', value: 'financas' },
  { label: 'Espiritual', value: 'espiritual' },
  { label: 'Outro', value: 'outro' },
];

export default function Oracao() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);

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

  useEffect(() => { carregarMural(); }, [carregarMural]);

  async function enviar() {
    setErro(null);
    if (texto.trim().length < 5) {
      setErro('Escreva seu pedido de oração.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('pedidos_oracao').insert({
        autor_nome: nome.trim() || 'Anônimo',
        area: area || null,
        texto: texto.trim(),
        publico,
        permitir_whatsapp: whats,
      });
      if (error) throw error;
      setOk(true);
      setTexto(''); setArea(''); setNome('');
      carregarMural();
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
    await supabase.from('oracao_intercessoes').insert({ pedido_id: pedidoId });
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.body, { maxWidth: maxW }]}>
          <ImageBackground source={{ uri: img.oracaoHero }} style={styles.hero} imageStyle={{ borderRadius: radius.lg }}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.kicker}>ORAÇÃO</Text>
              <Text style={styles.title}>Vamos orar com você</Text>
              <View style={styles.goldLine} />
            </View>
          </ImageBackground>
          <Text style={styles.subtitle}>
            Compartilhe seu pedido. Nossa equipe e a igreja vão interceder por você.
          </Text>

          {/* FORM */}
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome (opcional)"
              placeholderTextColor={colors.textFaint}
            />
            <View style={styles.chips}>
              {AREAS.map((a) => {
                const active = area === a.value;
                return (
                  <Pressable key={a.value} style={[styles.chip, active && styles.chipActive]} onPress={() => setArea(active ? '' : a.value)}>
                    <Text style={[styles.chipText, active && { color: colors.bg }]}>{a.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={texto}
              onChangeText={setTexto}
              placeholder="Escreva seu pedido de oração..."
              placeholderTextColor={colors.textFaint}
              multiline
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Compartilhar no mural de oração</Text>
              <Switch
                value={publico}
                onValueChange={setPublico}
                trackColor={{ false: colors.border, true: colors.green }}
                thumbColor={colors.white}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Aceito contato pelo WhatsApp</Text>
              <Switch
                value={whats}
                onValueChange={setWhats}
                trackColor={{ false: colors.border, true: colors.green }}
                thumbColor={colors.white}
              />
            </View>

            {erro && <Text style={styles.erro}>{erro}</Text>}
            {ok && <Text style={styles.ok}>Recebemos seu pedido. Estamos orando com você. 🤍</Text>}

            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && { opacity: 0.7 }]}
              onPress={enviar}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.btnText}>Enviar pedido</Text>}
            </Pressable>
          </View>

          {/* MURAL */}
          <View style={styles.sectionRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Mural de oração</Text>
          </View>

          {mural.length === 0 ? (
            <Text style={styles.empty}>Seja o primeiro a compartilhar um pedido. 🙏</Text>
          ) : (
            mural.map((p) => (
              <View key={p.id} style={styles.muralCard}>
                <View style={styles.muralHead}>
                  <Text style={styles.muralNome}>{p.autor_nome || 'Anônimo'}</Text>
                  {p.area ? <Text style={styles.muralArea}>{p.area}</Text> : null}
                </View>
                <Text style={styles.muralTexto}>{p.texto}</Text>
                <Pressable
                  style={({ pressed }) => [styles.orarBtn, orei[p.id] && styles.orarBtnDone, pressed && styles.pressed]}
                  onPress={() => estouOrando(p.id)}
                >
                  <Ionicons
                    name={orei[p.id] ? 'heart' : 'heart-outline'}
                    size={16}
                    color={orei[p.id] ? colors.bg : colors.green}
                  />
                  <Text style={[styles.orarText, orei[p.id] && { color: colors.bg }]}>
                    {orei[p.id] ? 'Orando' : 'Estou orando'}
                    {counts[p.id] ? `  ·  ${counts[p.id]}` : ''}
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  hero: { minHeight: 150, justifyContent: 'flex-end', backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.gold, ...shadow.glow },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,14,26,0.5)', borderRadius: radius.lg },
  heroContent: { padding: spacing.lg },

  kicker: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 12, letterSpacing: 3 },
  title: { fontFamily: fonts.display, color: colors.text, fontSize: 28, marginTop: 2 },
  goldLine: { width: 56, height: 2, backgroundColor: colors.gold, marginVertical: spacing.sm, borderRadius: 2 },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 22, marginBottom: spacing.lg },

  formCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.neon, gap: spacing.md, ...shadow.neonGlow,
  },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  textarea: { height: 100, textAlignVertical: 'top' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 13 },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, flex: 1 },

  erro: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 13 },
  ok: { fontFamily: fonts.bodyMedium, color: colors.greenSoft, fontSize: 13 },

  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md, alignItems: 'center', ...shadow.glow },
  btnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 15 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.md },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  sectionTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },

  empty: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: spacing.lg },

  muralCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  muralHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  muralNome: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 14 },
  muralArea: { fontFamily: fonts.bodyMedium, color: colors.gold, fontSize: 12, backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  muralTexto: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 15, lineHeight: 23 },
  orarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.green,
  },
  orarBtnDone: { backgroundColor: colors.green, borderColor: colors.green },
  orarText: { fontFamily: fonts.bodySemi, color: colors.green, fontSize: 13 },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
