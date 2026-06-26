import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, View } from 'react-native';
import {
  useFonts,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { IdentityProvider } from '../contexts/identity';
import { PushPrompt } from '../components/PushPrompt';
import { InstallPrompt } from '../components/InstallPrompt';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Garante, em qualquer modo de build, que o iPhone use barra de status escura/transparente
// (sem faixa branca) e o app abra em tela cheia ao ser adicionado à tela inicial.
function configurarMetaWeb() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const setMeta = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };
  setMeta('apple-mobile-web-app-capable', 'yes');
  setMeta('mobile-web-app-capable', 'yes');
  setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  setMeta('apple-mobile-web-app-title', 'Cristo Vive');
  setMeta('theme-color', '#05090F');
  // viewport com viewport-fit=cover (necessário para a área segura do notch)
  let vp = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (!vp) {
    vp = document.createElement('meta');
    vp.setAttribute('name', 'viewport');
    document.head.appendChild(vp);
  }
  vp.setAttribute(
    'content',
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
  );
  // Ícone da tela inicial (apple-touch-icon)
  const setLink = (rel: string, href: string, sizes?: string) => {
    const sel = sizes ? `link[rel="${rel}"][sizes="${sizes}"]` : `link[rel="${rel}"]`;
    let el = document.querySelector(sel) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      if (sizes) el.setAttribute('sizes', sizes);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };
  setLink('apple-touch-icon', 'https://ibncv.b-cdn.net/logo.png.png');
  setLink('apple-touch-icon', 'https://ibncv.b-cdn.net/logo.png.png', '180x180');
  // Manifest PWA (instalação direta no Android)
  {
    let m = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!m) {
      m = document.createElement('link');
      m.setAttribute('rel', 'manifest');
      document.head.appendChild(m);
    }
    m.setAttribute('href', '/manifest.json');
  }
  try {
    document.documentElement.style.backgroundColor = '#05090F';
    document.body.style.backgroundColor = '#05090F';
  } catch {}
}
configurarMetaWeb();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <SafeAreaProvider>
      <IdentityProvider>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="entrar" options={{ presentation: 'modal' }} />
            <Stack.Screen name="perfil" />
            <Stack.Screen name="painel" />
            <Stack.Screen name="comunidade" />
            <Stack.Screen name="ministerios" />
            <Stack.Screen name="contribuicao" />
            <Stack.Screen name="avisos" />
            <Stack.Screen name="aovivo" />
            <Stack.Screen name="estudos" />
          </Stack>
          <InstallPrompt />
          <PushPrompt />
        </View>
      </IdentityProvider>
    </SafeAreaProvider>
  );
}
