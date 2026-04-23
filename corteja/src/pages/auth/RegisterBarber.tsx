import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, User, Phone, Building2, MapPin, Clock, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { formatPhone, dayName } from '@/utils/schedule'
import { useToast } from '@/components/ui/Toast'

export default function RegisterBarber() {
  const navigate = useNavigate()
  const { login } = useStore()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')

  const [name, setName] = useState('')
  const [salonName, setSalonName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [workStart, setWorkStart] = useState('09:00')
  const [workEnd, setWorkEnd] = useState('19:00')
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5, 6])
  const [slotDuration, setSlotDuration] = useState(30)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Nome é obrigatório'
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) e.phone = 'Telefone inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function toggleDay(d: number) {
    setWorkingDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d])
  }

  async function handleStep1Next() {
    if (!validateStep1()) return
    if (workingDays.length === 0) { toast('error', 'Selecione ao menos um dia'); return }
    setLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      await api.auth.register({ name: name.trim(), phone: digits, role: 'barber' })
      const res = await api.auth.sendOtp(digits)
      if (res.dev_code) { setDevCode(res.dev_code); toast('info', `Código de dev: ${res.dev_code}`) }
      setStep(2)
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyAndCreateProfile() {
    if (otpCode.length !== 6) { toast('error', 'Informe o código de 6 dígitos'); return }
    setLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      const { access_token, user } = await api.auth.verifyOtp(digits, otpCode)
      await login(access_token, user)
      await api.barbers.createProfile({
        salonName: salonName.trim() || undefined,
        address: address.trim() || undefined,
        workStart,
        workEnd,
        workingDays,
        slotDuration,
      })
      await useStore.getState().loadBarberProfile()
      navigate('/barber/dashboard')
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <button onClick={() => (step === 1 ? navigate('/') : setStep(1))} className="flex items-center gap-1 text-zinc-500 text-sm mb-6 hover:text-zinc-800">
          <ChevronLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <CalendarCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-zinc-900">Secretaria Digital</span>
        </div>
        <div className="flex gap-1 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-brand-500' : 'bg-zinc-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div><h1 className="text-2xl font-bold text-zinc-900">Seus dados</h1><p className="text-zinc-500 text-sm mt-1">Informações do profissional</p></div>
            <Input label="Nome completo *" placeholder="Ex: Carlos Silva" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} leftIcon={<User size={16} />} />
            <Input label="Nome do salão" placeholder="Ex: Barbearia do Carlos" value={salonName} onChange={(e) => setSalonName(e.target.value)} leftIcon={<Building2 size={16} />} />
            <Input label="Telefone / WhatsApp *" type="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} error={errors.phone} leftIcon={<Phone size={16} />} />
            <Input label="Endereço" placeholder="Ex: Rua das Flores, 123" value={address} onChange={(e) => setAddress(e.target.value)} leftIcon={<MapPin size={16} />} />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5"><Clock size={14} /> Horário de funcionamento</label>
              <div className="flex items-center gap-3">
                <input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <span className="text-zinc-400 text-sm">até</span>
                <input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Dias de trabalho</label>
              <div className="flex gap-2 flex-wrap">
                {[0,1,2,3,4,5,6].map((d) => (
                  <button key={d} onClick={() => toggleDay(d)} className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${workingDays.includes(d) ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-zinc-600 border-zinc-200'}`}>{dayName(d)}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Duração de cada atendimento</label>
              <div className="flex gap-2 flex-wrap">
                {[15, 20, 30, 45, 60].map((min) => (
                  <button key={min} onClick={() => setSlotDuration(min)} className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${slotDuration === min ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-zinc-600 border-zinc-200'}`}>{min} min</button>
                ))}
              </div>
            </div>

            <Button fullWidth size="lg" loading={loading} onClick={handleStep1Next}>Continuar</Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div><h1 className="text-2xl font-bold text-zinc-900">Verificar telefone</h1><p className="text-zinc-500 text-sm mt-1">Confirme o código enviado para {phone}</p></div>
            {devCode && <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-800">Modo dev — código: <strong>{devCode}</strong></div>}
            <Input label="Código de 6 dígitos" type="number" placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.slice(0, 6))} className="text-center text-2xl tracking-widest" />
            <Button fullWidth size="lg" loading={loading} onClick={handleVerifyAndCreateProfile}>Verificar e criar conta</Button>
          </div>
        )}

        <p className="text-sm text-zinc-500 text-center mt-6">Já tem conta? <button onClick={() => navigate('/login')} className="text-brand-600 font-medium hover:underline">Entrar</button></p>
      </div>
    </div>
  )
}
