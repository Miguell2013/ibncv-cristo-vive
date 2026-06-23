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

const VERSE = {
  text: 'Porque eu bem sei os planos que tenho a vosso respeito, diz o Senhor; planos de paz e não de mal, para vos dar um futuro e uma esperança.',
  ref: 'Jeremias 29.11',
};

const ATALHOS = [
  { icon: 'heart', label: 'Sou novo aqui', route: '/cadastro', color: colors.gold },
  { icon: 'flame', label: 'Pedido de oração', route: '/oracao', color: colors.green },
  { icon: 'calendar', label: 'Agenda', route: '/agenda', color: colors.goldSoft },
] as const;

const EVENTOS = [
  { titulo: 'Culto de Celebração', quando: 'Domingo · 18h', img: img.evCelebracao },
  { titulo: 'Culto de Oração', quando: 'Quarta · 19h30', img: img.evOracao },
  { titulo: 'Encontro de Jovens', quando: 'Sábado · 19h', img: img.evJovens },
  { titulo: 'Conferência Cristo Vive', quando: 'Em breve', img: img.evConferencia },
];

const EDIFICACAO = [
  { titulo: 'Reino ou Império', sub: 'Série de mensagens', img: img.edif1 },
  { titulo: '21 Dias de Oração', sub: 'Devocional guiado', img: img.edif2 },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 760);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <ImageBackground
        source={{ uri: img.bannerHome }}
        style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        imageStyle={styles.heroImg}
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroDeepBottom} />
        <View style={[styles.heroContent, { maxWidth: maxW }]}>
          <Image source={{ uri: img.logo }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.kicker}>IGREJA BATISTA NACIONAL</Text>
          <Text style={styles.brand}>CRISTO VIVE</Text>
          <View style={styles.goldLine} />
          <Text style={styles.heroSub}>Um lugar pra pertencer, crescer e servir.</Text>
        </View>
      </ImageBackground>

      <View style={[styles.body, { maxWidth: maxW }]}>
        {/* VERSÍCULO DO DIA */}
        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>PALAVRA DE HOJE</Text>
          <Text style={styles.verseText}>“{VERSE.text}”</Text>
          <Text style={styles.verseRef}>{VERSE.ref}</Text>
        </View>

        {/* ATALHOS */}
        <View style={styles.atalhos}>
          {ATALHOS.map((a) => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [styles.atalho, pressed && styles.pressed]}
              onPress={() => router.push(a.route as any)}
            >
              <View style={[styles.atalhoIcon, { borderColor: a.color }]}>
                <Ionicons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={styles.atalhoLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* PRÓXIMO CULTO */}
        <Pressable
          style={({ pressed }) => [styles.nextCard, pressed && styles.pressed]}
          onPress={() => router.push('/agenda' as any)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.nextLabel}>PRÓXIMO CULTO</Text>
            <Text style={styles.nextTitle}>Culto de Celebração</Text>
            <Text style={styles.nextWhen}>Domingo · 18h · Templo Sede</Text>
          </View>
          <View style={styles.nextBtn}>
            <Ionicons name="arrow-forward" size={20} color={colors.bg} />
          </View>
        </Pressable>

        {/* EVENTOS */}
        <SectionTitle title="Nossos encontros" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.md }}
        >
          {EVENTOS.map((e) => (
            <View key={e.titulo} style={styles.eventCard}>
              <ImageBackground
                source={{ uri: e.img }}
                style={styles.eventImg}
                imageStyle={{ borderRadius: radius.md }}
              >
                <View style={styles.eventOverlay} />
                <View style={styles.eventText}>
                  <Text style={styles.eventTitle}>{e.titulo}</Text>
                  <Text style={styles.eventWhen}>{e.quando}</Text>
                </View>
              </ImageBackground>
            </View>
          ))}
        </ScrollView>

        {/* EDIFICAÇÃO */}
        <SectionTitle title="Para edificar você" />
        <View style={styles.edifRow}>
          {EDIFICACAO.map((e) => (
            <View key={e.titulo} style={styles.edifCard}>
              <ImageBackground
                source={{ uri: e.img }}
                style={styles.edifImg}
                imageStyle={{ borderRadius: radius.md }}
              >
                <View style={styles.eventOverlay} />
                <View style={styles.eventText}>
                  <Text style={styles.edifTitle}>{e.titulo}</Text>
                  <Text style={styles.eventWhen}>{e.sub}</Text>
                </View>
              </ImageBackground>
            </View>
          ))}
        </View>

        {/* CHAMADA ACOLHIDA */}
        <View style={styles.ctaCard}>
          <Ionicons name="hand-left" size={26} color={colors.gold} />
          <Text style={styles.ctaTitle}>É a sua primeira vez?</Text>
          <Text style={styles.ctaSub}>
            Queremos te conhecer e caminhar com você. Deixe seu contato e nossa
            equipe vai te acolher de perto.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && styles.pressed]}
            onPress={() => router.push('/cadastro' as any)}
          >
            <Text style={styles.ctaBtnText}>Quero ser acolhido</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Igreja Batista Nacional Cristo Vive</Text>
      </View>
    </ScrollView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionDot} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  hero: {
    minHeight: 320,
    backgroundColor: colors.surface,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  heroImg: { opacity: 0.9 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12,22,38,0.55)' },
  heroDeepBottom: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 140,
    backgroundColor: 'rgba(7,14,26,0.85)',
  },
  heroContent: { alignSelf: 'center', width: '100%', paddingHorizontal: spacing.lg, alignItems: 'center' },
  logo: { width: 72, height: 72, marginBottom: spacing.sm },
  kicker: {
    fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 12,
    letterSpacing: 3, marginBottom: 2,
  },
  brand: {
    fontFamily: fonts.display, color: colors.text, fontSize: 34,
    letterSpacing: 4, textAlign: 'center',
  },
  goldLine: { width: 64, height: 2, backgroundColor: colors.gold, marginVertical: spacing.sm, borderRadius: 2 },
  heroSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, textAlign: 'center' },

  body: { alignSelf: 'center', width: '100%', paddingHorizontal: spacing.md },

  verseCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    marginTop: -spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadow.card,
  },
  verseLabel: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 11, letterSpacing: 2, marginBottom: spacing.sm },
  verseText: { fontFamily: fonts.body, color: colors.text, fontSize: 16, lineHeight: 26, fontStyle: 'italic' },
  verseRef: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 13, marginTop: spacing.sm },

  atalhos: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  atalho: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  atalhoIcon: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, alignItems: 'center',
    justifyContent: 'center', marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt,
  },
  atalhoLabel: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 12, textAlign: 'center' },

  nextCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.gold,
  },
  nextLabel: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 11, letterSpacing: 2 },
  nextTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 20, marginTop: 4 },
  nextWhen: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 4 },
  nextBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.md },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  sectionTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18, letterSpacing: 1 },

  eventCard: { width: 220 },
  eventImg: { width: 220, height: 150, justifyContent: 'flex-end', backgroundColor: colors.surface, borderRadius: radius.md },
  eventOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,14,26,0.45)', borderRadius: radius.md },
  eventText: { padding: spacing.md },
  eventTitle: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 16 },
  eventWhen: { fontFamily: fonts.body, color: colors.goldSoft, fontSize: 12, marginTop: 2 },

  edifRow: { flexDirection: 'row', gap: spacing.md },
  edifCard: { flex: 1 },
  edifImg: { height: 130, justifyContent: 'flex-end', backgroundColor: colors.surface, borderRadius: radius.md },
  edifTitle: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 15 },

  ctaCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    marginTop: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  ctaTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 20, marginTop: spacing.sm },
  ctaSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: spacing.sm },
  ctaBtn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  ctaBtnText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 15 },

  footer: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.xxl },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
