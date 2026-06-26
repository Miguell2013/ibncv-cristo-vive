import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../constants/theme';

// Botão flutuante de "atualizar" — recarrega o app. Aparece em todas as abas (web/PWA).
export function RefreshButton() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return null;

  const onPress = () => {
    try { (window as any).location.reload(); } catch {}
  };

  const barH = Platform.OS === 'web' ? 92 : 64 + insets.bottom;

  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.fab, { bottom: barH + 14 }]} accessibilityLabel="Atualizar">
      <Ionicons name="refresh" size={20} color={colors.gold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    ...shadow.glow,
  },
});
