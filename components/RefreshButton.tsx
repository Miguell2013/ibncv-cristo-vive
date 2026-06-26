import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

// Botão flutuante de "atualizar" — recarrega o app. Aparece em todas as abas (web/PWA).
export function RefreshButton() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return null;

  const onPress = () => {
    try { (window as any).location.reload(); } catch {}
  };

  return (
    <Pressable onPress={onPress} hitSlop={10} style={[styles.btn, { top: insets.top + 14 }]} accessibilityLabel="Atualizar">
      <Ionicons name="refresh" size={24} color={colors.gold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'fixed' as any, // web: gruda no topo da tela (não rola junto com o conteúdo)
    left: 16,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});
