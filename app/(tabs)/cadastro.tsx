import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow, img } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import { HeaderRefresh } from '../../components/HeaderRefresh';

type Tipo = 'visitante' | 'novo_convertido' | 'membro';

const TIPOS: { key: Tipo; label: string; desc: string; icon: string; cor: string }[] = [
  { key: 'visitante', label: 'Estou visitando', desc: 'Vim conhecer a igreja', icon: 'walk', cor: colors.gold },
  { key: 'novo_convertido', label: 'Aceitei a Jesus', desc: 'Quero começar minha caminhada', icon: 'sparkles', cor: colors.green },
  { key: 'membro', label: 'Sou membro', desc: 'Já faço parte da família', icon: 'people', cor: colors.neon },
];

const FORM = {
  visitante: { titulo: 'Seja bem-vindo! 🤍', sub: 'Deixe seu contato pra nossa equipe te receber com carinho.' },
  novo_convertido: { titulo: 'Que decisão linda! 🎉', sub: 'O céu está em festa! Deixe seu contato pra caminharmos com você.' },
  membro: { titulo: 'Que bom te ter na casa!', sub: 'Atualize seu contato com a gente.' },
};

const SUCESSO: Record<Tipo, { icon: string; title: string; text: string }> = {
  visitante: {
    icon: 'hand-left',
    title: 'Que alegria ter você!',
    text: 'Recebemos seu contato com carinho. Nossa equipe de acolhimento vai falar com você em breve. Seja muito bem-vindo à família Cristo Vive. 🤍',
  },
  novo_convertido: {
    icon: 'sparkles',
    title: 'O céu está em festa! 🎉',
    text: 'Que decisão linda! Vamos caminhar contigo nos seus primeiros passos com Jesus. Em breve nossa equipe te procura pra começar essa jornada. 🤍',
  },
  membro: {
    icon: 'people',
    title: 'Que bom te ter na casa!',
    text: 'Ficamos felizes que você faz parte da família Cristo Vive. Identifique-se como membro pra acompanhar tudo: seus pedidos, perfil e mais.',
  },
};

const COMO: string[] = ['Convite de um amigo', 'Redes sociais', 'Passando na frente', 'Já conhecia', 'Outro'];

function isoNasc(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function mascararData(s: string): string {
  const d = s.replace(/\D/g, '').slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

export default function Cadastro() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);

  const [etapa, setEtapa] = useState<'escolha' | 'form'>('escolha');
  const [tipo, setTipo] = useState<Tipo>('visitante');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | ''>('');
  const [como, setComo] = useState('');
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function reiniciar() {
    setDone(false); setEtapa('escolha');
    setNome(''); setWhatsapp(''); setEmail(''); setObs(''); setComo(''); setNascimento(''); setSexo('');
  }

  function escolher(t: Tipo) {
    setTipo(t); setErro(null); setEtapa('form');
  }

  async function enviar() {
    setErro(null);
    if (nome.trim().length < 3) { setErro('Por favor, conte seu nome completo.'); return; }
    if (whatsapp.trim().length < 8 && email.trim().length < 5) {
      setErro('Deixe um WhatsApp ou e-mail pra gente te acolher.'); return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(nascimento.trim())) { setErro('Informe a data de nascimento (DD/MM/AAAA).'); return; }
    if (!sexo) { setErro('Selecione o sexo — é assim que te direcionamos ao grupo certo.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('pessoas').insert({
        nome_completo: nome.trim(),
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        tipo,
        sexo: sexo || null,
        data_nascimento: isoNasc(nascimento),
        como_conheceu: como || null,
        observacoes: obs.trim() || null,
        primeira_visita: new Date().toISOString().slice(0, 10),
      });
      if (error) throw error;
      setDone(true);
    } catch {
      setErro('Não conseguimos enviar agora. Tente de novo em instantes.');
    } finally {
      setLoading(false);
    }
  }

  // ---- TELA DE SUCESSO ----
  if (done) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <View style={[styles.successCard, { maxWidth: maxW }]}>
          <View style={styles.successIcon}>
            <Ionicons name={SUCESSO[tipo].icon as any} size={40} color={colors.gold} />
          </View>
          <Text style={styles.successTitle}>{SUCESSO[tipo].title}</Text>
          <Text style={styles.successText}>{SUCESSO[tipo].text}</Text>

          {tipo === 'membro' && (
            <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => router.push('/entrar' as any)}>
              <Text style={styles.btnText}>Identificar-me como membro</Text>
            </Pressable>
          )}
          <Pressable style={({ pressed }) => [tipo === 'membro' ? styles.btnGhost : styles.btn, pressed && styles.pressed]} onPress={reiniciar}>
            <Text style={tipo === 'membro' ? styles.btnGhostText : styles.btnText}>Voltar ao início</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- PASSO 1: ESCOLHA ----
  if (etapa === 'escolha') {
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: img.acolhida }} style={[styles.hero, { paddingTop: insets.top + spacing.lg }]} imageStyle={styles.heroImg}>
          <View style={styles.heroOverlay} />
          <HeaderRefresh top={insets.top + 14} />
          <View style={[styles.heroContent, { maxWidth: maxW }]}>
            <Text style={styles.kicker}>ACOLHIMENTO</Text>
            <Text style={styles.title}>Seja bem-vindo</Text>
            <View style={styles.goldLine} />
            <Text style={styles.heroSub}>Queremos te conhecer e caminhar com você. 🤍</Text>
          </View>
        </ImageBackground>

        <View style={[styles.body, { maxWidth: maxW }]}>
          <Text style={styles.pergunta}>Como você chega até nós?</Text>
          {TIPOS.map((t) => (
            <Pressable key={t.key} style={({ pressed }) => [styles.escolha, { borderColor: t.cor }, pressed && styles.pressed]} onPress={() => escolher(t.key)}>
              <View style={[styles.escolhaIcon, { borderColor: t.cor }]}>
                <Ionicons name={t.icon as any} size={26} color={t.cor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.escolhaLabel}>{t.label}</Text>
                <Text style={styles.escolhaDesc}>{t.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={t.cor} />
            </Pressable>
          ))}
          <Text style={styles.privacy}>Seus dados ficam só com a equipe da igreja. 🤍</Text>
        </View>
      </ScrollView>
    );
  }

  // ---- PASSO 2: FORMULÁRIO ----
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.body, { maxWidth: maxW }]}>
          <HeaderRefresh top={14} align="right" />
          <Pressable style={styles.voltar} onPress={() => setEtapa('escolha')} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
            <Text style={styles.voltarTxt}>Voltar</Text>
          </Pressable>

          <Text style={styles.kicker}>{TIPOS.find((t) => t.key === tipo)?.label.toUpperCase()}</Text>
          <Text style={styles.title}>{FORM[tipo].titulo}</Text>
          <View style={styles.goldLine} />
          <Text style={styles.subtitle}>{FORM[tipo].sub}</Text>

          <Text style={styles.label}>Seu nome completo *</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Como podemos te chamar?" placeholderTextColor={colors.textFaint} />

          <Text style={styles.label}>WhatsApp</Text>
          <TextInput style={styles.input} value={whatsapp} onChangeText={setWhatsapp} placeholder="(00) 00000-0000" placeholderTextColor={colors.textFaint} keyboardType="phone-pad" />

          <Text style={styles.label}>E-mail</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="seu@email.com" placeholderTextColor={colors.textFaint} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Data de nascimento *</Text>
          <TextInput style={styles.input} value={nascimento} onChangeText={(t) => setNascimento(mascararData(t))} placeholder="DD/MM/AAAA" placeholderTextColor={colors.textFaint} keyboardType="numbers-and-punctuation" maxLength={10} />

          <Text style={styles.label}>Sexo *</Text>
          <View style={styles.sexoRow}>
            <Pressable style={[styles.sexoBtn, sexo === 'F' && styles.sexoOn]} onPress={() => setSexo('F')}>
              <Ionicons name="woman" size={18} color={sexo === 'F' ? colors.bg : colors.textMuted} />
              <Text style={[styles.sexoTxt, sexo === 'F' && { color: colors.bg }]}>Feminino</Text>
            </Pressable>
            <Pressable style={[styles.sexoBtn, sexo === 'M' && styles.sexoOn]} onPress={() => setSexo('M')}>
              <Ionicons name="man" size={18} color={sexo === 'M' ? colors.bg : colors.textMuted} />
              <Text style={[styles.sexoTxt, sexo === 'M' && { color: colors.bg }]}>Masculino</Text>
            </Pressable>
          </View>

          {tipo === 'visitante' && (
            <>
              <Text style={styles.label}>Como conheceu a igreja?</Text>
              <View style={styles.chips}>
                {COMO.map((c) => {
                  const active = como === c;
                  return (
                    <Pressable key={c} style={[styles.chip, active && styles.chipActive]} onPress={() => setComo(active ? '' : c)}>
                      <Text style={[styles.chipText, active && { color: colors.bg }]}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.label}>Algo que queira nos contar? (opcional)</Text>
          <TextInput style={[styles.input, styles.textarea]} value={obs} onChangeText={setObs} placeholder="Um pedido, uma necessidade, um recado..." placeholderTextColor={colors.textFaint} multiline />

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && { opacity: 0.7 }]} onPress={enviar} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.btnText}>Enviar e ser acolhido</Text>}
          </Pressable>

          <Text style={styles.privacy}>Seus dados ficam só com a equipe da igreja. 🤍</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  body: { alignSelf: 'center', width: '100%', paddingHorizontal: spacing.md },

  hero: { minHeight: 240, backgroundColor: colors.surface, justifyContent: 'flex-end', paddingBottom: spacing.xl },
  heroImg: { opacity: 0.9 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,14,26,0.55)' },
  heroContent: { alignSelf: 'center', width: '100%', paddingHorizontal: spacing.lg, alignItems: 'center' },
  heroSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, textAlign: 'center' },

  kicker: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 12, letterSpacing: 3, textAlign: 'center' },
  title: { fontFamily: fonts.display, color: colors.text, fontSize: 28, letterSpacing: 1, textAlign: 'center', marginTop: 2 },
  goldLine: { width: 56, height: 2, backgroundColor: colors.gold, marginVertical: spacing.sm, borderRadius: 2, alignSelf: 'center' },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 22, marginBottom: spacing.lg, textAlign: 'center' },

  pergunta: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18, marginTop: spacing.lg, marginBottom: spacing.md, textAlign: 'center' },

  escolha: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, marginBottom: spacing.md, ...shadow.float,
  },
  escolhaIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  escolhaLabel: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 17 },
  escolhaDesc: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },

  voltar: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: spacing.md },
  voltarTxt: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 15 },

  label: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 14, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  textarea: { height: 96, textAlignVertical: 'top' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 13 },

  sexoRow: { flexDirection: 'row', gap: spacing.md },
  sexoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  sexoOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  sexoTxt: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 14 },

  erro: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 13, marginTop: spacing.lg },

  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.xl, ...shadow.glow },
  btnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 16 },
  btnGhost: { borderRadius: radius.pill, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 15 },

  privacy: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },

  successCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.gold, ...shadow.card },
  successIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.gold, marginBottom: spacing.lg },
  successTitle: { fontFamily: fonts.display, color: colors.text, fontSize: 26, textAlign: 'center' },
  successText: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: spacing.md },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
