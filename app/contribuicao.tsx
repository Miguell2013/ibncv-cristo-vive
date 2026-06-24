import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Image, ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, shadow } from '../constants/theme';
import { supabase } from '../services/supabase';
import { useIdentity } from '../contexts/identity';

const IMG_SEMEADURA = 'https://ibncv.b-cdn.net/semeadura.png';
const TITULAR = 'Igreja Batista Nacional Cristo Vive';
const BANCO = 'Sicoob Credinacional (756) · Coop. 3089';

const PIX_GERAL = '20.921.813/0001-21';
const CONTA_GERAL = 'Conta 5.890-4';
const QR_GERAL = '/qr-dizimo.png';
const COPIA_GERAL = '00020126360014br.gov.bcb.pix0114209218130001215204000053039865802BR5918IGREJA CRISTO VIVE6009SAO PAULO62070503***6304FC07';

const PIX_CADEIRAS = '3c8e22f6-17c0-4a42-9e6f-46a55a379d82';
const CONTA_CADEIRAS = 'Conta 612724816';
const QR_CADEIRAS = '/qr-cadeiras.png';
const COPIA_CADEIRAS = '00020126580014br.gov.bcb.pix01363c8e22f6-17c0-4a42-9e6f-46a55a379d825204000053039865802BR5918IGREJA CRISTO VIVE6009SAO PAULO62070503***630406CA';

const OFERTAS = [
  { icon: 'gift', nome: 'Dízimo', desc: 'A décima parte, com gratidão e fidelidade' },
  { icon: 'heart', nome: 'Oferta', desc: 'Uma semente voluntária e alegre' },
  { icon: 'globe', nome: 'Missões', desc: 'Levar o evangelho a outras nações' },
];

export default function Contribuicao() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width, 640);
  const { identidade } = useIdentity();
  const [copiado, setCopiado] = useState<string | null>(null);
  const [agradecido, setAgradecido] = useState(false);

  async function jaContribui(tipo: string) {
    setAgradecido(true);
    try {
      await supabase.rpc('avisei_contribuicao', {
        p_id: identidade?.pessoaId ?? null,
        p_nome: identidade?.nome ?? null,
        p_whatsapp: identidade?.whatsapp ?? null,
        p_tipo: tipo,
      });
    } catch {}
  }

  function copiar(texto: string, id: string) {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(texto);
      }
    } catch {}
    setCopiado(id);
    setTimeout(() => setCopiado((c) => (c === id ? null : c)), 1800);
  }

  if (agradecido) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <View style={[styles.obrigadoCard, { maxWidth: 380 }]}>
          <View style={styles.obrigadoIcon}><Ionicons name="heart" size={40} color={colors.gold} /></View>
          <Text style={styles.obrigadoTitle}>Deus te abençoe! 🤍</Text>
          <Text style={styles.obrigadoText}>Recebemos seu aviso de contribuição com gratidão. Que o Senhor multiplique sua generosidade e supra todas as suas necessidades.</Text>
          <Text style={styles.obrigadoVerse}>“E o meu Deus suprirá todas as vossas necessidades, segundo as suas riquezas, em glória.” — Filipenses 4.19</Text>
          <Pressable style={({ pressed }) => [styles.obrigadoBtn, pressed && styles.pressed]} onPress={() => { setAgradecido(false); router.back(); }}>
            <Text style={styles.obrigadoBtnTxt}>Voltar ao início</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={[styles.body, { maxWidth: maxW }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.text} /></Pressable>
          <Text style={styles.topTitle}>Contribuição</Text>
          <View style={{ width: 26 }} />
        </View>

        <ImageBackground source={{ uri: IMG_SEMEADURA }} style={styles.hero} imageStyle={styles.heroImg}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroVerse}>“Aquele que semeia pouco, pouco também colherá; e aquele que semeia com fartura, com abundância também colherá.”</Text>
            <Text style={styles.heroRef}>2 Coríntios 9.6</Text>
          </View>
        </ImageBackground>

        {/* DÍZIMOS E OFERTAS */}
        <Text style={styles.sec}>Dízimos e Ofertas</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Chave PIX (CNPJ)</Text>
          <View style={styles.pixRow}>
            <Text style={styles.pixKey} selectable>{PIX_GERAL}</Text>
            <Pressable style={({ pressed }) => [styles.copiarBtn, pressed && styles.pressed]} onPress={() => copiar(PIX_GERAL, 'geral')}>
              <Ionicons name={copiado === 'geral' ? 'checkmark' : 'copy-outline'} size={15} color={colors.bg} />
              <Text style={styles.copiarTxt}>{copiado === 'geral' ? 'Copiado!' : 'Copiar'}</Text>
            </Pressable>
          </View>
          <Text style={styles.dado}>{TITULAR}</Text>
          <Text style={styles.dado}>{BANCO} · {CONTA_GERAL}</Text>

          <View style={styles.qrWrap}>
            <Image source={{ uri: QR_GERAL }} style={styles.qr} resizeMode="contain" />
            <Text style={styles.qrTxt}>Aponte a câmera do seu banco</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.copiaCola, pressed && styles.pressed]} onPress={() => copiar(COPIA_GERAL, 'cc-geral')}>
            <Ionicons name={copiado === 'cc-geral' ? 'checkmark' : 'qr-code-outline'} size={15} color={colors.gold} />
            <Text style={styles.copiaColaTxt}>{copiado === 'cc-geral' ? 'Código copiado!' : 'Copiar código (Pix Copia e Cola)'}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.jaBtn, pressed && styles.pressed]} onPress={() => jaContribui('oferta')}>
            <Ionicons name="checkmark-circle" size={16} color={colors.bg} />
            <Text style={styles.jaBtnTxt}>Já contribuí 🙏</Text>
          </Pressable>
        </View>

        <View style={styles.ofertas}>
          {OFERTAS.map((o) => (
            <View key={o.nome} style={styles.ofertaCard}>
              <Ionicons name={o.icon as any} size={22} color={colors.gold} />
              <Text style={styles.ofertaNome}>{o.nome}</Text>
              <Text style={styles.ofertaDesc}>{o.desc}</Text>
            </View>
          ))}
        </View>

        {/* CAMPANHA DAS CADEIRAS */}
        <Text style={[styles.sec, { marginTop: spacing.xl }]}>Campanha das Cadeiras</Text>
        <View style={styles.campanhaCard}>
          <View style={styles.campanhaHead}>
            <Ionicons name="ribbon" size={22} color={colors.neon} />
            <Text style={styles.campanhaTitle}>Equipe o templo conosco</Text>
          </View>
          <Text style={styles.campanhaSub}>Ajude a igreja a adquirir cadeiras novas pra acolher mais pessoas com conforto. Toda contribuição abençoa. 🤍</Text>
          <Text style={styles.label}>Chave PIX exclusiva da campanha</Text>
          <View style={styles.pixRow}>
            <Text style={styles.pixKey} selectable numberOfLines={1}>{PIX_CADEIRAS}</Text>
            <Pressable style={({ pressed }) => [styles.copiarBtnNeon, pressed && styles.pressed]} onPress={() => copiar(PIX_CADEIRAS, 'cadeiras')}>
              <Ionicons name={copiado === 'cadeiras' ? 'checkmark' : 'copy-outline'} size={15} color={colors.bg} />
              <Text style={styles.copiarTxt}>{copiado === 'cadeiras' ? 'Copiado!' : 'Copiar'}</Text>
            </Pressable>
          </View>
          <Text style={styles.dado}>{TITULAR}</Text>
          <Text style={styles.dado}>{BANCO} · {CONTA_CADEIRAS}</Text>

          <View style={styles.qrWrap}>
            <Image source={{ uri: QR_CADEIRAS }} style={styles.qr} resizeMode="contain" />
            <Text style={styles.qrTxt}>Aponte a câmera do seu banco</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.copiaColaNeon, pressed && styles.pressed]} onPress={() => copiar(COPIA_CADEIRAS, 'cc-cad')}>
            <Ionicons name={copiado === 'cc-cad' ? 'checkmark' : 'qr-code-outline'} size={15} color={colors.neon} />
            <Text style={styles.copiaColaTxtNeon}>{copiado === 'cc-cad' ? 'Código copiado!' : 'Copiar código (Pix Copia e Cola)'}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.jaBtnNeon, pressed && styles.pressed]} onPress={() => jaContribui('cadeiras')}>
            <Ionicons name="checkmark-circle" size={16} color={colors.bg} />
            <Text style={styles.jaBtnTxt}>Já contribuí 🙏</Text>
          </Pressable>
        </View>

        <Text style={styles.rodape}>Que Deus multiplique sua generosidade. Obrigado por sustentar a obra! 🙏</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  body: { width: '100%', paddingHorizontal: spacing.md },

  jaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.sm, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.gold },
  jaBtnNeon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.sm, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.neon },
  jaBtnTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 14 },

  obrigadoCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.gold, ...shadow.glow },
  obrigadoIcon: { width: 86, height: 86, borderRadius: 43, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.gold, marginBottom: spacing.lg },
  obrigadoTitle: { fontFamily: fonts.display, color: colors.text, fontSize: 24, textAlign: 'center' },
  obrigadoText: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: spacing.md },
  obrigadoVerse: { fontFamily: fonts.body, color: colors.goldSoft, fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: spacing.lg, lineHeight: 20 },
  obrigadoBtn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center', marginTop: spacing.xl, ...shadow.glow },
  obrigadoBtnTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 15 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  topTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },

  hero: { minHeight: 200, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end', marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.gold },
  heroImg: { borderRadius: radius.lg },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,9,15,0.55)' },
  heroContent: { padding: spacing.lg },
  heroVerse: { fontFamily: fonts.body, color: '#fff', fontSize: 15, fontStyle: 'italic', lineHeight: 23, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 6 },
  heroRef: { fontFamily: fonts.bodyBold, color: colors.gold, fontSize: 13, marginTop: spacing.sm },

  verseBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, marginBottom: spacing.xl, alignItems: 'center' },
  verseText: { fontFamily: fonts.body, color: colors.text, fontSize: 14, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  verseRef: { fontFamily: fonts.bodySemi, color: colors.goldSoft, fontSize: 13, marginTop: spacing.sm },

  sec: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 20, marginBottom: spacing.md },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.float },
  label: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs },
  pixRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  pixKey: { flex: 1, fontFamily: fonts.bodyBold, color: colors.text, fontSize: 15 },
  copiarBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  copiarBtnNeon: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.neon, borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  copiarTxt: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 13 },
  dado: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 2 },

  qrWrap: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs },
  qr: { width: 180, height: 180, backgroundColor: '#fff', borderRadius: radius.md, padding: spacing.sm },
  qrTxt: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12 },
  copiaCola: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.gold },
  copiaColaTxt: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 13 },
  copiaColaNeon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.neon },
  copiaColaTxtNeon: { fontFamily: fonts.bodySemi, color: colors.neon, fontSize: 13 },

  ofertas: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  ofertaCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.border },
  ofertaNome: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 14 },
  ofertaDesc: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 11, textAlign: 'center' },

  campanhaCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.neon, ...shadow.float },
  campanhaHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  campanhaTitle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 17 },
  campanhaSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, lineHeight: 20, marginBottom: spacing.md },

  rodape: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.xl, lineHeight: 18 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
