import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, User, Phone, Mail, ChevronLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { formatPhone } from '@/utils/schedule'
import { useToast } from '@/components/ui/Toast'

export default function RegisterClient() {
  const navigate = useNavigate()
  const { login } = useStore()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Nome é obrigatório'
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) e.phone = 'Telefone inválido'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSendCode() {
    if (!validate()) return
    setLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      await api.auth.register({ name: name.trim(), phone: digits, email: email || undefined, role: 'client' })
      const res = await api.auth.sendOtp(digits)
      if (res.dev_code) { setDevCode(res.dev_code); toast('info', `Código de dev: ${res.dev_code}`) }
      else toast('success', 'Código enviado por SMS')
      setStep(2)
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (otpCode.length !== 6) { toast('error', 'Código inválido'); return }
    setLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      const res = await api.auth.verifyOtp(digits, otpCode)
      await login(res.access_token, res.user)
      navigate('/client/dashboard')
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
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center"><CalendarCheck size={16} className="text-white" /></div>
          <span className="font-bold text-zinc-900">Secretaria Digital</span>
        </div>
        <div className="flex gap-1 mb-6">
          {[1, 2].map((s) => (<div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-brand-500' : 'bg-zinc-200'}`} />))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div><h1 className="text-2xl font-bold text-zinc-900">Criar conta</h1><p className="text-zinc-500 text-sm mt-1">Seus dados para agendamento</p></div>
            <Input label="Nome completo *" placeholder="Ex: João da Silva" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} leftIcon={<User size={16} />} />
            <Input label="Telefone *" type="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} error={errors.phone} hint="Será verificado por código SMS" leftIcon={<Phone size={16} />} />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} leftIcon={<Mail size={16} />} />
            <Button fullWidth size="lg" loading={loading} onClick={handleSendCode}>Enviar código de verificação</Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center"><ShieldCheck size={28} className="text-brand-500" /></div>
              <div><h1 className="text-2xl font-bold text-zinc-900">Verificar telefone</h1><p className="text-zinc-500 text-sm mt-1">Código enviado para <strong>{phone}</strong></p></div>
            </div>
            {devCode && <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-800">Modo dev — código: <strong>{devCode}</strong></div>}
            <Input label="Código de 6 dígitos" type="number" placeholder="000000" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.slice(0, 6))} className="text-center text-2xl tracking-widest" />
            <Button fullWidth size="lg" loading={loading} onClick={handleVerify}>Verificar e criar conta</Button>
            <button onClick={handleSendCode} className="text-sm text-brand-600 hover:underline text-center">Reenviar código</button>
          </div>
        )}

        <p className="text-sm text-zinc-500 text-center mt-6">Já tem conta? <button onClick={() => navigate('/login')} className="text-brand-600 font-medium hover:underline">Entrar</button></p>
      </div>
    </div>
  )
}
