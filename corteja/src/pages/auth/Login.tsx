import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarCheck, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { formatPhone } from '@/utils/schedule'
import { useToast } from '@/components/ui/Toast'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { login } = useStore()
  const { toast } = useToast()

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'barber' | 'client'>('client')

  const redirect = params.get('redirect') ?? ''

  async function handleSend() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { toast('error', 'Informe um telefone válido'); return }
    setLoading(true)
    try {
      const res = await api.auth.sendOtp(digits)
      if (res.dev_code) {
        setDevCode(res.dev_code)
        toast('info', `Código de dev: ${res.dev_code}`)
      } else {
        toast('success', 'Código enviado por SMS')
      }
      setStep('code')
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (code.length !== 6) { toast('error', 'Informe o código de 6 dígitos'); return }
    setLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      const res = await api.auth.verifyOtp(digits, code)
      await login(res.access_token, res.user)
      if (redirect) { navigate(decodeURIComponent(redirect)); return }
      navigate(res.user.role === 'barber' ? '/barber/dashboard' : '/client/dashboard')
    } catch (e: any) {
      toast('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <CalendarCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-zinc-900 text-lg">Secretaria Digital</span>
        </button>

        <h1 className="text-2xl font-bold text-zinc-900 mb-1">
          {step === 'phone' ? 'Entrar' : 'Verificar código'}
        </h1>
        <p className="text-zinc-500 text-sm mb-6">
          {step === 'phone'
            ? 'Informe seu telefone para receber o código'
            : `Código enviado para ${phone}`}
        </p>

        {step === 'phone' && (
          <>
            <div className="flex gap-2 mb-5 p-1 bg-zinc-100 rounded-xl">
              {(['client', 'barber'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    role === r ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  {r === 'client' ? 'Cliente' : 'Profissional'}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                leftIcon={<Phone size={16} />}
              />
              <Button fullWidth size="lg" loading={loading} onClick={handleSend}>
                Enviar código
              </Button>
            </div>
          </>
        )}

        {step === 'code' && (
          <div className="flex flex-col gap-4">
            {devCode && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-800">
                Modo dev — código: <strong>{devCode}</strong>
              </div>
            )}
            <Input
              label="Código de 6 dígitos"
              type="number"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, 6))}
              className="text-center text-2xl tracking-widest"
            />
            <Button fullWidth size="lg" loading={loading} onClick={handleVerify}>
              Verificar e entrar
            </Button>
            <button onClick={() => setStep('phone')} className="text-sm text-brand-600 hover:underline text-center">
              Usar outro número
            </button>
          </div>
        )}

        <p className="text-sm text-zinc-500 text-center mt-5">
          Não tem conta?{' '}
          <button onClick={() => navigate(`/register/${role}`)} className="text-brand-600 font-medium hover:underline">
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  )
}
