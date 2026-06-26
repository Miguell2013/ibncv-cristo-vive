import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow, img } from '../../constants/theme';
import { useIdentity } from '../../contexts/identity';

const ITENS: { icon: string; label: string; desc: string; rota?: string }[] = [
  { icon: 'book', label: 'Quem somos', desc: 'Nossa história, visão e valores' },
  { icon: 'people', label: 'Ministérios', desc: 'Encontre seu lugar pra servir', rota: '/ministerios' },
  { icon: 'library', label: 'Estudos', desc: 'Panorama de Romanos e mais', rota: '/estudos' },
  { icon: 'cash', label: 'Contribuição', desc: 'Dízimos e ofertas com fé', rota: '/contribuicao' },
  { icon: 'location', label: 'Onde estamos', desc: 'Endereço e como chegar' },
];

export default function Mais() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);
  const { identificado, identidade } = useIdentity();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl, alignItems: 'center' }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.brandRow}>
          <Image source={{ uri: img.logo }} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.brand}>CRISTO VIVE</Text>
            <Text style={styles.brandSub}>Igreja Batista Nacional</Text>
          </View>
        </View>

        {identificado ? (
          <Pressable
            style={({ pressed }) => [styles.contaCard, pressed && styles.pressed]}
            onPress={() => router.push('/perfil' as any)}
          >
            <View style={styles.contaIcon}>
              <Ionicons name="person" size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contaNome} numberOfLines={1}>{identidade?.nome}</Text>
              <Text style={styles.contaEmail} numberOfLines={1}>Ver meu perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gold} />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.entrarCard, pressed && styles.pressed]}
            onPress={() => router.push('/entrar' as any)}
          >
            <View style={styles.contaIcon}>
              <Ionicons name="log-in-outline" size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>Cadastro</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gold} />
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          onPress={() => router.push('/comunidade' as any)}
        >
          <View style={styles.itemIcon}>
            <Ionicons name="people-circle" size={20} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>Grupos & Departamentos</Text>
            <Text style={styles.itemDesc}>Sua comunhão na igreja</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
        </Pressable>

        {ITENS.map((it) => (
          <Pressable
            key={it.label}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            onPress={() => { if (it.rota) router.push(it.rota as any); }}
          >
            <View style={styles.itemIcon}>
              <Ionicons name={it.icon as any} size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>{it.label}</Text>
              <Text style={styles.itemDesc}>{it.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
          </Pressable>
        ))}

        <Pressable
          style={({ pressed }) => [styles.item, { borderColor: colors.gold }, pressed && styles.pressed]}
          onPress={() => router.push('/painel' as any)}
        >
          <View style={[styles.itemIcon, { borderColor: colors.gold }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>Painel da Equipe</Text>
            <Text style={styles.itemDesc}>Acesso dos líderes (PIN)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gold} />
        </Pressable>

        <View style={styles.verseBox}>
          <Text style={styles.verseText}>
            “Eu e a minha casa serviremos ao Senhor.”
          </Text>
          <Text style={styles.verseRef}>Josué 24.15</Text>
        </View>

        <Text style={styles.footer}>Igreja Batista Nacional Cristo Vive · {new Date().getFullYear()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  logo: { width: 60, height: 60 },
  brand: { fontFamily: fonts.display, color: colors.text, fontSize: 22, letterSpacing: 2 },
  brandSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13 },

  item: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, ...shadow.float,
  },
  itemIcon: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  itemLabel: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 16 },
  itemDesc: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },

  contaCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, marginBottom: spacing.md, ...shadow.glow,
  },
  entrarCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, marginBottom: spacing.md, ...shadow.glow,
  },
  contaIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.gold },
  contaNome: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 16 },
  contaEmail: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },
  sairBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.danger },
  sairText: { fontFamily: fonts.bodySemi, color: colors.danger, fontSize: 13 },

  verseBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl, borderWidth: 1, borderColor: colors.gold, alignItems: 'center' },
  verseText: { fontFamily: fonts.body, color: colors.text, fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
  verseRef: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 13, marginTop: spacing.sm },

  footer: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.xxl },

  pressed: { opacity: 0.85 },
});
