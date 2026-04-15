import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays, parseISO, isToday, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Scissors, MapPin, Clock, ChevronLeft, ChevronRight, CheckCircle, Calendar, User } from 'lucide-react'
import { api, BarberDto, TimeSlotDto } from '@/services/api'
import { useStore } from '@/store/useStore'
import { joinBarberRoom, getSocket } from '@/services/socket'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

const SERVICE_TYPES = ['Corte social', 'Degradê', 'Corte + barba', 'Barba', 'Navalhado', 'Platinado', 'Outro']

export default function BookingPage() {
  const { barberId } = useParams<{ barberId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const { toast } = useToast()

  const [barber, setBarber] = useState<BarberDto | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<TimeSlotDto[]>([])
  const [dayOff, setDayOff] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null)
  const [serviceType, setServiceType] = useState('')
  const [confirmModal, setConfirmModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [booking, setBooking] = useState(false)

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
    api.barbers.getPublic(barberId).then(setBarber).catch(() => setBarber(null))
  }, [barberId])

  useEffect(() => { loadSlots() }, [loadSlots])

  useEffect(() => {
    if (!barberId) return
    joinBarberRoom(barberId)
    const socket = getSocket()
    if (!socket) return

    const refresh = () => loadSlots()

    // Quando alguém agendou → slot some
    socket.on('appointment_created', refresh)
    // Quando alguém cancelou → slot reaparece imediatamente
    socket.on('appointment_canceled', refresh)
    socket.on('appointment_updated', refresh)
    socket.on('slot_blocked', refresh)
    socket.on('slot_unblocked', refresh)
    // Quando barbeiro remarca → slots atualizam
    socket.on('appointment_rescheduled', () => {
      refresh()
      toast('info', 'Um horário foi remarcado pelo profissional')
    })

    return () => {
      socket.off('appointment_created', refresh)
      socket.off('appointment_canceled', refresh)
      socket.off('appointment_updated', refresh)
      socket.off('slot_blocked', refresh)
      socket.off('slot_unblocked', refresh)
      socket.off('appointment_rescheduled')
    }
  }, [barberId, loadSlots])

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center"><Scissors size={40} className="text-zinc-300 mx-auto mb-3" /><p className="font-semibold text-zinc-600">Profissional não encontrado</p></div>
      </div>
    )
  }

  const isLoggedIn = !!currentUser && currentUser.role === 'client'

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

  const today = startOfDay(new Date())
  const availableCount = slots.filter((s) => s.available).length
  const dateLabel = (() => {
    const d = parseISO(selectedDate + 'T12:00:00')
    if (isToday(d)) return 'Hoje'
    return format(d, "EEE, dd 'de' MMM", { locale: ptBR })
  })()

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
          {isLoggedIn && (
            <button onClick={() => navigate('/client/dashboard')} className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500"><ChevronLeft size={18} /></button>
          )}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0"><Scissors size={18} className="text-white" /></div>
            <div className="min-w-0">
              <p className="font-bold text-zinc-900 text-sm truncate">{barber.salonName ?? barber.user?.name}</p>
              <p className="text-xs text-zinc-400 flex items-center gap-1 truncate">
                {barber.address ? (<><MapPin size={10} /> {barber.address}</>) : (<><Clock size={10} /> {barber.workingHours.start} – {barber.workingHours.end}</>)}
              </p>
            </div>
          </div>
          {!isLoggedIn && (
            <button onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)} className="text-xs text-brand-600 font-medium border border-brand-200 px-3 py-1.5 rounded-xl hover:bg-brand-50">Entrar</button>
          )}
        </div>
      </header>

      <div className="bg-white border-b border-zinc-100">
        <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => { const prev = format(addDays(parseISO(selectedDate + 'T12:00:00'), -1), 'yyyy-MM-dd'); if (!isBefore(parseISO(prev + 'T12:00:00'), today)) setSelectedDate(prev) }} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 disabled:opacity-30" disabled={!isBefore(today, parseISO(selectedDate + 'T12:00:00'))}><ChevronLeft size={18} /></button>
          <div className="text-center">
            <p className="font-semibold text-zinc-900 text-sm capitalize">{dateLabel}</p>
            {!dayOff && availableCount > 0 && <p className="text-xs text-green-600">{availableCount} horários disponíveis</p>}
          </div>
          <button onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate + 'T12:00:00'), 1), 'yyyy-MM-dd'))} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500"><ChevronRight size={18} /></button>
        </div>
      </div>

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {!isLoggedIn && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-sm text-amber-800 flex items-start gap-3">
            <User size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Cadastro necessário para agendar</p>
              <p className="mt-0.5 text-xs"><button onClick={() => navigate('/register/client')} className="underline font-medium">Crie sua conta grátis</button>{' '}ou{' '}<button onClick={() => navigate('/login')} className="underline font-medium">faça login</button></p>
            </div>
          </div>
        )}
        {dayOff ? (
          <Card padding="lg" className="text-center"><Calendar size={32} className="text-zinc-300 mx-auto mb-3" /><p className="font-medium text-zinc-700">Sem atendimento</p><p className="text-sm text-zinc-400 mt-1">Profissional não atende neste dia</p></Card>
        ) : slots.length === 0 ? (
          <Card padding="lg" className="text-center"><p className="text-zinc-400 text-sm">Nenhum horário disponível</p></Card>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.startTime}
                onClick={() => { if (!slot.available) return; if (!isLoggedIn) { navigate(`/register/client`); return } setSelectedSlot(slot); setConfirmModal(true) }}
                disabled={!slot.available}
                className={`rounded-2xl py-4 px-3 text-center transition-all border ${slot.available ? 'bg-white border-zinc-100 hover:border-brand-400 hover:shadow-sm active:scale-95' : 'bg-zinc-50 border-zinc-100 cursor-not-allowed opacity-60'}`}
              >
                <p className={`font-semibold text-sm ${slot.available ? 'text-zinc-900' : 'text-zinc-400'}`}>{slot.startTime}</p>
                <p className={`text-xs mt-0.5 ${slot.available ? 'text-green-600' : 'text-zinc-400'}`}>{slot.available ? 'Disponível' : 'Ocupado'}</p>
              </button>
            ))}
          </div>
        )}
      </main>

      <Modal open={confirmModal} onClose={() => setConfirmModal(false)} title="Confirmar agendamento">
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Profissional</span><span className="font-medium">{barber.salonName ?? barber.user?.name}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Data</span><span className="font-medium capitalize">{dateLabel}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Horário</span><span className="font-medium">{selectedSlot?.startTime} – {selectedSlot?.endTime}</span></div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">Tipo de serviço (opcional)</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map((s) => (
                <button key={s} onClick={() => setServiceType(serviceType === s ? '' : s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${serviceType === s ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-zinc-600 border-zinc-200'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setConfirmModal(false)}>Cancelar</Button>
            <Button fullWidth loading={booking} onClick={handleConfirmBooking}>Confirmar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={successModal} onClose={() => setSuccessModal(false)}>
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center"><CheckCircle size={32} className="text-green-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Agendado!</h2>
            <p className="text-sm text-zinc-500 mt-1">Horário com <strong>{barber.salonName ?? barber.user?.name}</strong> para <strong className="capitalize">{dateLabel}</strong> às <strong>{selectedSlot?.startTime}</strong>.</p>
          </div>
          <Button fullWidth onClick={() => { setSuccessModal(false); navigate('/client/dashboard') }}>Ver meus agendamentos</Button>
        </div>
      </Modal>
    </div>
  )
}
