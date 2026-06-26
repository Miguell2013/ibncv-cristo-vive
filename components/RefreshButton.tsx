import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

// Botão "atualizar" — só web. Renderiza um <div> HTML puro com position: fixed,
// pra grudar no topo de verdade (não rola junto com o conteúdo).
export function RefreshButton() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return null;

  const onPress = () => {
    try { (window as any).location.reload(); } catch {}
  };

  return React.createElement(
    'div',
    {
      onClick: onPress,
      title: 'Atualizar',
      'aria-label': 'Atualizar',
      style: {
        position: 'fixed',
        top: (insets.top || 0) + 30,
        left: 16,
        width: 34,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 99999,
      },
    },
    React.createElement(Ionicons as any, { name: 'refresh', size: 24, color: colors.gold })
  );
}
