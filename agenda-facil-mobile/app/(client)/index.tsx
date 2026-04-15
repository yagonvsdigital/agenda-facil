import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, RefreshControl, StatusBar, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { getSocket } from '@/services/socket'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import type { ClientProfessionalDto } from '@/services/api'

const COLORS = ['#0d9488','#7c3aed','#10b981','#ef4444','#f59e0b','#3b82f6']

export default function ClientDashboard() {
  const router = useRouter()
  const { currentUser, logout } = useStore()
  const { toast } = useToast()
  const [professionals, setProfessionals] = useState<ClientProfessionalDto[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [nicknameModal, setNicknameModal] = useState<ClientProfessionalDto | null>(null)
  const [nicknameInput, setNicknameInput] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { setProfessionals(await api.clients.getMyProfessionals()) } catch {}
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socket.on('appointment_rescheduled', () => {
      load(); toast('info', 'Seu horário foi remarcado pelo profissional')
    })
    return () => { socket.off('appointment_rescheduled') }
  }, [load, toast])

  async function saveNickname() {
    if (!nicknameModal) return
    setSaving(true)
    try {
      await api.clients.updateNickname(nicknameModal.barberId, nicknameInput.trim())
      await load(); setNicknameModal(null); toast('success', 'Apelido salvo')
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  const getDisplay = (p: ClientProfessionalDto) => p.nickname || p.barber?.salonName || p.barber?.user?.name || 'Profissional'

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center justify-between">
        <View>
          <Text className="font-bold text-slate-900">Olá, {currentUser?.name.split(' ')[0]} 👋</Text>
          <Text className="text-xs text-slate-400">Meus profissionais</Text>
        </View>
        <Pressable onPress={() => Alert.alert('Sair', 'Deseja sair?', [{ text: 'Cancelar' }, { text: 'Sair', style: 'destructive', onPress: logout }])}>
          <Ionicons name="log-out-outline" size={20} color="#94a3b8" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor="#0d9488" />}
      >
        {professionals.length === 0 ? (
          <View className="flex-1 items-center justify-center py-24 gap-4">
            <View className="w-20 h-20 bg-brand-50 rounded-3xl items-center justify-center">
              <Ionicons name="qr-code" size={36} color="#0d9488" />
            </View>
            <Text className="font-bold text-slate-800 text-lg">Nenhum profissional ainda</Text>
            <Text className="text-slate-400 text-sm text-center px-8">Escaneie o QR Code do seu profissional para adicionar à sua lista</Text>
            <Pressable onPress={() => router.push('/(client)/scan')} className="bg-brand-600 rounded-2xl px-6 py-3 flex-row items-center gap-2 active:bg-brand-700">
              <Ionicons name="qr-code-outline" size={16} color="white" />
              <Text className="text-white font-bold">Escanear QR Code</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3">
            {professionals.map((p, idx) => {
              const color = COLORS[idx % COLORS.length]
              const displayName = getDisplay(p)
              return (
                <Pressable
                  key={p.barberId}
                  onPress={() => router.push(`/(client)/barber/${p.barberId}` as any)}
                  className="bg-white border border-slate-100 rounded-2xl px-4 py-4 flex-row items-center gap-4 active:bg-slate-50"
                >
                  <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: color }}>
                    <Text className="text-white font-bold text-xl">{displayName[0].toUpperCase()}</Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-semibold text-slate-900" numberOfLines={1}>{displayName}</Text>
                    {p.nickname && <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>{p.barber?.salonName}</Text>}
                    <View className="flex-row items-center gap-1 mt-1.5">
                      <Ionicons name="calendar-sharp" size={11} color="#0d9488" />
                      <Text className="text-xs text-brand-600 font-medium">Ver agenda</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => { setNicknameModal(p); setNicknameInput(p.nickname ?? '') }} className="p-2">
                    <Ionicons name="pencil" size={14} color="#cbd5e1" />
                  </Pressable>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(client)/scan')}
        className="absolute bottom-24 right-5 w-14 h-14 bg-brand-600 rounded-2xl items-center justify-center shadow-lg active:bg-brand-700"
      >
        <Ionicons name="add" size={26} color="white" />
      </Pressable>

      {/* Nickname modal */}
      <Modal visible={!!nicknameModal} onClose={() => setNicknameModal(null)} title="Dar apelido">
        <View className="gap-4">
          <Text className="text-sm text-slate-500">Escolha um apelido para <Text className="font-bold">{nicknameModal?.barber?.salonName}</Text></Text>
          <Input label="Apelido" placeholder="Ex: Cabeleireiro, Dentista..." value={nicknameInput} onChangeText={setNicknameInput} />
          <View className="flex-row gap-2">
            <Button variant="secondary" fullWidth onPress={() => setNicknameModal(null)}>Cancelar</Button>
            <Button fullWidth loading={saving} onPress={saveNickname}>Salvar</Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
