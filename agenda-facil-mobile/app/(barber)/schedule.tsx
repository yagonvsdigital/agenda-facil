import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { format, addDays, parseISO, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { getSocket } from '@/services/socket'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import type { AppointmentDto, TimeSlotDto } from '@/services/api'

export default function BarberSchedule() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<TimeSlotDto[]>([])
  const [appts, setAppts] = useState<AppointmentDto[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [dayOff, setDayOff] = useState(false)
  const [apptModal, setApptModal] = useState<AppointmentDto | null>(null)
  const [blockModal, setBlockModal] = useState(false)
  const [blockStart, setBlockStart] = useState('12:00')
  const [blockEnd, setBlockEnd] = useState('13:00')
  const [blockReason, setBlockReason] = useState('')
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const p = await api.barbers.getMyProfile()
      setProfile(p)
      const [slotsRes, apptsRes] = await Promise.all([
        api.appointments.getSlots(p.id, selectedDate),
        api.appointments.getBarberAppts(selectedDate),
      ])
      setSlots(slotsRes.slots); setDayOff(slotsRes.dayOff); setAppts(apptsRes)
    } catch {}
  }, [selectedDate])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socket.on('appointment_created', loadData)
    socket.on('appointment_canceled', loadData)
    return () => { socket.off('appointment_created', loadData); socket.off('appointment_canceled', loadData) }
  }, [loadData])

  async function handleCancel(appt: AppointmentDto) {
    setLoading(true)
    try { await api.appointments.cancel(appt.id); await loadData(); setApptModal(null); toast('info', 'Cancelado') }
    catch (e: any) { toast('error', e.message) }
    finally { setLoading(false) }
  }

  async function handleAddBlock() {
    if (!profile) return
    setLoading(true)
    try {
      await api.appointments.addBlock({ barberId: profile.id, date: selectedDate, startTime: blockStart, endTime: blockEnd, reason: blockReason })
      await loadData(); setBlockModal(false); setBlockReason(''); toast('success', 'Horário bloqueado')
    } catch (e: any) { toast('error', e.message) }
    finally { setLoading(false) }
  }

  const dates = Array.from({ length: 14 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'))
  const dateLabel = isToday(parseISO(selectedDate + 'T12:00:00')) ? 'Hoje' : format(parseISO(selectedDate + 'T12:00:00'), "EEE dd/MM", { locale: ptBR })

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Date strip */}
      <View className="bg-white border-b border-slate-100">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="font-bold text-slate-900">Agenda</Text>
          <Pressable onPress={() => setBlockModal(true)} className="flex-row items-center gap-1.5 bg-brand-50 rounded-xl px-3 py-1.5">
            <Ionicons name="lock-closed" size={13} color="#0d9488" />
            <Text className="text-brand-700 text-xs font-semibold">Bloquear</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-3 px-3">
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

      <ScrollView className="flex-1 px-4 py-3">
        <Text className="text-sm font-semibold text-slate-500 mb-3 capitalize">{dateLabel}</Text>

        {dayOff ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Ionicons name="moon" size={32} color="#cbd5e1" />
            <Text className="text-slate-400 text-sm mt-3">Dia de folga</Text>
          </View>
        ) : (
          <View className="gap-2">
            {slots.map(slot => {
              const appt = appts.find(a => a.startTime === slot.startTime && a.status !== 'canceled')
              return (
                <Pressable
                  key={slot.startTime}
                  onPress={() => appt && setApptModal(appt)}
                  className={`flex-row items-center gap-3 rounded-2xl px-4 py-3 border ${appt ? 'bg-brand-50 border-brand-100' : slot.available ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                >
                  <Text className="text-xs font-mono text-slate-500 w-10">{slot.startTime}</Text>
                  {appt ? (
                    <>
                      <View className="w-8 h-8 bg-brand-500 rounded-xl items-center justify-center">
                        <Text className="text-white text-xs font-bold">{(appt.clientName ?? 'C')[0]}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-slate-800 text-sm">{appt.clientName ?? 'Cliente'}</Text>
                        {appt.serviceType && <Text className="text-xs text-brand-600">{appt.serviceType}</Text>}
                      </View>
                      <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
                    </>
                  ) : (
                    <Text className="text-slate-400 text-sm">{slot.available ? 'Disponível' : 'Bloqueado'}</Text>
                  )}
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Appt modal */}
      <Modal visible={!!apptModal} onClose={() => setApptModal(null)} title="Agendamento">
        {apptModal && (
          <View className="gap-4">
            {([['Cliente', apptModal.clientName ?? 'Cliente'], ['Horário', `${apptModal.startTime} – ${apptModal.endTime}`], ...(apptModal.serviceType ? [['Serviço', apptModal.serviceType]] : [])] as [string, string][]).map(([l, v]) => (
              <View key={l} className="flex-row justify-between">
                <Text className="text-slate-500 text-sm">{l}</Text>
                <Text className="font-semibold text-slate-900 text-sm">{v}</Text>
              </View>
            ))}
            <View className="flex-row gap-2 mt-2">
              <Button variant="danger" fullWidth loading={loading} onPress={() => handleCancel(apptModal!)}>Cancelar horário</Button>
            </View>
          </View>
        )}
      </Modal>

      {/* Block modal */}
      <Modal visible={blockModal} onClose={() => setBlockModal(false)} title="Bloquear horário">
        <View className="gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-700 mb-1.5">Início</Text>
              <Input placeholder="12:00" value={blockStart} onChangeText={setBlockStart} keyboardType="numbers-and-punctuation" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-700 mb-1.5">Fim</Text>
              <Input placeholder="13:00" value={blockEnd} onChangeText={setBlockEnd} keyboardType="numbers-and-punctuation" />
            </View>
          </View>
          <Input label="Motivo (opcional)" placeholder="Ex: Almoço, pausa..." value={blockReason} onChangeText={setBlockReason} />
          <View className="flex-row gap-2">
            <Button variant="secondary" fullWidth onPress={() => setBlockModal(false)}>Cancelar</Button>
            <Button fullWidth loading={loading} onPress={handleAddBlock}>Bloquear</Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
