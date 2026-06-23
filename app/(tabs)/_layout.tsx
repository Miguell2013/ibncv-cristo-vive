import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Versão que funcionou: bastante folga no rodapé (web/celular no navegador).
  const bottomPad = Platform.OS === 'web' ? 28 : insets.bottom + 10;
  const barHeight = Platform.OS === 'web' ? 92 : 64 + insets.bottom;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgDeep,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: barHeight,
          paddingBottom: bottomPad,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cadastro"
        options={{
          title: 'Acolhida',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="oracao"
        options={{
          title: 'Oração',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mais"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
