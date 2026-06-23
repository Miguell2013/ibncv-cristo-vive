// Identidade visual — Igreja Batista Nacional Cristo Vive (IBNCV)
// Premium: azul-noite profundo + dourado sagrado + verde-vida.

export const colors = {
  bg: '#05090F',          // fundo principal (quase preto, p/ contraste)
  bgDeep: '#02050A',      // fundo mais profundo
  surface: '#13233C',     // cards / superfícies (azul-noite que se destaca)
  surfaceAlt: '#1B3050',  // superfície destacada
  border: '#274064',      // bordas sutis

  gold: '#E6B450',        // dourado sagrado (acento principal — cards premium)
  goldSoft: '#F2D79B',    // dourado claro (texto sobre escuro)
  neon: '#38C6FF',        // azul neon (acento secundário — cards de ação)
  neonSoft: '#8FE0FF',
  green: '#2FB37A',       // verde-vida (ações positivas)
  greenSoft: '#7FD9B4',

  text: '#F4F1E9',        // texto principal (off-white quente)
  textMuted: '#A9B4C6',   // texto secundário
  textFaint: '#6E7C92',   // legendas / hints

  danger: '#E2585B',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(7,14,26,0.72)',
};

export const fonts = {
  // Cinzel = títulos sagrados / display. Inter = corpo.
  display: 'Cinzel_700Bold',
  displaySemi: 'Cinzel_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Caminho base do CDN das imagens (Bunny → pasta ibncv/)
// CDN das imagens (Bunny Pull Zone da igreja). Fixo aqui pra não depender de env.
export const CDN = 'https://ibncv.b-cdn.net';

export const img = {
  // Nomes reais no Bunny (vieram com .png dobrado). Já existentes:
  logo: `${CDN}/logo.png.png`,
  pastor: `${CDN}/pastor.png`,           // foto do pastor (cabeçalho "Que bom te ver")
  evCelebracao: `${CDN}/ev-celebracao.png.png`,
  evVida: `${CDN}/ev-vida-abundante.png.png`,
  evJovens: `${CDN}/ev-jovens.png.png`,
  evCafe: `${CDN}/ev-cafe-palavra.png.png`,
  // Ainda a subir (gerar e enviar) — ajustar a extensão quando subir:
  bannerHome: `${CDN}/hero.png`,        // Home: capa "Assistir ao vivo" (renomear herói.png → hero)
  acolhida: `${CDN}/acolhida.png`,      // tela de Acolhida (imagem limpa)
  oracaoHero: `${CDN}/oracao.png`,      // tela de Oração (imagem limpa)
  edif1: `${CDN}/edif-reino.png`,       // edificação: Reino ou Império
  edif2: `${CDN}/edif-21dias.png`,      // edificação: 21 Dias de Oração
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  neonGlow: {
    shadowColor: colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  // Brilho discreto atrás do card → efeito "flutuando" sutil
  float: {
    shadowColor: colors.neon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
};
