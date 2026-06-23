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
import { colors, fonts, radius, spacing, img } from '../../constants/theme';

const ITENS: { icon: string; label: string; desc: string; action?: () => void }[] = [
  { icon: 'book', label: 'Quem somos', desc: 'Nossa história, visão e valores' },
  { icon: 'people', label: 'Ministérios', desc: 'Encontre seu lugar pra servir' },
  { icon: 'cash', label: 'Contribuição', desc: 'Dízimos e ofertas com fé' },
  { icon: 'location', label: 'Onde estamos', desc: 'Endereço e como chegar' },
];

export default function Mais() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);

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

        {ITENS.map((it) => (
          <Pressable
            key={it.label}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            onPress={it.action}
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
    borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.neon, marginBottom: spacing.sm,
  },
  itemIcon: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  itemLabel: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 16 },
  itemDesc: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },

  verseBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl, borderWidth: 1, borderColor: colors.gold, alignItems: 'center' },
  verseText: { fontFamily: fonts.body, color: colors.text, fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
  verseRef: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 13, marginTop: spacing.sm },

  footer: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.xxl },

  pressed: { opacity: 0.85 },
});
