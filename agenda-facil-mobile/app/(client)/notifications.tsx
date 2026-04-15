import { View, Text, FlatList, Pressable, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useStore } from '@/store/useStore'

export default function ClientNotifications() {
  const { notifications, markAllRead } = useStore()

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center justify-between">
        <Text className="font-bold text-slate-900">Alertas</Text>
        {notifications.some(n => !n.read) && (
          <Pressable onPress={markAllRead}>
            <Text className="text-brand-600 text-sm font-semibold">Marcar tudo como lido</Text>
          </Pressable>
        )}
      </View>
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Ionicons name="notifications-off-outline" size={40} color="#cbd5e1" />
          <Text className="text-slate-400 text-sm">Nenhum alerta por enquanto</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <View className={`rounded-2xl px-4 py-3 border ${item.read ? 'bg-white border-slate-100' : 'bg-brand-50 border-brand-100'}`}>
              <View className="flex-row items-start gap-3">
                <View className={`w-8 h-8 rounded-xl items-center justify-center mt-0.5 ${item.read ? 'bg-slate-100' : 'bg-brand-100'}`}>
                  <Ionicons name="information-circle" size={18} color={item.read ? '#94a3b8' : '#0d9488'} />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${item.read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>{item.message}</Text>
                  <Text className="text-xs text-slate-400 mt-1">{new Date(item.createdAt).toLocaleString('pt-BR')}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}
