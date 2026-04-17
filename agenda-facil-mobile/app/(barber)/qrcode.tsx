import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, Share, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-native-qrcode-svg'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import type { BarberDto } from '@/services/api'

const APP_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'https://seudominio.com.br'

export default function BarberQRCode() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<BarberDto | null>(null)

  useEffect(() => { api.barbers.getMyProfile().then(setProfile).catch(() => null) }, [])

  const bookingUrl = profile ? `${APP_URL}/book/${profile.id}` : ''
  const deepLink = profile ? `secretariadigital://book/${profile.id}` : ''

  async function handleShare(url: string) {
    try { await Share.share({ message: url, url }) }
    catch {}
  }

  if (!profile) return (
    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
      <Text className="text-slate-400">Carregando...</Text>
    </SafeAreaView>
  )

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Text className="text-xl font-extrabold text-slate-900">Meus QR Codes</Text>

        {/* QR 1 — App */}
        <View className="bg-white rounded-3xl p-6 items-center gap-4 border border-slate-100">
          <View className="w-10 h-10 bg-brand-100 rounded-2xl items-center justify-center">
            <Ionicons name="download" size={20} color="#0d9488" />
          </View>
          <Text className="font-bold text-slate-900 text-base">Baixar o Secretaria Digital</Text>
          <Text className="text-xs text-slate-500 text-center">Clientes escaneiam para instalar o app</Text>
          <View className="p-4 bg-slate-50 rounded-2xl">
            <QRCode value="https://play.google.com/store/apps/details?id=com.secretariadigital.app" size={160} color="#0f172a" />
          </View>
          <Pressable onPress={() => handleShare('https://play.google.com/store/apps/details?id=com.secretariadigital.app')} className="flex-row items-center gap-2 bg-brand-50 rounded-xl px-4 py-2.5">
            <Ionicons name="share-outline" size={15} color="#0d9488" />
            <Text className="text-brand-700 text-sm font-semibold">Compartilhar</Text>
          </Pressable>
        </View>

        {/* QR 2 — Agenda */}
        <View className="bg-white rounded-3xl p-6 items-center gap-4 border border-brand-100">
          <View className="w-10 h-10 bg-brand-600 rounded-2xl items-center justify-center">
            <Ionicons name="calendar" size={20} color="white" />
          </View>
          <Text className="font-bold text-slate-900 text-base">Minha Agenda</Text>
          <Text className="text-xs text-slate-500 text-center">Clientes escaneiam e escolhem o horário direto</Text>
          <View className="p-4 bg-slate-50 rounded-2xl">
            <QRCode value={deepLink || bookingUrl} size={180} color="#0d9488" />
          </View>
          <Text className="text-xs text-brand-600 font-mono text-center" numberOfLines={1}>{bookingUrl}</Text>
          <View className="flex-row gap-2 w-full">
            <Pressable onPress={() => handleShare(bookingUrl)} className="flex-1 flex-row items-center justify-center gap-2 bg-brand-600 rounded-xl py-3 active:bg-brand-700">
              <Ionicons name="share-outline" size={15} color="white" />
              <Text className="text-white text-sm font-bold">Compartilhar</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-brand-50 rounded-2xl px-4 py-3 flex-row gap-2">
          <Ionicons name="information-circle" size={18} color="#0d9488" />
          <Text className="text-brand-800 text-xs flex-1">Imprima o QR Code da agenda e cole na entrada do seu estabelecimento. Clientes escaneiam e agendam sozinhos.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
