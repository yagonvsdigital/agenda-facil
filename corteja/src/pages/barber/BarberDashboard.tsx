import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, QrCode, Bell, Settings, CalendarCheck, Users, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card, Badge } from '@/components/ui/Card'
import BarberNav from '@/components/barber/BarberNav'
import NotificationBell from '@/components/shared/NotificationBell'

export default function BarberDashboard() {
  const navigate = useNavigate()
  const { barberProfile, currentUser, appointments, notifications, loadAppointments } = useStore()

  useEffect(() => {
    const interval = setInterval(loadAppointments, 10000)
    return () => clearInterval(interval)
  }, [loadAppointments])

  if (!barberProfile || !currentUser) return null

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayAppts = appointments
    .filter((a) => a.date === todayStr && a.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const upcomingAppts = appointments
    .filter((a) => a.date > todayStr && a.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5)

  const totalWeek = appointments.filter((a) => a.status !== 'cancelled' && a.date >= todayStr).length
  const unread = notifications.filter((n) => !n.read).length

  function labelDate(date: string) {
    const d = parseISO(date + 'T12:00:00')
    if (isToday(d)) return 'Hoje'
    if (isTomorrow(d)) return 'Amanhã'
    return format(d, "dd 'de' MMMM", { locale: ptBR })
  }

  function statusBadge(status: string) {
    if (status === 'confirmed') return <Badge color="green">Confirmado</Badge>
    if (status === 'pending') return <Badge color="amber">Pendente</Badge>
    if (status === 'completed') return <Badge color="blue">Concluído</Badge>
    return <Badge color="gray">Cancelado</Badge>
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <CalendarCheck size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 text-sm leading-tight">
              {barberProfile.salonName ?? currentUser.name}
            </p>
            <p className="text-xs text-zinc-400 leading-tight">Painel do profissional</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => navigate('/barber/settings')}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: 'Hoje', value: todayAppts.length, color: 'text-brand-500' },
            { icon: TrendingUp, label: 'Esta semana', value: totalWeek, color: 'text-blue-500' },
            { icon: Bell, label: 'Alertas', value: unread, color: 'text-red-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} padding="sm">
              <div className="flex flex-col items-center gap-1 py-1">
                <Icon size={20} className={color} />
                <p className="text-xl font-bold text-zinc-900">{value}</p>
                <p className="text-xs text-zinc-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => navigate('/barber/schedule')} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Calendar size={18} className="text-brand-500" />
              <ChevronRight size={14} className="text-zinc-300" />
            </div>
            <p className="font-semibold text-zinc-900 text-sm">Minha Agenda</p>
            <p className="text-xs text-zinc-400">Ver e gerenciar horários</p>
          </Card>
          <Card onClick={() => navigate('/barber/qrcode')} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <QrCode size={18} className="text-brand-500" />
              <ChevronRight size={14} className="text-zinc-300" />
            </div>
            <p className="font-semibold text-zinc-900 text-sm">Meu QR Code</p>
            <p className="text-xs text-zinc-400">Compartilhar com clientes</p>
          </Card>
        </div>

        {todayAppts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-zinc-900 text-sm flex items-center gap-1.5">
                <Clock size={14} className="text-brand-500" /> Hoje
              </h2>
              <button onClick={() => navigate('/barber/schedule')} className="text-xs text-brand-600 hover:underline">Ver tudo</button>
            </div>
            <div className="flex flex-col gap-2">
              {todayAppts.map((a) => (
                <Card key={a.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users size={16} className="text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 text-sm truncate">{a.clientName}</p>
                      <p className="text-xs text-zinc-400">
                        {a.startTime} – {a.endTime}{a.serviceType && ` · ${a.serviceType}`}
                      </p>
                    </div>
                    {statusBadge(a.status)}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcomingAppts.length > 0 && (
          <div>
            <h2 className="font-semibold text-zinc-900 text-sm flex items-center gap-1.5 mb-3">
              <TrendingUp size={14} className="text-blue-500" /> Próximos agendamentos
            </h2>
            <div className="flex flex-col gap-2">
              {upcomingAppts.map((a) => (
                <Card key={a.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 text-sm truncate">{a.clientName}</p>
                      <p className="text-xs text-zinc-400">
                        {labelDate(a.date)} · {a.startTime}{a.serviceType && ` · ${a.serviceType}`}
                      </p>
                    </div>
                    {statusBadge(a.status)}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {todayAppts.length === 0 && upcomingAppts.length === 0 && (
          <Card padding="lg" className="text-center">
            <Calendar size={32} className="text-zinc-300 mx-auto mb-3" />
            <p className="font-medium text-zinc-700">Nenhum agendamento</p>
            <p className="text-sm text-zinc-400 mt-1">Compartilhe seu QR Code para receber clientes</p>
            <button onClick={() => navigate('/barber/qrcode')} className="mt-4 text-sm text-brand-600 font-medium hover:underline">
              Ver meu QR Code
            </button>
          </Card>
        )}
      </main>

      <BarberNav />
    </div>
  )
}
