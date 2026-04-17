import { useState, useRef } from 'react'
import { View, Text, StatusBar, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/services/api'
import { useToast } from '@/components/ui/Toast'

export default function ClientScan() {
  const router = useRouter()
  const { toast } = useToast()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  async function handleBarcode({ data }: { data: string }) {
    if (scanned) return
    setScanned(true)
    try {
      // Extrai o barberId do deep link ou URL
      const id = data.replace('secretariadigital://book/', '').replace(/.*\/book\//, '').trim()
      await api.barbers.getPublic(id)
      router.replace(`/(client)/barber/${id}` as any)
    } catch {
      toast('error', 'QR Code inválido ou profissional não encontrado')
      setTimeout(() => setScanned(false), 2000)
    }
  }

  if (!permission) return <View className="flex-1 bg-slate-50" />

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6 gap-5">
        <View className="w-16 h-16 bg-brand-50 rounded-3xl items-center justify-center">
          <Ionicons name="camera" size={32} color="#0d9488" />
        </View>
        <Text className="font-bold text-slate-900 text-lg text-center">Precisamos da câmera</Text>
        <Text className="text-slate-500 text-sm text-center">Para escanear o QR Code do profissional e acessar a agenda.</Text>
        <Pressable onPress={requestPermission} className="bg-brand-600 rounded-2xl px-8 py-3.5 active:bg-brand-700">
          <Text className="text-white font-bold">Permitir câmera</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} className="py-2">
          <Text className="text-slate-400 text-sm">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        onBarcodeScanned={handleBarcode}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <SafeAreaView className="flex-1">
          {/* Top bar */}
          <View className="flex-row items-center px-4 pt-2">
            <Pressable onPress={() => router.back()} className="p-2 bg-black/40 rounded-xl">
              <Ionicons name="close" size={22} color="white" />
            </Pressable>
            <Text className="text-white font-bold ml-3">Escanear QR Code</Text>
          </View>

          {/* Viewfinder */}
          <View className="flex-1 items-center justify-center">
            <View className="w-64 h-64 relative">
              {/* Corners */}
              {[['top-0 left-0', 'border-t-4 border-l-4'], ['top-0 right-0', 'border-t-4 border-r-4'], ['bottom-0 left-0', 'border-b-4 border-l-4'], ['bottom-0 right-0', 'border-b-4 border-r-4']].map(([pos, borders], i) => (
                <View key={i} className={`absolute ${pos} w-10 h-10 ${borders} border-brand-400 rounded-sm`} />
              ))}
            </View>
            <Text className="text-white/80 text-sm mt-6">Aponte para o QR Code do profissional</Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}
