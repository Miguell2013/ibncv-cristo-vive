import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow, img } from '../constants/theme';
import { signIn, signUp, resetPassword } from '../services/auth';

type Modo = 'entrar' | 'criar' | 'esqueci';

export default function Entrar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 480);

  const [modo, setModo] = useState<Modo>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function voltarApp() {
    try { router.back(); } catch { router.replace('/(tabs)' as any); }
  }

  async function enviar() {
    setErro(null); setOk(null);

    if (modo === 'esqueci') {
      if (email.trim().length < 5) { setErro('Digite seu e-mail.'); return; }
      setLoading(true);
      const r = await resetPassword(email);
      setLoading(false);
      if (r.ok) setOk('Enviamos um link de recuperação pro seu e-mail. 🤍');
      else setErro(r.error || 'Tente novamente.');
      return;
    }

    if (modo === 'criar' && nome.trim().length < 3) { setErro('Conte seu nome completo.'); return; }
    if (email.trim().length < 5) { setErro('Digite um e-mail válido.'); return; }
    if (senha.length < 6) { setErro('A senha precisa ter ao menos 6 caracteres.'); return; }

    setLoading(true);
    const r = modo === 'criar' ? await signUp(nome, email, senha) : await signIn(email, senha);
    setLoading(false);
    if (r.ok) voltarApp();
    else setErro(r.error || 'Tente novamente.');
  }

  const titulo = modo === 'criar' ? 'Criar conta' : modo === 'esqueci' ? 'Recuperar senha' : 'Entrar';
  const sub =
    modo === 'criar' ? 'Faça parte e acompanhe tudo de perto.'
    : modo === 'esqueci' ? 'Te enviamos um link pra criar uma nova senha.'
    : 'Que bom te ver de novo na casa do Pai.';

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.body, { maxWidth: maxW }]}>
          <Pressable style={styles.close} onPress={voltarApp} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.textMuted} />
          </Pressable>

          <Image source={{ uri: img.logo }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>CRISTO VIVE</Text>
          <View style={styles.goldLine} />

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.sub}>{sub}</Text>

          <View style={styles.card}>
            {modo === 'criar' && (
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome completo"
                placeholderTextColor={colors.textFaint}
              />
            )}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail"
              placeholderTextColor={colors.textFaint}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {modo !== 'esqueci' && (
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="Senha"
                placeholderTextColor={colors.textFaint}
                secureTextEntry
              />
            )}

            {modo === 'entrar' && (
              <Pressable onPress={() => { setModo('esqueci'); setErro(null); setOk(null); }}>
                <Text style={styles.link}>Esqueci minha senha</Text>
              </Pressable>
            )}

            {erro && <Text style={styles.erro}>{erro}</Text>}
            {ok && <Text style={styles.ok}>{ok}</Text>}

            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && { opacity: 0.7 }]}
              onPress={enviar}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.bg} /> : (
                <Text style={styles.btnText}>
                  {modo === 'criar' ? 'Criar minha conta' : modo === 'esqueci' ? 'Enviar link' : 'Entrar'}
                </Text>
              )}
            </Pressable>
          </View>

          {modo === 'entrar' && (
            <Pressable onPress={() => { setModo('criar'); setErro(null); setOk(null); }}>
              <Text style={styles.troca}>Ainda não tem conta? <Text style={styles.trocaForte}>Criar conta</Text></Text>
            </Pressable>
          )}
          {modo !== 'entrar' && (
            <Pressable onPress={() => { setModo('entrar'); setErro(null); setOk(null); }}>
              <Text style={styles.troca}>Já tem conta? <Text style={styles.trocaForte}>Entrar</Text></Text>
            </Pressable>
          )}

          <Text style={styles.gratis}>O app é 100% gratuito para os membros. 🤍</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.lg, alignItems: 'center' },

  close: { position: 'absolute', right: spacing.md, top: 0, padding: spacing.xs, zIndex: 2 },

  logo: { width: 200, height: 100, marginBottom: -10 },
  brand: { fontFamily: fonts.display, color: colors.text, fontSize: 24, letterSpacing: 4 },
  goldLine: { width: 56, height: 2, backgroundColor: colors.gold, marginVertical: spacing.md, borderRadius: 2 },

  titulo: { fontFamily: fonts.displaySemi, color: colors.gold, fontSize: 24 },
  sub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },

  card: {
    width: '100%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md, ...shadow.float,
  },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  link: { fontFamily: fonts.bodyMedium, color: colors.neonSoft, fontSize: 13, textAlign: 'right' },

  erro: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 13 },
  ok: { fontFamily: fonts.bodyMedium, color: colors.greenSoft, fontSize: 13, lineHeight: 19 },

  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md + 2, alignItems: 'center', ...shadow.glow },
  btnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 16 },

  troca: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, marginTop: spacing.lg },
  trocaForte: { fontFamily: fonts.bodyBold, color: colors.gold },

  gratis: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.lg },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
