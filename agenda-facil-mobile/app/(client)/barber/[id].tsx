import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { format, addDays, parseISO, isToday, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { api } from '@/services/api'
import { joinBarberRoom, getSocket } from '@/services/socket'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { BarberDto, TimeSlotDto, ClientProfessionalDto } from '@/services/api'

const SERVICES = ['Corte social', 'Degradê', 'Corte + barba', 'Barba', 'Navalhado', 'Outro']

export default function ClientBarberView() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [barber, setBarber] = useState<BarberDto | null>(null)
  const [professional, setProfessional] = useState<ClientProfessionalDto | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<TimeSlotDto[]>([])
  const [dayOff, setDayOff] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null)
  const [serviceType, setServiceType] = useState('')
  const [confirmModal, setConfirmModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [cancelModal, setCancelModal] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)

  const loadSlots = useCallback(async () => {
    if (!id) return
    try { const r = await api.appointments.getSlots(id, selectedDate); setSlots(r.slots); setDayOff(r.dayOff) }
    catch {}
  }, [id, selectedDate])

  useEffect(() => {
    if (!id) return
    api.barbers.getPublic(id).then(setBarber).catch(() => null)
    api.clients.getMyProfessionals().then(l => setProfessional(l.find(p => p.barberId === id) ?? null)).catch(() => null)
  }, [id])

  useEffect(() => { loadSlots() }, [loadSlots])

  useEffect(() => {
    if (!id) return
    joinBarberRoom(id)
    const socket = getSocket()
    if (!socket) return
    socket.on('appointment_created', loadSlots)
    socket.on('appointment_canceled', loadSlots)
    socket.on('appointment_rescheduled', () => { loadSlots(); toast('info', 'Profissional remarcou um horário') })
    return () => { socket.off('appointment_created', loadSlots); socket.off('appointment_canceled', loadSlots); socket.off('appointment_rescheduled') }
  }, [id, loadSlots, toast])

  const displayName = professional?.nickname || barber?.salonName || barber?.user?.name || 'Profissional'
  const today = startOfDay(new Date())
  const dates = Array.from({ length: 14 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'))
  const dateLabel = isToday(parseISO(selectedDate + 'T12:00:00')) ? 'Hoje' : format(parseISO(selectedDate + 'T12:00:00'), "EEE, dd 'de' MMM", { locale: ptBR })

  async function handleBook() {
    if (!selectedSlot || !id) return
    setBooking(true)
    try {
      await api.appointments.book({ barberId: id, date: selectedDate, startTime: selectedSlot.startTime, serviceType: serviceType || undefined })
      await api.clients.addProfessional(id).catch(() => null)
      await loadSlots(); setConfirmModal(false); setSuccessModal(true)
    } catch (e: any) { toast('error', e.message); await loadSlots(); setConfirmModal(false) }
    finally { setBooking(false) }
  }

  async function handleCancel(apptId: string) {
    try { await api.appointments.cancel(apptId); await loadSlots(); setCancelModal(null); toast('info', 'Cancelado') }
    catch (e: any) { toast('error', e.message) }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
        <View className="w-10 h-10 bg-brand-600 rounded-xl items-center justify-center">
          <Ionicons name="calendar-sharp" size={18} color="white" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-slate-900 text-sm" numberOfLines={1}>{displayName}</Text>
          <Text className="text-xs text-slate-400">{barber?.workingHours?.start} – {barber?.workingHours?.end}</Text>
        </View>
      </View>

      {/* Date strip */}
      <View className="bg-white border-b border-slate-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3 px-3">
          {dates.map(d => {
            const active = d === selectedDate
            const parsed = parseISO(d + 'T12:00:00')
            return (
              <Pressable key={d} onPress={() => setSelectedDate(d)} className={`mr-2 items-center px-3 py-2 rounded-xl ${active ? 'bg-brand-600' : 'bg-slate-100'}`}>
                <Text className={`text-xs ${active ? 'text-brand-100' : 'text-slate-500'}`}>{format(parsed, 'EEE', { locale: ptBR })}</Text>
                <Text className={`text-base font-bold ${active ? 'text-white' : 'text-slate-700'}`}>{format(parsed, 'dd')}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Slots */}
      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-sm font-semibold text-slate-500 mb-3 capitalize">{dateLabel} · {slots.filter(s => s.available).length} disponíveis</Text>
        {dayOff ? (
          <View className="bg-white rounded-2xl p-8 items-center"><Text className="text-slate-400">Sem atendimento neste dia</Text></View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {slots.map(slot => {
              const isMine = !!slot.appointmentId && !slot.available
              return (
                <Pressable
                  key={slot.startTime}
                  onPress={() => {
                    if (isMine) { setCancelModal(slot.appointmentId!) }
                    else if (slot.available) { setSelectedSlot(slot); setServiceType(''); setConfirmModal(true) }
                  }}
                  style={{ width: '30.5%' }}
                  className={`rounded-2xl py-4 items-center border ${slot.available ? 'bg-white border-slate-100 active:border-brand-400' : isMine ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-100 opacity-50'}`}
                >
                  <Text className={`text-sm font-semibold ${slot.available ? 'text-slate-900' : isMine ? 'text-brand-700' : 'text-slate-400'}`}>{slot.startTime}</Text>
                  <Text className={`text-xs mt-0.5 ${slot.available ? 'text-green-600' : isMine ? 'text-brand-500' : 'text-slate-400'}`}>{slot.available ? 'Livre' : isMine ? 'Meu horário' : 'Ocupado'}</Text>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Confirm booking */}
      <Modal visible={confirmModal} onClose={() => setConfirmModal(false)} title="Confirmar agendamento">
        <View className="gap-4">
          <View className="bg-slate-50 rounded-xl p-4 gap-2">
            {[['Profissional', displayName], ['Data', dateLabel], ['Horário', `${selectedSlot?.startTime} – ${selectedSlot?.endTime}`]].map(([l, v]) => (
              <View key={l} className="flex-row justify-between"><Text className="text-slate-500 text-sm">{l}</Text><Text className="font-semibold text-slate-900 text-sm">{v}</Text></View>
            ))}
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">Tipo de serviço (opcional)</Text>
            <View className="flex-row flex-wrap gap-2">
              {SERVICES.map(s => (
                <Pressable key={s} onPress={() => setServiceType(serviceType === s ? '' : s)} className={`px-3 py-1.5 rounded-xl border ${serviceType === s ? 'bg-brand-600 border-brand-600' : 'bg-white border-slate-200'}`}>
                  <Text className={`text-xs font-semibold ${serviceType === s ? 'text-white' : 'text-slate-600'}`}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="flex-row gap-2">
            <Button variant="secondary" fullWidth onPress={() => setConfirmModal(false)}>Cancelar</Button>
            <Button fullWidth loading={booking} onPress={handleBook}>Confirmar</Button>
          </View>
        </View>
      </Modal>

      {/* Success */}
      <Modal visible={successModal} onClose={() => setSuccessModal(false)}>
        <View className="items-center py-4 gap-4">
          <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center">
            <Ionicons name="checkmark-circle" size={36} color="#10b981" />
          </View>
          <Text className="text-xl font-extrabold text-slate-900">Agendado!</Text>
          <Text className="text-sm text-slate-500 text-center">Com <Text className="font-bold">{displayName}</Text> às <Text className="font-bold">{selectedSlot?.startTime}</Text></Text>
          <Button fullWidth onPress={() => setSuccessModal(false)}>Perfeito!</Button>
        </View>
      </Modal>

      {/* Cancel */}
      <Modal visible={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancelar agendamento">
        <View className="gap-4">
          <Text className="text-sm text-slate-600">Deseja cancelar seu horário com <Text className="font-bold">{displayName}</Text>?</Text>
          <View className="flex-row gap-2">
            <Button variant="secondary" fullWidth onPress={() => setCancelModal(null)}>Manter</Button>
            <Button variant="danger" fullWidth onPress={() => cancelModal && handleCancel(cancelModal)}>Cancelar</Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
