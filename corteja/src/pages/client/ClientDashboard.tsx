import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, LogOut, Plus, Pencil, QrCode, Bell } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { getSocket } from '@/services/socket'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import ClientNav from '@/components/client/ClientNav'
import type { ClientProfessionalDto } from '@/services/api'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { currentUser, logout } = useStore()
  const { toast } = useToast()

  const [professionals, setProfessionals] = useState<ClientProfessionalDto[]>([])
  const [loading, setLoading] = useState(true)
  const [nicknameModal, setNicknameModal] = useState<ClientProfessionalDto | null>(null)
  const [nicknameInput, setNicknameInput] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api.clients.getMyProfessionals()
      setProfessionals(data)
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onRescheduled = () => {
      load()
      toast('info', 'Seu horário foi remarcado pelo profissional')
    }
    socket.on('appointment_rescheduled', onRescheduled)
    return () => { socket.off('appointment_rescheduled', onRescheduled) }
  }, [load, toast])

  if (!currentUser) return null

  function openNickname(p: ClientProfessionalDto) {
    setNicknameModal(p)
    setNicknameInput(p.nickname ?? '')
  }

  async function saveNickname() {
    if (!nicknameModal) return
    setSaving(true)
    try {
      await api.clients.updateNickname(nicknameModal.barberId, nicknameInput.trim())
      await load()
      setNicknameModal(null)
      toast('success', 'Apelido salvo')
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setSaving(false)
    }
  }

  function getDisplayName(p: ClientProfessionalDto) {
    return p.nickname || p.barber?.salonName || p.barber?.user?.name || 'Profissional'
  }

  function getSubtitle(p: ClientProfessionalDto) {
    if (p.nickname) return p.barber?.salonName || p.barber?.user?.name || ''
    return ''
  }

  function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }

  const colors = [
    'bg-brand-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-sky-500',
  ]

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-24">
      <header className="bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-bold text-zinc-900 text-sm leading-tight">
            Olá, {currentUser.name.split(' ')[0]} 👋
          </p>
          <p className="text-xs text-zinc-400 leading-tight">Meus profissionais</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/client/notifications')}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400"
          >
            <Bell size={17} />
          </button>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center">
              <QrCode size={36} className="text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-zinc-800 text-lg">Nenhum profissional ainda</p>
              <p className="text-sm text-zinc-400 mt-1 max-w-xs">
                Escaneie o QR Code do seu profissional para adicionar à sua lista
              </p>
            </div>
            <Button onClick={() => navigate('/client/scan')}>
              <QrCode size={16} className="mr-2" /> Escanear QR Code
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {professionals.map((p, idx) => {
              const color = colors[idx % colors.length]
              const displayName = getDisplayName(p)
              const subtitle = getSubtitle(p)
              return (
                <button
                  key={p.barberId}
                  onClick={() => navigate(`/client/barber/${p.barberId}`)}
                  className="bg-white border border-zinc-100 rounded-2xl px-4 py-4 text-left flex items-center gap-4 hover:border-brand-300 hover:shadow-sm active:scale-[0.99] transition-all"
                >
                  <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-lg">{getInitials(displayName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{displayName}</p>
                    {subtitle && (
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{subtitle}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      <CalendarCheck size={11} className="text-brand-400" />
                      <span className="text-xs text-brand-500 font-medium">Ver agenda</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openNickname(p) }}
                    className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-300 hover:text-zinc-500 flex-shrink-0"
                  >
                    <Pencil size={14} />
                  </button>
                </button>
              )
            })}
          </div>
        )}
      </main>

      {/* FAB — Adicionar profissional */}
      <button
        onClick={() => navigate('/client/scan')}
        className="fixed bottom-24 right-5 w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg hover:bg-brand-600 active:scale-95 transition-all z-20"
      >
        <Plus size={22} className="text-white" />
      </button>

      {/* Modal editar apelido */}
      <Modal open={!!nicknameModal} onClose={() => setNicknameModal(null)} title="Dar apelido">
        {nicknameModal && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-500">
              Escolha um apelido para <strong>{nicknameModal.barber?.salonName || nicknameModal.barber?.user?.name}</strong>
            </p>
            <Input
              label="Apelido (ex: Cabeleireiro, Dentista...)"
              placeholder={nicknameModal.barber?.salonName || ''}
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setNicknameModal(null)}>Cancelar</Button>
              <Button fullWidth loading={saving} onClick={saveNickname}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>

      <ClientNav />
    </div>
  )
}
