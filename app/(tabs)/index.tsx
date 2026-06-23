import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow, img } from '../../constants/theme';
import { supabase } from '../../services/supabase';

const ATALHOS = [
  { icon: 'calendar', label: 'Cultos', desc: 'Acompanhe nossos cultos e eventos', route: '/agenda', color: colors.gold },
  { icon: 'flame', label: 'Pedidos de Oração', desc: 'Deixe seu pedido de oração', route: '/oracao', color: colors.green },
  { icon: 'heart', label: 'Contribuir', desc: 'Seja um mantenedor', route: '/mais', color: colors.goldSoft },
] as const;

const EDIFICACAO = [
  { tag: 'SÉRIE', titulo: 'Reino ou Império', sub: 'Pastor William Machado', img: img.edif1 },
  { tag: 'DEVOCIONAL', titulo: '21 Dias de Oração', sub: 'Transforme sua rotina e fortaleça sua fé', img: img.edif2 },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 760);
  const [orando, setOrando] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from('pedidos_oracao')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'em_intercessao');
      setOrando(count ?? 0);
    })();
  }, []);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.body, { maxWidth: maxW, paddingTop: insets.top + spacing.md }]}>
        {/* TOPO: logo + sino */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }} />
          <Image source={{ uri: img.logo }} style={styles.logo} resizeMode="contain" />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Ionicons name="notifications-outline" size={24} color={colors.gold} />
          </View>
        </View>
        <Text style={styles.kicker}>IGREJA BATISTA NACIONAL</Text>
        <Text style={styles.brand}>CRISTO VIVE</Text>

        {/* SAUDAÇÃO + ORANDO */}
        <View style={styles.greetRow}>
          <View style={styles.greetIcon}>
            <Ionicons name="sunny" size={26} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetHi}>Que bom te ver! 🤍</Text>
            <Text style={styles.greetSub}>Que Deus abençoe o seu dia.</Text>
          </View>
        </View>

        {orando && orando > 0 ? (
          <View style={styles.prayingCard}>
            <Ionicons name="people" size={20} color={colors.gold} />
            <Text style={styles.prayingText}>
              Hoje temos <Text style={styles.prayingNum}>{orando}</Text>{' '}
              {orando === 1 ? 'pedido em intercessão' : 'pedidos em intercessão'}
            </Text>
          </View>
        ) : null}

        {/* CHECK-IN DO CORAÇÃO */}
        <Pressable
          style={({ pressed }) => [styles.checkin, pressed && styles.pressed]}
          onPress={() => router.push('/oracao' as any)}
        >
          <View style={styles.checkinIcon}>
            <Ionicons name="heart" size={22} color={colors.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkinTitle}>Como está seu coração hoje?</Text>
            <Text style={styles.checkinSub}>Tire um momento para conversar com Deus.</Text>
          </View>
          <Text style={{ fontSize: 24 }}>🙂</Text>
        </Pressable>

        {/* HERO AO VIVO */}
        <ImageBackground
          source={{ uri: img.bannerHome }}
          style={styles.hero}
          imageStyle={{ borderRadius: radius.lg }}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroKicker}>ASSISTA AGORA</Text>
            <Text style={styles.heroTitle}>CRISTO{'\n'}VIVE</Text>
            <Text style={styles.heroSub}>Uma família para pertencer.{'\n'}Uma missão para viver.</Text>
            <Pressable
              style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
              onPress={() => router.push('/agenda' as any)}
            >
              <Ionicons name="play" size={16} color={colors.bg} />
              <Text style={styles.heroBtnText}>ASSISTIR AO VIVO</Text>
            </Pressable>
          </View>
        </ImageBackground>

        {/* ATALHOS */}
        <View style={styles.atalhos}>
          {ATALHOS.map((a) => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [styles.atalho, pressed && styles.pressed]}
              onPress={() => router.push(a.route as any)}
            >
              <View style={[styles.atalhoIcon, { borderColor: a.color }]}>
                <Ionicons name={a.icon as any} size={24} color={a.color} />
              </View>
              <Text style={styles.atalhoLabel}>{a.label}</Text>
              <Text style={styles.atalhoDesc}>{a.desc}</Text>
            </Pressable>
          ))}
        </View>

        {/* EDIFICAÇÃO */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Para sua edificação</Text>
          <Text style={styles.sectionLink}>Ver todos</Text>
        </View>
        <View style={styles.edifRow}>
          {EDIFICACAO.map((e) => (
            <View key={e.titulo} style={styles.edifCard}>
              <ImageBackground
                source={{ uri: e.img }}
                style={styles.edifImg}
                imageStyle={{ borderRadius: radius.md }}
              >
                <View style={styles.edifOverlay} />
                <View style={styles.edifTagWrap}>
                  <Text style={styles.edifTag}>{e.tag}</Text>
                </View>
                <View style={styles.edifText}>
                  <Text style={styles.edifTitle}>{e.titulo}</Text>
                  <Text style={styles.edifSub}>{e.sub}</Text>
                </View>
                <View style={styles.edifPlay}>
                  <Ionicons name="play" size={16} color={colors.gold} />
                </View>
              </ImageBackground>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Igreja Batista Nacional Cristo Vive</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { alignSelf: 'center', width: '100%', paddingHorizontal: spacing.md },

  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  logo: { width: 96, height: 54 },
  kicker: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 11, letterSpacing: 3, textAlign: 'center' },
  brand: { fontFamily: fonts.display, color: colors.text, fontSize: 24, letterSpacing: 4, textAlign: 'center', marginTop: 2 },

  greetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  greetIcon: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.gold,
  },
  greetHi: { fontFamily: fonts.displaySemi, color: colors.gold, fontSize: 20 },
  greetSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },

  prayingCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  prayingText: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, flex: 1 },
  prayingNum: { fontFamily: fonts.bodyBold, color: colors.gold },

  checkin: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  checkinIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.green,
  },
  checkinTitle: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 16 },
  checkinSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },

  hero: { minHeight: 230, marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, justifyContent: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,14,26,0.45)', borderRadius: radius.lg },
  heroContent: { padding: spacing.lg },
  heroKicker: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 12, letterSpacing: 3 },
  heroTitle: { fontFamily: fonts.display, color: colors.gold, fontSize: 44, lineHeight: 46, marginTop: spacing.xs },
  heroSub: { fontFamily: fonts.body, color: colors.text, fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.gold,
    borderRadius: radius.pill, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, marginTop: spacing.lg,
  },
  heroBtnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 13, letterSpacing: 1 },

  atalhos: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  atalho: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  atalhoIcon: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, alignItems: 'center',
    justifyContent: 'center', marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt,
  },
  atalhoLabel: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 13, textAlign: 'center' },
  atalhoDesc: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 11, textAlign: 'center', marginTop: 2 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 20 },
  sectionLink: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 13 },

  edifRow: { flexDirection: 'row', gap: spacing.md },
  edifCard: { flex: 1 },
  edifImg: { height: 170, justifyContent: 'flex-end', backgroundColor: colors.surface, borderRadius: radius.md },
  edifOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,14,26,0.5)', borderRadius: radius.md },
  edifTagWrap: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: 'rgba(47,179,122,0.85)', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  edifTag: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 10, letterSpacing: 1 },
  edifText: { padding: spacing.md },
  edifTitle: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 17 },
  edifSub: { fontFamily: fonts.body, color: colors.goldSoft, fontSize: 12, marginTop: 2 },
  edifPlay: { position: 'absolute', bottom: spacing.md, right: spacing.md, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gold },

  footer: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.xxl },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
