import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, addDays, subDays, parseISO, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X, Lock, User, CalendarCheck } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { joinBarberRoom, getSocket } from '@/services/socket'
import { Card, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import BarberNav from '@/components/barber/BarberNav'
import type { TimeSlotDto, AppointmentDto, BlockedSlotDto } from '@/services/api'

export default function BarberSchedule() {
  const navigate = useNavigate()
  const { barberProfile } = useStore()
  const { toast } = useToast()

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<TimeSlotDto[]>([])
  const [dayOff, setDayOff] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentDto[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlotDto[]>([])

  const [blockModal, setBlockModal] = useState(false)
  const [apptModal, setApptModal] = useState<AppointmentDto | null>(null)
  const [blockStart, setBlockStart] = useState('12:00')
  const [blockEnd, setBlockEnd] = useState('13:00')
  const [blockReason, setBlockReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const [rescheduleModal, setRescheduleModal] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlotDto[]>([])
  const [rescheduleSlot, setRescheduleSlot] = useState<TimeSlotDto | null>(null)
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!barberProfile) return
    try {
      const [slotsRes, appts, blocks] = await Promise.all([
        api.appointments.getSlots(barberProfile.id, selectedDate),
        api.appointments.getBarberAppts(selectedDate),
        api.appointments.getBlocked(barberProfile.id, selectedDate),
      ])
      setSlots(slotsRes.slots)
      setDayOff(slotsRes.dayOff)
      setAppointments(appts)
      setBlockedSlots(blocks)
    } catch {}
  }, [barberProfile, selectedDate])

  useEffect(() => { loadData() }, [loadData])

  // Tempo real: qualquer evento na sala do barbeiro recarrega os slots
  useEffect(() => {
    if (!barberProfile) return
    joinBarberRoom(barberProfile.id)
    const socket = getSocket()
    if (!socket) return

    const refresh = () => loadData()

    socket.on('appointment_created', refresh)
    // Cancelamento → slot reaparece imediatamente
    socket.on('appointment_canceled', refresh)
    socket.on('appointment_updated', refresh)
    socket.on('slot_blocked', refresh)
    socket.on('slot_unblocked', refresh)

    return () => {
      socket.off('appointment_created', refresh)
      socket.off('appointment_canceled', refresh)
      socket.off('appointment_updated', refresh)
      socket.off('slot_blocked', refresh)
      socket.off('slot_unblocked', refresh)
    }
  }, [barberProfile, loadData])

  if (!barberProfile) return null

  function getApptForSlot(startTime: string) {
    return appointments.find((a) => a.startTime === startTime && a.status !== 'cancelled')
  }

  function getBlockForSlot(startTime: string) {
    return blockedSlots.find(
      (b) => b.startTime <= startTime && b.endTime > startTime,
    )
  }

  async function handleCancelAppt(appt: AppointmentDto) {
    setActionLoading(true)
    try {
      await api.appointments.cancel(appt.id)
      toast('info', 'Agendamento cancelado — horário liberado')
      setApptModal(null)
      await loadData()
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConfirmAppt(appt: AppointmentDto) {
    setActionLoading(true)
    try {
      await api.appointments.updateStatus(appt.id, 'confirmed')
      toast('success', 'Agendamento confirmado')
      setApptModal(null)
      await loadData()
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAddBlock() {
    if (!blockStart || !blockEnd || blockStart >= blockEnd) {
      toast('error', 'Informe um intervalo válido')
      return
    }
    setActionLoading(true)
    try {
      await api.appointments.addBlock({
        date: selectedDate,
        startTime: blockStart,
        endTime: blockEnd,
        reason: blockReason.trim() || undefined,
      })
      toast('success', 'Horário bloqueado')
      setBlockModal(false)
      setBlockReason('')
      await loadData()
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRemoveBlock(slotId: string) {
    try {
      await api.appointments.removeBlock(slotId)
      toast('info', 'Bloqueio removido')
      await loadData()
    } catch (e: any) {
      toast('error', e.message)
    }
  }

  async function openReschedule(appt: AppointmentDto) {
    setRescheduleDate(selectedDate)
    setRescheduleSlot(null)
    setRescheduleSlots([])
    setApptModal(null)
    setRescheduleModal(true)
    if (barberProfile) {
      setRescheduleSlotsLoading(true)
      try {
        const res = await api.appointments.getSlots(barberProfile.id, selectedDate)
        setRescheduleSlots(res.slots.filter((s) => s.available && s.startTime !== appt.startTime))
      } catch {} finally {
        setRescheduleSlotsLoading(false)
      }
    }
    // re-open with appt context stored via closure — store it
    setApptModal(appt)
    setRescheduleModal(true)
  }

  async function loadRescheduleSlots(date: string, appt: AppointmentDto | null) {
    if (!barberProfile || !appt) return
    setRescheduleSlotsLoading(true)
    setRescheduleSlot(null)
    try {
      const res = await api.appointments.getSlots(barberProfile.id, date)
      setRescheduleSlots(res.slots.filter((s) => s.available && s.startTime !== appt.startTime))
    } catch {} finally {
      setRescheduleSlotsLoading(false)
    }
  }

  async function handleReschedule(appt: AppointmentDto) {
    if (!rescheduleSlot) { toast('error', 'Selecione um horário'); return }
    setActionLoading(true)
    try {
      await api.appointments.reschedule(appt.id, { date: rescheduleDate, startTime: rescheduleSlot.startTime })
      toast('success', 'Horário remarcado — cliente notificado')
      setRescheduleModal(false)
      setApptModal(null)
      await loadData()
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const dateLabel = (() => {
    const d = parseISO(selectedDate + 'T12:00:00')
    if (isToday(d)) return 'Hoje'
    return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR })
  })()

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-24">
      <header className="bg-white border-b border-zinc-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/barber/dashboard')} className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500">
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-bold text-zinc-900 flex-1">Minha Agenda</h1>
        <button
          onClick={() => setBlockModal(true)}
          className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50"
        >
          <Lock size={14} /> Bloquear
        </button>
      </header>

      <div className="bg-white border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => setSelectedDate(format(subDays(parseISO(selectedDate + 'T12:00:00'), 1), 'yyyy-MM-dd'))} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-zinc-900 text-sm capitalize">{dateLabel}</p>
            <p className="text-xs text-zinc-400">{selectedDate}</p>
          </div>
          <button onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate + 'T12:00:00'), 1), 'yyyy-MM-dd'))} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {dayOff ? (
          <Card padding="lg" className="text-center">
            <CalendarCheck size={32} className="text-zinc-300 mx-auto mb-3" />
            <p className="font-medium text-zinc-700">Dia de folga</p>
          </Card>
        ) : slots.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-zinc-400 text-sm">Nenhum horário gerado. Verifique suas configurações.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {slots.map((slot) => {
              const block = getBlockForSlot(slot.startTime)
              const appt = getApptForSlot(slot.startTime)

              if (block) {
                return (
                  <div key={slot.startTime} className="flex items-center gap-3 bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3">
                    <Lock size={14} className="text-zinc-400 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-zinc-500">{slot.startTime} – {slot.endTime}</span>
                      {block.reason && <p className="text-xs text-zinc-400">{block.reason}</p>}
                    </div>
                    <button onClick={() => handleRemoveBlock(block.id)} className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-400"><X size={14} /></button>
                  </div>
                )
              }

              if (appt) {
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => setApptModal(appt)}
                    className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-left hover:border-brand-400 transition-colors"
                  >
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{appt.clientName}</p>
                      <p className="text-xs text-zinc-500">{slot.startTime} – {slot.endTime}{appt.serviceType && ` · ${appt.serviceType}`}</p>
                    </div>
                    <Badge color={appt.status === 'confirmed' ? 'green' : 'amber'}>
                      {appt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </Badge>
                  </button>
                )
              }

              return (
                <div key={slot.startTime} className="flex items-center gap-3 bg-white border border-zinc-100 rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-600">{slot.startTime} – {slot.endTime}</span>
                  <span className="ml-auto text-xs text-green-600 font-medium">Disponível</span>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Modal open={blockModal} onClose={() => setBlockModal(false)} title="Bloquear horário">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">Bloquear período em <strong>{selectedDate}</strong></p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-zinc-700 block mb-1.5">Início</label>
              <input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-zinc-700 block mb-1.5">Fim</label>
              <input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <Input label="Motivo (opcional)" placeholder="Ex: Almoço, pausa..." value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setBlockModal(false)}>Cancelar</Button>
            <Button fullWidth loading={actionLoading} onClick={handleAddBlock}>Bloquear</Button>
          </div>
        </div>
      </Modal>

      {apptModal && (
        <Modal open={!!apptModal} onClose={() => setApptModal(null)} title="Agendamento">
          <div className="flex flex-col gap-4">
            <div className="bg-zinc-50 rounded-xl p-4 flex flex-col gap-2">
              {([
                ['Cliente', apptModal.clientName],
                ['Telefone', apptModal.clientPhone],
                ['Horário', `${apptModal.startTime} – ${apptModal.endTime}`],
                apptModal.serviceType ? ['Serviço', apptModal.serviceType] : null,
              ].filter(Boolean) as string[][]).map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-medium text-zinc-900">{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <Badge color={apptModal.status === 'confirmed' ? 'green' : 'amber'}>
                  {apptModal.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {apptModal.status === 'pending' && (
                <Button fullWidth loading={actionLoading} onClick={() => handleConfirmAppt(apptModal)}>Confirmar</Button>
              )}
              <Button variant="secondary" fullWidth loading={actionLoading} onClick={() => openReschedule(apptModal)}>
                Remarcar
              </Button>
              <Button variant="danger" fullWidth loading={actionLoading} onClick={() => handleCancelAppt(apptModal)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {apptModal && (
        <Modal open={rescheduleModal} onClose={() => { setRescheduleModal(false) }} title="Remarcar horário">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-500">Escolha uma nova data e horário para <strong>{apptModal.clientName}</strong></p>
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-1.5">Nova data</label>
              <input
                type="date"
                value={rescheduleDate}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => { setRescheduleDate(e.target.value); loadRescheduleSlots(e.target.value, apptModal) }}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            {rescheduleSlotsLoading ? (
              <p className="text-sm text-zinc-400 text-center">Carregando horários...</p>
            ) : rescheduleSlots.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center">Nenhum horário disponível nesta data</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {rescheduleSlots.map((s) => (
                  <button
                    key={s.startTime}
                    onClick={() => setRescheduleSlot(s)}
                    className={`rounded-xl py-2.5 text-sm font-medium border transition-all ${rescheduleSlot?.startTime === s.startTime ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-zinc-700 border-zinc-200 hover:border-brand-400'}`}
                  >
                    {s.startTime}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setRescheduleModal(false)}>Cancelar</Button>
              <Button fullWidth loading={actionLoading} onClick={() => handleReschedule(apptModal)}>Confirmar remarcação</Button>
            </div>
          </div>
        </Modal>
      )}

      <BarberNav />
    </div>
  )
}
