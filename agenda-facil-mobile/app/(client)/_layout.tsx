import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ClientLayout() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = 60 + insets.bottom

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopColor: '#e2e8f0',
          backgroundColor: '#fff',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
          height: tabBarHeight,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alertas', tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} /> }} />
      <Tabs.Screen name="scan" options={{ href: null }} />
      <Tabs.Screen name="barber" options={{ href: null }} />
    </Tabs>
  )
}
