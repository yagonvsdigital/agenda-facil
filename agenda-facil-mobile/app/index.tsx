import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

const features = [
  { icon: 'qr-code', title: 'QR Code exclusivo', desc: 'Clientes agendam escaneando o código do profissional' },
  { icon: 'flash', title: 'Tempo real', desc: 'Horários somem e reaparecem instantaneamente' },
  { icon: 'shield-checkmark', title: 'Zero conflitos', desc: 'Nenhum cliente pega o mesmo horário' },
]

export default function Onboarding() {
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 pt-10 pb-8">

          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-brand-600 rounded-3xl items-center justify-center mb-4 shadow-lg">
              <Ionicons name="calendar-sharp" size={32} color="white" />
            </View>
            <Text className="text-2xl font-extrabold text-slate-900 tracking-tight">Agenda Fácil</Text>
            <Text className="text-slate-500 text-sm mt-1">Sua secretária digital</Text>
          </View>

          {/* Hero text */}
          <View className="mb-8">
            <Text className="text-3xl font-extrabold text-slate-900 leading-tight mb-3">
              Agendamento{'\n'}
              <Text className="text-brand-600">inteligente</Text>
            </Text>
            <Text className="text-slate-500 text-base leading-relaxed">
              Substitua a agenda física. Um QR Code na parede e seus clientes agendam sozinhos — em menos de 10 segundos.
            </Text>
          </View>

          {/* Feature chips */}
          <View className="gap-3 mb-10">
            {features.map(f => (
              <View key={f.title} className="flex-row items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                <View className="w-9 h-9 bg-brand-100 rounded-xl items-center justify-center">
                  <Ionicons name={f.icon as any} size={18} color="#0d9488" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-800">{f.title}</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTAs */}
          <View className="gap-3">
            <Pressable
              onPress={() => router.push('/(auth)/register-barber')}
              className="bg-brand-600 rounded-2xl py-4 items-center active:bg-brand-700"
            >
              <Text className="text-white font-bold text-base">Sou profissional</Text>
              <Text className="text-brand-200 text-xs mt-0.5">Crie sua agenda gratuita</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(auth)/register-client')}
              className="bg-slate-100 rounded-2xl py-4 items-center active:bg-slate-200"
            >
              <Text className="text-slate-700 font-bold text-base">Sou cliente</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(auth)/login')} className="py-3 items-center">
              <Text className="text-brand-600 text-sm font-semibold">Já tenho conta → Entrar</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
