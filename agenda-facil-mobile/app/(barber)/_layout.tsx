import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function BarberLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { borderTopColor: '#e2e8f0', backgroundColor: '#fff', paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="schedule" options={{ title: 'Agenda', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tabs.Screen name="qrcode" options={{ title: 'QR Code', tabBarIcon: ({ color, size }) => <Ionicons name="qr-code" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }} />
    </Tabs>
  )
}
