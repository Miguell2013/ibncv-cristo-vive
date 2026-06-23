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
import { useIdentity } from '../contexts/identity';
import { atualizarPerfil, brData, primeiroNome } from '../services/identity';

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 560);
  const { identidade, identificado, setIdentidade, sair } = useIdentity();

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState(identidade?.nome ?? '');
  const [email, setEmail] = useState(identidade?.email ?? '');
  const [nascimento, setNascimento] = useState(brData(identidade?.nascimento));
  const [rua, setRua] = useState(identidade?.rua ?? '');
  const [numero, setNumero] = useState(identidade?.numero ?? '');
  const [bairro, setBairro] = useState(identidade?.bairro ?? '');
  const [cidade, setCidade] = useState(identidade?.cidade ?? '');

  if (!identificado || !identidade) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="person-circle-outline" size={64} color={colors.textFaint} />
        <Text style={styles.vazioTitle}>Você ainda não se cadastrou</Text>
        <Pressable style={styles.btn} onPress={() => router.replace('/entrar' as any)}>
          <Text style={styles.btnText}>Fazer cadastro</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}><Text style={styles.voltar}>Voltar</Text></Pressable>
      </View>
    );
  }

  const campos = [identidade.nome, identidade.whatsapp, identidade.email, identidade.nascimento, identidade.endereco];
  const preenchidos = campos.filter((c) => c && String(c).trim()).length;
  const pct = Math.round((preenchidos / campos.length) * 100);

  async function salvar() {
    setErro(null);
    if (nome.trim().length < 3) { setErro('Conte seu nome completo.'); return; }
    setLoading(true);
    const r = await atualizarPerfil(identidade!, { nome, whatsapp: identidade!.whatsapp, email, nascimento, rua, numero, bairro, cidade });
    setLoading(false);
    if (r.ok && r.identidade) { setIdentidade(r.identidade); setEditando(false); }
    else setErro(r.error || 'Tente novamente.');
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.body, { maxWidth: maxW }]}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
            <Text style={styles.topTitle}>Meu perfil</Text>
            <View style={{ width: 26 }} />
          </View>

          <View style={styles.head}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: img.pastor }} style={styles.avatarImg} resizeMode="cover" />
            </View>
            <Text style={styles.nome}>{identidade.nome}</Text>
            <Text style={styles.tipo}>Membro · Cristo Vive</Text>
          </View>

          {/* Perfil completo */}
          <View style={styles.pctCard}>
            <View style={styles.pctTop}>
              <Text style={styles.pctLabel}>Perfil {pct}% completo</Text>
              {pct < 100 && <Text style={styles.pctHint}>Complete pra nos ajudar a te conhecer</Text>}
            </View>
            <View style={styles.pctBar}>
              <View style={[styles.pctFill, { width: `${pct}%` }]} />
            </View>
          </View>

          {editando ? (
            <View style={styles.card}>
              <Text style={styles.lbl}>Nome completo</Text>
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" placeholderTextColor={colors.textFaint} />
              <Text style={styles.lbl}>WhatsApp</Text>
              <Text style={styles.fixo}>{identidade.whatsapp}</Text>
              <Text style={styles.lbl}>E-mail</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="seu@email.com" placeholderTextColor={colors.textFaint} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.lbl}>Data de nascimento</Text>
              <TextInput style={styles.input} value={nascimento} onChangeText={setNascimento} placeholder="DD/MM/AAAA" placeholderTextColor={colors.textFaint} keyboardType="numbers-and-punctuation" maxLength={10} />
              <Text style={styles.lbl}>Endereço</Text>
              <View style={styles.linha}>
                <TextInput style={[styles.input, { flex: 1 }]} value={rua} onChangeText={setRua} placeholder="Rua" placeholderTextColor={colors.textFaint} />
                <TextInput style={[styles.input, { width: 88 }]} value={numero} onChangeText={setNumero} placeholder="Nº" placeholderTextColor={colors.textFaint} keyboardType="number-pad" />
              </View>
              <TextInput style={styles.input} value={bairro} onChangeText={setBairro} placeholder="Bairro" placeholderTextColor={colors.textFaint} />
              <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholder="Cidade" placeholderTextColor={colors.textFaint} />

              {erro && <Text style={styles.erro}>{erro}</Text>}
              <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && { opacity: 0.7 }]} onPress={salvar} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.btnText}>Salvar</Text>}
              </Pressable>
              <Pressable onPress={() => setEditando(false)}><Text style={styles.voltar}>Cancelar</Text></Pressable>
            </View>
          ) : (
            <View style={styles.card}>
              <Linha icon="call" label="WhatsApp" valor={identidade.whatsapp} />
              <Linha icon="mail" label="E-mail" valor={identidade.email} />
              <Linha icon="gift" label="Nascimento" valor={brData(identidade.nascimento)} />
              <Linha icon="location" label="Endereço" valor={identidade.endereco} />
              <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => setEditando(true)}>
                <Text style={styles.btnText}>{pct < 100 ? 'Completar cadastro' : 'Editar dados'}</Text>
              </Pressable>
            </View>
          )}

          <Pressable style={({ pressed }) => [styles.sairBtn, pressed && styles.pressed]} onPress={async () => { await sair(); router.back(); }}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.sairText}>Sair desta conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Linha({ icon, label, valor }: { icon: string; label: string; valor?: string | null }) {
  return (
    <View style={styles.dado}>
      <View style={styles.dadoIcon}><Ionicons name={icon as any} size={18} color={colors.gold} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.dadoLabel}>{label}</Text>
        <Text style={styles.dadoValor}>{valor && String(valor).trim() ? valor : '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  body: { width: '100%', paddingHorizontal: spacing.md },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  topTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },

  head: { alignItems: 'center', marginBottom: spacing.lg },
  avatarWrap: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: colors.gold, overflow: 'hidden', backgroundColor: colors.surface, ...shadow.glow },
  avatarImg: { width: '100%', height: '100%' },
  nome: { fontFamily: fonts.display, color: colors.text, fontSize: 24, marginTop: spacing.md, textAlign: 'center' },
  tipo: { fontFamily: fonts.body, color: colors.goldSoft, fontSize: 13, marginTop: 2 },

  pctCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...shadow.float },
  pctTop: { marginBottom: spacing.sm },
  pctLabel: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 14 },
  pctHint: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, marginTop: 2 },
  pctBar: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  pctFill: { height: 8, borderRadius: 4, backgroundColor: colors.gold },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.float },

  dado: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  dadoIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  dadoLabel: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12 },
  dadoValor: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 15, marginTop: 1 },

  lbl: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 13, marginTop: spacing.md, marginBottom: spacing.xs },
  fixo: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 15, paddingVertical: spacing.sm },
  input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  linha: { flexDirection: 'row', gap: spacing.md },

  erro: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 13, marginTop: spacing.md },

  btn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg, ...shadow.glow },
  btnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 15 },

  voltar: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.md },

  sairBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.xl },
  sairText: { fontFamily: fonts.bodySemi, color: colors.danger, fontSize: 14 },

  vazioTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18, textAlign: 'center' },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
