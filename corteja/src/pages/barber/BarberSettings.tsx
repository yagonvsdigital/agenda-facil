import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, User, Building2, MapPin, Clock, LogOut } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { formatPhone, dayName } from '@/utils/schedule'
import BarberNav from '@/components/barber/BarberNav'

export default function BarberSettings() {
  const navigate = useNavigate()
  const { barberProfile, currentUser, logout, loadBarberProfile } = useStore()
  const { toast } = useToast()

  const [name, setName] = useState(currentUser?.name ?? '')
  const [salonName, setSalonName] = useState(barberProfile?.salonName ?? '')
  const [address, setAddress] = useState(barberProfile?.address ?? '')
  const [workStart, setWorkStart] = useState(barberProfile?.workingHours?.start ?? '09:00')
  const [workEnd, setWorkEnd] = useState(barberProfile?.workingHours?.end ?? '19:00')
  const [workingDays, setWorkingDays] = useState<number[]>(barberProfile?.workingDays ?? [])
  const [slotDuration, setSlotDuration] = useState(barberProfile?.slotDuration ?? 30)
  const [saving, setSaving] = useState(false)

  if (!barberProfile || !currentUser) return null

  function toggleDay(d: number) {
    setWorkingDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  async function handleSave() {
    if (!name.trim()) { toast('error', 'Nome é obrigatório'); return }
    if (workingDays.length === 0) { toast('error', 'Selecione ao menos um dia'); return }
    setSaving(true)
    try {
      await api.barbers.updateProfile({
        salonName: salonName.trim() || undefined,
        address: address.trim() || undefined,
        workStart,
        workEnd,
        workingDays,
        slotDuration,
      })
      await loadBarberProfile()
      toast('success', 'Configurações salvas!')
    } catch {
      toast('error', 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-24">
      <header className="bg-white border-b border-zinc-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/barber/dashboard')}
          className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-bold text-zinc-900 flex-1">Configurações</h1>
      </header>

      <main className="flex-1 px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto w-full">
        <Card padding="md">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 mb-4">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center">
              <User size={20} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900">{currentUser.name}</p>
              <p className="text-xs text-zinc-400">
                {formatPhone(currentUser.phone)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User size={16} />}
              disabled
            />
            <Input
              label="Nome do salão"
              placeholder="Opcional"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              leftIcon={<Building2 size={16} />}
            />
            <Input
              label="Endereço"
              placeholder="Opcional"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<MapPin size={16} />}
            />
          </div>
        </Card>

        <Card padding="md">
          <h2 className="font-semibold text-zinc-900 mb-4 flex items-center gap-1.5">
            <Clock size={15} className="text-brand-500" /> Horários de trabalho
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-1.5">Funcionamento</label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <span className="text-zinc-400 text-sm">até</span>
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">Dias de trabalho</label>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      workingDays.includes(d)
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-zinc-600 border-zinc-200'
                    }`}
                  >
                    {dayName(d)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">Duração do atendimento</label>
              <div className="flex gap-2 flex-wrap">
                {[15, 20, 30, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => setSlotDuration(min)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      slotDuration === min
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-zinc-600 border-zinc-200'
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Button fullWidth size="lg" loading={saving} onClick={handleSave}>
          Salvar configurações
        </Button>

        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium py-2"
        >
          <LogOut size={16} /> Sair da conta
        </button>
      </main>

      <BarberNav />
    </div>
  )
}
