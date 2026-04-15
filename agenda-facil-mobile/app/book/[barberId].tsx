import { useEffect } from 'react'
import { View, Text, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useStore } from '@/store/useStore'

// Deep link: agendafacil://book/BARBER_ID ou https://domain.com/book/BARBER_ID
// Redireciona para a tela de agendamento do cliente ou login se não autenticado

export default function BookDeepLink() {
  const { barberId } = useLocalSearchParams<{ barberId: string }>()
  const router = useRouter()
  const { currentUser } = useStore()

  useEffect(() => {
    if (!barberId) { router.replace('/'); return }
    if (currentUser?.role === 'client') {
      router.replace(`/(client)/barber/${barberId}` as any)
    } else if (currentUser?.role === 'barber') {
      // profissional não deve agendar — mostrar info
      router.replace('/(barber)/')
    } else {
      // Não logado → salvar destino e ir para login
      router.replace('/(auth)/register-client')
    }
  }, [barberId, currentUser])

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <StatusBar barStyle="dark-content" />
      <View className="w-10 h-10 bg-brand-600 rounded-2xl" />
      <Text className="text-slate-500 text-sm mt-4">Abrindo agenda...</Text>
    </SafeAreaView>
  )
}
