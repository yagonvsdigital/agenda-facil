import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, RefreshControl, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { getSocket } from '@/services/socket'
import type { AppointmentDto, BarberDto } from '@/services/api'

const STATUS_COLOR: Record<string, string> = {
  confirmed: '#0d9488', pending: '#f59e0b', completed: '#64748b', canceled: '#ef4444',
}
const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmado', pending: 'Pendente', completed: 'Concluído', canceled: 'Cancelado',
}

export default function BarberDashboard() {
  const { currentUser, logout } = useStore()
  const [profile, setProfile] = useState<BarberDto | null>(null)
  const [appts, setAppts] = useState<AppointmentDto[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  const load = useCallback(async () => {
    try {
      const [p, a] = await Promise.all([api.barbers.getMyProfile(), api.appointments.getBarberAppts(today)])
      setProfile(p); setAppts(a)
    } catch {}
  }, [today])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socket.on('appointment_created', load)
    socket.on('appointment_canceled', load)
    return () => { socket.off('appointment_created', load); socket.off('appointment_canceled', load) }
  }, [load])

  const todayAppts = appts.filter(a => a.date === today && a.status !== 'canceled')
  const confirmed = todayAppts.filter(a => a.status === 'confirmed').length
  const pending = todayAppts.filter(a => a.status === 'pending').length

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor="#0d9488" />}
      >
        {/* Header */}
        <View className="bg-brand-600 px-5 pt-4 pb-8">
          <View className="flex-row items-center justify-between mb-1">
            <View>
              <Text className="text-brand-200 text-xs font-semibold">Olá,</Text>
              <Text className="text-white text-xl font-extrabold">{currentUser?.name.split(' ')[0]} 👋</Text>
            </View>
            <Pressable onPress={logout} className="p-2 rounded-xl bg-white/10 active:bg-white/20">
              <Ionicons name="log-out-outline" size={20} color="white" />
            </Pressable>
          </View>
          {profile && (
            <Text className="text-brand-200 text-xs">{profile.salonName ?? 'Configure seu perfil →'}</Text>
          )}
        </View>

        <View className="-mt-4 px-4 pb-6 gap-4">
          {/* Stats */}
          <View className="flex-row gap-3">
            {[
              { label: 'Hoje', value: todayAppts.length, icon: 'calendar', color: '#0d9488' },
              { label: 'Confirmados', value: confirmed, icon: 'checkmark-circle', color: '#10b981' },
              { label: 'Pendentes', value: pending, icon: 'time', color: '#f59e0b' },
            ].map(s => (
              <View key={s.label} className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm">
                <Ionicons name={s.icon as any} size={22} color={s.color} />
                <Text className="text-2xl font-extrabold text-slate-900 mt-1">{s.value}</Text>
                <Text className="text-xs text-slate-500">{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Today's appointments */}
          <View>
            <Text className="text-slate-900 font-bold text-base mb-3">
              Agendamentos de hoje · {format(new Date(), "dd 'de' MMM", { locale: ptBR })}
            </Text>
            {todayAppts.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center">
                <Ionicons name="calendar-outline" size={32} color="#cbd5e1" />
                <Text className="text-slate-400 text-sm mt-3">Nenhum agendamento hoje</Text>
              </View>
            ) : (
              <View className="gap-2">
                {todayAppts.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(a => (
                  <View key={a.id} className="bg-white rounded-2xl px-4 py-3 flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-brand-50 rounded-xl items-center justify-center">
                      <Text className="text-brand-700 text-xs font-bold">{a.startTime}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-slate-900 text-sm">{a.clientName ?? 'Cliente'}</Text>
                      {a.serviceType && <Text className="text-xs text-slate-500">{a.serviceType}</Text>}
                    </View>
                    <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: STATUS_COLOR[a.status] + '20' }}>
                      <Text className="text-xs font-semibold" style={{ color: STATUS_COLOR[a.status] }}>{STATUS_LABEL[a.status]}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
