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
import { identificar } from '../services/identity';
import { useIdentity } from '../contexts/identity';

export default function Entrar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { setIdentidade } = useIdentity();
  const maxW = Math.min(width, 480);

  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [idade, setIdade] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function voltarApp() {
    try { router.back(); } catch { router.replace('/(tabs)' as any); }
  }

  async function enviar() {
    setErro(null);
    if (nome.trim().length < 3) { setErro('Conte seu nome completo.'); return; }
    if (whatsapp.trim().length < 8) { setErro('Digite um WhatsApp válido.'); return; }
    setLoading(true);
    const r = await identificar({ nome, whatsapp, email, endereco, idade });
    setLoading(false);
    if (r.ok && r.identidade) {
      setIdentidade(r.identidade);
      voltarApp();
    } else {
      setErro(r.error || 'Tente novamente.');
    }
  }

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

          <Text style={styles.titulo}>Cadastro</Text>
          <Text style={styles.sub}>Pra te acompanharmos de perto. Leva 20 segundos. 🤍</Text>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.textFaint}
            />
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="WhatsApp (com DDD)"
              placeholderTextColor={colors.textFaint}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail (opcional)"
              placeholderTextColor={colors.textFaint}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Endereço (opcional)"
              placeholderTextColor={colors.textFaint}
            />
            <TextInput
              style={styles.input}
              value={idade}
              onChangeText={setIdade}
              placeholder="Idade (opcional)"
              placeholderTextColor={colors.textFaint}
              keyboardType="number-pad"
              maxLength={3}
            />

            {erro && <Text style={styles.erro}>{erro}</Text>}

            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && { opacity: 0.7 }]}
              onPress={enviar}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.bg} /> : (
                <Text style={styles.btnText}>Entrar na família</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.gratis}>
            App 100% gratuito pros membros. Você completa o restante do perfil quando quiser. 🙏
          </Text>
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
  sub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 21 },

  card: {
    width: '100%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md, ...shadow.float,
  },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  erro: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 13 },

  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md + 2, alignItems: 'center', ...shadow.glow },
  btnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 16 },

  gratis: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
