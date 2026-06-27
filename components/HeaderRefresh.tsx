import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';

// Botão "atualizar" do cabeçalho — igual ao da Home (canto superior esquerdo,
// faz parte do topo da página e rola junto, não flutua). Só web.
export function HeaderRefresh({ top = 8, align = 'left' }: { top?: number; align?: 'left' | 'right' }) {
  if (Platform.OS !== 'web') return null;
  return (
    <Pressable
      onPress={() => { try { (window as any).location.reload(); } catch {} }}
      hitSlop={10}
      style={[styles.btn, align === 'right' ? { right: spacing.md } : { left: spacing.md }, { top }]}
      accessibilityLabel="Atualizar"
    >
      <Ionicons name="refresh" size={24} color={colors.gold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { position: 'absolute', zIndex: 20 },
});
