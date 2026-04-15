import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays, parseISO, isToday, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, CheckCircle, MapPin, Clock, CalendarCheck,
} from 'lucide-react'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { joinBarberRoom, getSocket } from '@/services/socket'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import type { BarberDto, TimeSlotDto, ClientProfessionalDto } from '@/services/api'

const SERVICE_TYPES = ['Corte social', 'Degradê', 'Corte + barba', 'Barba', 'Navalhado', 'Platinado', 'Outro']

export default function ClientBarberView() {
  const { barberId } = useParams<{ barberId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useStore()
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
  const [cancelModal, setCancelModal] = useState<string | null>(null) // appointmentId
  const [booking, setBooking] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const loadSlots = useCallback(async () => {
    if (!barberId) return
    try {
      const res = await api.appointments.getSlots(barberId, selectedDate)
      setSlots(res.slots)
      setDayOff(res.dayOff)
    } catch {}
  }, [barberId, selectedDate])

  useEffect(() => {
    if (!barberId) return
    api.barbers.getPublic(barberId).then(setBarber).catch(() => null)
    api.clients.getMyProfessionals().then(list => {
      setProfessional(list.find(p => p.barberId === barberId) ?? null)
    }).catch(() => null)
  }, [barberId])

  useEffect(() => { loadSlots() }, [loadSlots])

  useEffect(() => {
    if (!barberId) return
    joinBarberRoom(barberId)
    const socket = getSocket()
    if (!socket) return
    const refresh = () => loadSlots()
    socket.on('appointment_created', refresh)
    socket.on('appointment_canceled', refresh)
    socket.on('appointment_updated', refresh)
    socket.on('slot_blocked', refresh)
    socket.on('slot_unblocked', refresh)
    socket.on('appointment_rescheduled', () => {
      refresh()
      toast('info', 'Este profissional remarcou um horário')
    })
    return () => {
      socket.off('appointment_created', refresh)
      socket.off('appointment_canceled', refresh)
      socket.off('appointment_updated', refresh)
      socket.off('slot_blocked', refresh)
      socket.off('slot_unblocked', refresh)
      socket.off('appointment_rescheduled')
    }
  }, [barberId, loadSlots, toast])

  const today = startOfDay(new Date())

  const displayName = professional?.nickname || barber?.salonName || barber?.user?.name || 'Profissional'

  const dateLabel = (() => {
    const d = parseISO(selectedDate + 'T12:00:00')
    if (isToday(d)) return 'Hoje'
    return format(d, "EEE, dd 'de' MMM", { locale: ptBR })
  })()

  async function handleConfirmBooking() {
    if (!selectedSlot || !currentUser || !barber) return
    setBooking(true)
    try {
      await api.appointments.book({
        barberId: barber.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        serviceType: serviceType || undefined,
      })
      // Garante que o profissional está na lista (caso ainda não esteja)
      await api.clients.addProfessional(barber.id).catch(() => null)
      await loadSlots()
      setConfirmModal(false)
      setSuccessModal(true)
    } catch (e: any) {
      toast('error', e.message)
      await loadSlots()
      setConfirmModal(false)
    } finally {
      setBooking(false)
    }
  }

  async function handleCancel(appointmentId: string) {
    setCancelling(true)
    try {
      await api.appointments.cancel(appointmentId)
      await loadSlots()
      setCancelModal(null)
      toast('info', 'Agendamento cancelado — horário liberado')
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setCancelling(false)
    }
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <CalendarCheck size={40} className="text-zinc-300 mx-auto mb-3" />
          <p className="font-semibold text-zinc-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const availableCount = slots.filter(s => s.available).length

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate('/client/dashboard')} className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500">
            <ChevronLeft size={18} />
          </button>
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <CalendarCheck size={18} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-zinc-900 text-sm truncate">{displayName}</p>
            <p className="text-xs text-zinc-400 flex items-center gap-1 truncate">
              {barber.address
                ? <><MapPin size={10} /> {barber.address}</>
                : <><Clock size={10} /> {barber.workingHours.start} – {barber.workingHours.end}</>
              }
            </p>
          </div>
        </div>
      </header>

      {/* Navegação de data */}
      <div className="bg-white border-b border-zinc-100">
        <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => {
              const prev = format(addDays(parseISO(selectedDate + 'T12:00:00'), -1), 'yyyy-MM-dd')
              if (!isBefore(parseISO(prev + 'T12:00:00'), today)) setSelectedDate(prev)
            }}
            disabled={!isBefore(today, parseISO(selectedDate + 'T12:00:00'))}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-zinc-900 text-sm capitalize">{dateLabel}</p>
            {!dayOff && availableCount > 0 && (
              <p className="text-xs text-green-600">{availableCount} horários disponíveis</p>
            )}
            {!dayOff && availableCount === 0 && slots.length > 0 && (
              <p className="text-xs text-zinc-400">Todos os horários ocupados</p>
            )}
          </div>
          <button
            onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate + 'T12:00:00'), 1), 'yyyy-MM-dd'))}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grade de slots */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {dayOff ? (
          <div className="bg-white border border-zinc-100 rounded-2xl p-8 text-center">
            <CalendarCheck size={32} className="text-zinc-300 mx-auto mb-3" />
            <p className="font-medium text-zinc-700">Sem atendimento neste dia</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white border border-zinc-100 rounded-2xl p-8 text-center">
            <p className="text-zinc-400 text-sm">Nenhum horário disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isMyAppt = slot.appointmentId && !slot.available
              return (
                <button
                  key={slot.startTime}
                  onClick={() => {
                    if (!slot.available && isMyAppt) {
                      setCancelModal(slot.appointmentId!)
                    } else if (slot.available) {
                      setSelectedSlot(slot)
                      setServiceType('')
                      setConfirmModal(true)
                    }
                  }}
                  className={`rounded-2xl py-4 px-2 text-center transition-all border ${
                    slot.available
                      ? 'bg-white border-zinc-100 hover:border-brand-400 hover:shadow-sm active:scale-95'
                      : isMyAppt
                        ? 'bg-brand-50 border-brand-200 cursor-pointer hover:border-brand-400'
                        : 'bg-zinc-50 border-zinc-100 cursor-not-allowed opacity-50'
                  }`}
                >
                  <p className={`font-semibold text-sm ${slot.available ? 'text-zinc-900' : isMyAppt ? 'text-brand-700' : 'text-zinc-400'}`}>
                    {slot.startTime}
                  </p>
                  <p className={`text-xs mt-0.5 ${slot.available ? 'text-green-600' : isMyAppt ? 'text-brand-500' : 'text-zinc-400'}`}>
                    {slot.available ? 'Livre' : isMyAppt ? 'Meu horário' : 'Ocupado'}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal confirmação de agendamento */}
      <Modal open={confirmModal} onClose={() => setConfirmModal(false)} title="Confirmar agendamento">
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Profissional</span><span className="font-medium">{displayName}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Data</span><span className="font-medium capitalize">{dateLabel}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Horário</span><span className="font-medium">{selectedSlot?.startTime} – {selectedSlot?.endTime}</span></div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">Tipo de serviço (opcional)</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map((s) => (
                <button
                  key={s}
                  onClick={() => setServiceType(serviceType === s ? '' : s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    serviceType === s ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-zinc-600 border-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setConfirmModal(false)}>Cancelar</Button>
            <Button fullWidth loading={booking} onClick={handleConfirmBooking}>Confirmar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal sucesso */}
      <Modal open={successModal} onClose={() => setSuccessModal(false)}>
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Agendado!</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Com <strong>{displayName}</strong> às <strong>{selectedSlot?.startTime}</strong> em <strong className="capitalize">{dateLabel}</strong>.
            </p>
          </div>
          <Button fullWidth onClick={() => setSuccessModal(false)}>Perfeito!</Button>
        </div>
      </Modal>

      {/* Modal cancelar meu agendamento */}
      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancelar agendamento">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600">
            Deseja cancelar seu horário com <strong>{displayName}</strong>?
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setCancelModal(null)}>Manter</Button>
            <Button variant="danger" fullWidth loading={cancelling} onClick={() => cancelModal && handleCancel(cancelModal)}>
              Cancelar horário
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
