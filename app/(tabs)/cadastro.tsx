import { useState } from 'react';
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
import { colors, fonts, radius, spacing, shadow } from '../../constants/theme';
import { supabase } from '../../services/supabase';

type Tipo = 'visitante' | 'novo_convertido' | 'membro';

const TIPOS: { key: Tipo; label: string; desc: string; icon: string }[] = [
  { key: 'visitante', label: 'Estou visitando', desc: 'Vim conhecer a igreja', icon: 'walk' },
  { key: 'novo_convertido', label: 'Aceitei a Jesus', desc: 'Quero começar a caminhada', icon: 'sparkles' },
  { key: 'membro', label: 'Sou membro', desc: 'Já faço parte daqui', icon: 'people' },
];

const COMO: string[] = ['Convite de um amigo', 'Redes sociais', 'Passando na frente', 'Já conhecia', 'Outro'];

export default function Cadastro() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);

  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState<Tipo>('visitante');
  const [como, setComo] = useState<string>('');
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    setErro(null);
    if (nome.trim().length < 3) {
      setErro('Por favor, conte pra gente seu nome completo.');
      return;
    }
    if (whatsapp.trim().length < 8 && email.trim().length < 5) {
      setErro('Deixe um WhatsApp ou e-mail pra gente te acolher.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('pessoas').insert({
        nome_completo: nome.trim(),
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        tipo,
        como_conheceu: como || null,
        observacoes: obs.trim() || null,
        primeira_visita: new Date().toISOString().slice(0, 10),
        status: 'novo',
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      setErro('Não conseguimos enviar agora. Tente de novo em instantes.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <View style={[styles.successCard, { maxWidth: maxW }]}>
          <View style={styles.successIcon}>
            <Ionicons name="heart" size={40} color={colors.gold} />
          </View>
          <Text style={styles.successTitle}>Que alegria ter você!</Text>
          <Text style={styles.successText}>
            Recebemos o seu contato com carinho. Nossa equipe de acolhimento vai
            falar com você em breve. Seja muito bem-vindo à família Cristo Vive. 🤍
          </Text>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={() => {
              setDone(false);
              setNome(''); setWhatsapp(''); setEmail(''); setObs(''); setComo('');
              setTipo('visitante');
            }}
          >
            <Text style={styles.btnText}>Cadastrar outra pessoa</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.body, { maxWidth: maxW }]}>
          <Text style={styles.kicker}>ACOLHIDA</Text>
          <Text style={styles.title}>Seja bem-vindo</Text>
          <View style={styles.goldLine} />
          <Text style={styles.subtitle}>
            Queremos te conhecer e caminhar com você. Leva menos de um minuto.
          </Text>

          <Text style={styles.label}>Como você chega até nós?</Text>
          <View style={styles.tipos}>
            {TIPOS.map((t) => {
              const active = tipo === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.tipo, active && styles.tipoActive]}
                  onPress={() => setTipo(t.key)}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={22}
                    color={active ? colors.gold : colors.textMuted}
                  />
                  <Text style={[styles.tipoLabel, active && { color: colors.text }]}>{t.label}</Text>
                  <Text style={styles.tipoDesc}>{t.desc}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Seu nome completo *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Como podemos te chamar?"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            style={styles.input}
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="(00) 00000-0000"
            placeholderTextColor={colors.textFaint}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textFaint}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Como conheceu a igreja?</Text>
          <View style={styles.chips}>
            {COMO.map((c) => {
              const active = como === c;
              return (
                <Pressable
                  key={c}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setComo(active ? '' : c)}
                >
                  <Text style={[styles.chipText, active && { color: colors.bg }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Algo que queira nos contar? (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={obs}
            onChangeText={setObs}
            placeholder="Um pedido, uma necessidade, um recado..."
            placeholderTextColor={colors.textFaint}
            multiline
          />

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && { opacity: 0.7 }]}
            onPress={enviar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.btnText}>Enviar e ser acolhido</Text>
            )}
          </Pressable>

          <Text style={styles.privacy}>
            Seus dados ficam só com a equipe da igreja. Usamos apenas para te acolher. 🤍
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  kicker: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 12, letterSpacing: 3 },
  title: { fontFamily: fonts.display, color: colors.text, fontSize: 30, letterSpacing: 1, marginTop: 2 },
  goldLine: { width: 56, height: 2, backgroundColor: colors.gold, marginVertical: spacing.sm, borderRadius: 2 },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 22, marginBottom: spacing.lg },

  label: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 14, marginTop: spacing.lg, marginBottom: spacing.sm },

  tipos: { gap: spacing.sm },
  tipo: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, flexWrap: 'wrap',
  },
  tipoActive: { borderColor: colors.gold, backgroundColor: colors.surfaceAlt },
  tipoLabel: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 15 },
  tipoDesc: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, width: '100%', marginLeft: 38 },

  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  textarea: { height: 96, textAlignVertical: 'top' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 13 },

  erro: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 13, marginTop: spacing.lg },

  btn: {
    backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md + 2,
    alignItems: 'center', marginTop: spacing.xl, ...shadow.glow,
  },
  btnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 16 },

  privacy: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },

  successCard: {
    width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: colors.gold, ...shadow.card,
  },
  successIcon: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.gold, marginBottom: spacing.lg,
  },
  successTitle: { fontFamily: fonts.display, color: colors.text, fontSize: 26, textAlign: 'center' },
  successText: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: spacing.md },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
