import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow, img } from '../constants/theme';

const CARD = '#0F1E36';
const TILE = '#0B1626';
const HAIR = 'rgba(212,175,55,0.22)';

const PILARES = [
  {
    icon: 'people',
    titulo: 'Ser Família',
    texto: 'Aqui ninguém caminha sozinho. Somos irmãos que se amam, oram uns pelos outros e crescem juntos na fé.',
  },
  {
    icon: 'heart',
    titulo: 'Acolher',
    texto: 'Você é bem-vindo exatamente como está. O amor de Cristo acolhe primeiro — e é esse amor que transforma vidas.',
  },
  {
    icon: 'book',
    titulo: 'Ensinar a Palavra',
    texto: 'Cremos que vidas são transformadas pela Palavra de Deus. Ensinamos a Bíblia com fidelidade, simplicidade e profundidade.',
  },
  {
    icon: 'megaphone',
    titulo: 'Anunciar o Evangelho',
    texto: 'Existimos para proclamar Jesus Cristo — sua morte, ressurreição e a salvação que só nEle se encontra — a toda criatura.',
  },
];

export default function Missao() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 760);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: Math.max(insets.top, spacing.sm), paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltar}><Ionicons name="chevron-back" size={24} color={colors.gold} /></Pressable>

        <View style={styles.headerWrap}>
          <Image source={{ uri: img.logo }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>NOSSA MISSÃO</Text>
          <Text style={styles.lema}>Uma família para pertencer.{'\n'}Uma missão para viver.</Text>
        </View>

        {/* Declaração de missão */}
        <View style={styles.missaoCard}>
          <Text style={styles.missaoTxt}>
            A <Text style={styles.dourado}>Igreja Batista Nacional Cristo Vive</Text> existe para ser uma família que acolhe com amor, ensina a Palavra com fidelidade e anuncia o Evangelho de Jesus Cristo — formando discípulos que amam a Deus sobre todas as coisas e ao próximo como a si mesmos.
          </Text>
        </View>

        {/* Pilares */}
        {PILARES.map((p) => (
          <View key={p.titulo} style={styles.pilar}>
            <View style={styles.pilarIcon}><Ionicons name={p.icon as any} size={22} color={colors.gold} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pilarTitulo}>{p.titulo}</Text>
              <Text style={styles.pilarTxt}>{p.texto}</Text>
            </View>
          </View>
        ))}

        {/* Versículo */}
        <View style={styles.verseBox}>
          <Text style={styles.verseText}>“Ide, portanto, fazei discípulos de todas as nações... ensinando-os a guardar todas as coisas que vos tenho ordenado.”</Text>
          <View style={styles.verseLine} />
          <Text style={styles.verseRef}>MATEUS 28:19-20</Text>
        </View>

        {/* Chamada */}
        <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]} onPress={() => router.push('/cadastro' as any)}>
          <Ionicons name="heart" size={18} color={colors.bg} />
          <Text style={styles.ctaTxt}>Quero fazer parte</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  voltar: { position: 'absolute', left: spacing.md, top: 14, zIndex: 20 },
  headerWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 270, height: 135, marginTop: -22, marginBottom: -34 },
  title: { fontFamily: fonts.display, color: colors.gold, fontSize: 28, letterSpacing: 2, textAlign: 'center' },
  lema: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: spacing.sm },

  missaoCard: { backgroundColor: CARD, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, marginBottom: spacing.lg, ...shadow.glow },
  missaoTxt: { fontFamily: fonts.body, color: colors.text, fontSize: 16, lineHeight: 26, textAlign: 'center' },
  dourado: { fontFamily: fonts.bodyBold, color: colors.gold },

  pilar: { flexDirection: 'row', gap: spacing.md, backgroundColor: CARD, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: HAIR, marginBottom: spacing.sm },
  pilarIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: TILE, borderWidth: 1.5, borderColor: colors.gold },
  pilarTitulo: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 17 },
  pilarTxt: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 3 },

  verseBox: { backgroundColor: CARD, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: HAIR, alignItems: 'center' },
  verseText: { fontFamily: fonts.display, color: colors.text, fontSize: 17, lineHeight: 27, textAlign: 'center' },
  verseLine: { width: 44, height: 1.5, backgroundColor: colors.gold, borderRadius: 1, marginTop: spacing.md, marginBottom: spacing.sm },
  verseRef: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 12, letterSpacing: 2 },

  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md, marginTop: spacing.xl, ...shadow.glow },
  ctaTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 15 },
});
