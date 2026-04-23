import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, QrCode, Zap, ShieldCheck, Bell, Smartphone, BarChart3,
  ArrowRight, CheckCircle, Clock, Users,
} from 'lucide-react'

/* ─── Mockup inline: prévia do produto ─────────────────────────────────── */
function BarberMockup({ title, color, slots }: { title: string; color: string; slots: { time: string; client: string | null; service: string | null }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden w-full max-w-xs">
      <div className={`${color} px-4 py-3 flex items-center gap-2`}>
        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
          <CalendarCheck size={12} className="text-white" />
        </div>
        <div>
          <p className="text-white text-xs font-bold">{title}</p>
          <p className="text-white/70 text-[10px]">Hoje · agenda do dia</p>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {slots.map((s) => (
          <div key={s.time} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${s.client ? 'bg-teal-50 border border-teal-100' : 'bg-slate-50 border border-slate-100'}`}>
            <span className="text-[10px] font-mono text-slate-500 w-8 shrink-0">{s.time}</span>
            {s.client ? (
              <>
                <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-[8px] font-bold">{s.client[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-800 truncate">{s.client}</p>
                  {s.service && <p className="text-[9px] text-teal-600">{s.service}</p>}
                </div>
                <CheckCircle size={10} className="text-teal-500 shrink-0 ml-auto" />
              </>
            ) : (
              <span className="text-[10px] text-slate-400">Disponível</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ClientMockup() {
  const professionals = [
    { name: 'Dr. Yago Neves', type: 'Médico', color: 'bg-teal-500', initial: 'Y' },
    { name: 'W. J. N. Carpentry', type: 'Carpintaria', color: 'bg-amber-500', initial: 'W' },
    { name: 'Manicure Jaqueline M. N.', type: 'Manicure', color: 'bg-pink-500', initial: 'J' },
    { name: 'Barbearia', type: 'Barbearia', color: 'bg-slate-600', initial: 'B' },
  ]
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden w-full max-w-xs">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-slate-900 text-xs font-bold">Meus profissionais</p>
        <p className="text-slate-400 text-[10px]">Selecione para ver a agenda</p>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {professionals.map((p) => (
          <div key={p.name} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 hover:border-teal-200 cursor-pointer transition-colors">
            <div className={`w-8 h-8 ${p.color} rounded-full flex items-center justify-center shrink-0`}>
              <span className="text-white text-xs font-bold">{p.initial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-800 truncate">{p.name}</p>
              <p className="text-[10px] text-slate-400">{p.type}</p>
            </div>
            <ArrowRight size={12} className="text-slate-300 shrink-0 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

function AgendaMockup() {
  const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30']
  const booked = ['09:00','10:00','11:00']
  const mine = '14:30'
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden w-full max-w-xs">
      <div className="bg-teal-600 px-4 py-3 flex items-center gap-2">
        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">Y</span>
        </div>
        <div>
          <p className="text-white text-xs font-bold">Dr. Yago Neves</p>
          <p className="text-teal-200 text-[10px]">Qua, 16 Abr · 5 horários livres</p>
        </div>
      </div>
      <div className="p-3 grid grid-cols-4 gap-1.5">
        {slots.map((s) => {
          const isBooked = booked.includes(s)
          const isMine = s === mine
          return (
            <div key={s} className={`rounded-xl py-2 text-center text-[10px] font-semibold border ${isMine ? 'bg-teal-600 text-white border-teal-600' : isBooked ? 'bg-slate-100 text-slate-300 border-slate-100' : 'bg-white text-slate-700 border-slate-200'}`}>
              {s}
            </div>
          )
        })}
      </div>
      <div className="px-3 pb-3">
        <div className="bg-teal-600 rounded-xl py-2.5 text-center text-white text-xs font-bold">
          Confirmar 14:30
        </div>
      </div>
    </div>
  )
}
/* ─────────────────────────────────────────────────────────────────────── */

const benefits = [
  {
    icon: QrCode,
    title: 'QR Code exclusivo',
    desc: 'Cada profissional recebe um link e QR Code próprio. Basta imprimir e colar no balcão.',
  },
  {
    icon: Zap,
    title: 'Sincronização em tempo real',
    desc: 'Quando alguém agenda, o horário some para todos instantaneamente. Sem recarregar.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero duplo agendamento',
    desc: 'Transação com lock no banco garante que dois clientes nunca peguem o mesmo slot.',
  },
  {
    icon: Bell,
    title: 'Notificações automáticas',
    desc: 'Profissional recebe alerta a cada novo agendamento. Cliente é avisado de alterações.',
  },
  {
    icon: Smartphone,
    title: 'Funciona em qualquer celular',
    desc: 'Progressive Web App leve, sem necessidade de instalar nada. Abre direto no navegador.',
  },
  {
    icon: BarChart3,
    title: 'Painel completo',
    desc: 'Visualize toda a agenda do dia, bloqueie horários manualmente e gerencie cancelamentos.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center shadow-sm shadow-teal-600/30">
              <CalendarCheck size={15} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">Secretaria Digital</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/register/barber')}
              className="text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Começar grátis
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-12 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
          Agenda online para qualquer profissional
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight max-w-2xl mb-5">
          Agendamento{' '}
          <span className="text-teal-600">inteligente</span>{' '}
          para profissionais reais
        </h1>

        <p className="text-slate-500 text-lg sm:text-xl max-w-lg leading-relaxed mb-10">
          Substitua a agenda física e o WhatsApp. Um QR Code na parede e seus clientes agendam
          sozinhos — em menos de 10 segundos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            onClick={() => navigate('/register/barber')}
            className="group flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sou profissional
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/register/client')}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-2xl text-base border border-slate-200 hover:border-slate-300 transition-all"
          >
            Sou cliente
          </button>
        </div>

        {/* Social proof strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-400">
          {[
            { icon: Users, label: 'Profissionais ativos', value: '500+' },
            { icon: CalendarCheck, label: 'Agendamentos realizados', value: '10k+' },
            { icon: Clock, label: 'Tempo médio para agendar', value: '< 10s' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={13} className="text-teal-500" />
              <span className="font-bold text-slate-600">{value}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-50 to-slate-100 border-y border-slate-200 py-14">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-teal-600 mb-3">
            Veja como funciona
          </p>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Uma interface para cada lado
          </h2>
          <p className="text-center text-slate-500 text-sm mb-10 max-w-md mx-auto">
            O profissional gerencia sua agenda. O cliente escolhe o horário. Cada um na sua tela.
          </p>
          <div className="flex flex-col gap-10">
            {/* Row 1: Cliente + Médico */}
            <div className="flex flex-col sm:flex-row gap-6 items-start justify-center">
              <div className="flex flex-col items-center gap-3 flex-1 max-w-xs mx-auto">
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">Visão do cliente</span>
                <ClientMockup />
              </div>
              <div className="hidden sm:flex items-center self-center text-slate-300"><ArrowRight size={20} /></div>
              <div className="flex flex-col items-center gap-3 flex-1 max-w-xs mx-auto">
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">Dr. Yago Neves · Médico</span>
                <BarberMockup title="Dr. Yago Neves" color="bg-teal-600" slots={[
                  { time: '09:00', client: 'Rafael M.', service: null },
                  { time: '09:30', client: null, service: null },
                  { time: '10:00', client: 'Lucas P.', service: null },
                  { time: '10:30', client: null, service: null },
                  { time: '11:00', client: 'Bruno A.', service: null },
                  { time: '11:30', client: null, service: null },
                ]} />
              </div>
            </div>

            {/* Row 2: Carpentry + Manicure + Barbearia */}
            <div className="flex flex-col sm:flex-row gap-6 items-start justify-center">
              <div className="flex flex-col items-center gap-3 flex-1 max-w-xs mx-auto">
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">W. J. N. Carpentry</span>
                <BarberMockup title="W. J. N. Carpentry" color="bg-amber-600" slots={[
                  { time: '08:00', client: 'Carlos S.', service: 'Orçamento cozinha sob medida' },
                  { time: '09:30', client: null, service: null },
                  { time: '11:00', client: 'Fernanda L.', service: 'Orçamento de closet' },
                  { time: '13:00', client: 'Marcos T.', service: 'Revisão de projeto' },
                  { time: '14:30', client: null, service: null },
                  { time: '16:00', client: 'Ana P.', service: 'Orçamento de deck' },
                ]} />
              </div>
              <div className="flex flex-col items-center gap-3 flex-1 max-w-xs mx-auto">
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">Manicure Jaqueline M. N.</span>
                <BarberMockup title="Manicure Jaqueline" color="bg-pink-500" slots={[
                  { time: '09:00', client: 'Bianca R.', service: 'Unhas em gel' },
                  { time: '10:00', client: null, service: null },
                  { time: '11:00', client: 'Patricia V.', service: 'Manicure + pedicure' },
                  { time: '13:00', client: 'Camila F.', service: 'Nail art' },
                  { time: '14:30', client: null, service: null },
                  { time: '15:30', client: 'Renata M.', service: 'Esmaltação' },
                ]} />
              </div>
              <div className="flex flex-col items-center gap-3 flex-1 max-w-xs mx-auto">
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">Barbearia</span>
                <BarberMockup title="Barbearia" color="bg-slate-700" slots={[
                  { time: '09:00', client: 'João V.', service: 'Degradê + barba' },
                  { time: '09:30', client: null, service: null },
                  { time: '10:00', client: 'Pedro H.', service: 'Corte social' },
                  { time: '10:30', client: 'Diego M.', service: 'Barba' },
                  { time: '11:00', client: null, service: null },
                  { time: '11:30', client: 'Felipe A.', service: 'Degradê' },
                ]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-teal-600 mb-3">
          Por que Secretaria Digital
        </p>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Tudo que você precisa, nada que não precisa
        </h2>
        <p className="text-center text-slate-500 text-sm mb-10 max-w-md mx-auto">
          Simples por fora. Robusto por dentro.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-200 hover:shadow-md hover:shadow-teal-600/5 transition-all group"
            >
              <div className="w-9 h-9 bg-teal-50 group-hover:bg-teal-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Icon size={17} className="text-teal-600" />
              </div>
              <p className="font-bold text-slate-900 text-sm mb-1.5">{title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECOND CTA ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="bg-teal-600 rounded-3xl px-8 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Pronto para organizar sua agenda?
          </h2>
          <p className="text-teal-200 text-sm mb-8 max-w-sm mx-auto">
            Cadastro gratuito. Sem cartão de crédito. Comece a receber agendamentos hoje.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register/barber')}
              className="bg-white hover:bg-slate-50 text-teal-700 font-bold px-8 py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Criar minha conta profissional
            </button>
            <button
              onClick={() => navigate('/register/client')}
              className="border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm transition-all"
            >
              Sou cliente
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center">
              <CalendarCheck size={11} className="text-white" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Secretaria Digital</span>
          </div>
          <p className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} Secretaria Digital. Todos os direitos reservados.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium"
          >
            Entrar na conta
          </button>
        </div>
      </footer>
    </div>
  )
}
