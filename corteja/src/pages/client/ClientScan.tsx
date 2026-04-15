import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, QrCode, Hash } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import ClientNav from '@/components/client/ClientNav'

export default function ClientScan() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [barberId, setBarberId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGo() {
    const id = barberId.trim()
    if (!id) { toast('error', 'Informe o código do profissional'); return }
    setLoading(true)
    try {
      await api.barbers.getPublic(id)
      navigate(`/client/barber/${id}`)
    } catch {
      toast('error', 'Profissional não encontrado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-24">
      <header className="bg-white border-b border-zinc-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/client/dashboard')}
          className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-bold text-zinc-900">Adicionar profissional</h1>
      </header>

      <main className="flex-1 px-4 py-8 flex flex-col items-center gap-6 max-w-sm mx-auto w-full">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
          <QrCode size={32} className="text-brand-500" />
        </div>
        <div className="text-center">
          <h2 className="font-bold text-xl text-zinc-900">Acessar agenda</h2>
          <p className="text-sm text-zinc-500 mt-2">
            Escaneie o QR Code do seu profissional para acessar a agenda e fazer agendamentos.
          </p>
        </div>

        <div className="w-full bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-2xl h-48 flex flex-col items-center justify-center gap-2">
          <QrCode size={40} className="text-zinc-300" />
          <p className="text-xs text-zinc-400">Câmera disponível no app nativo</p>
        </div>

        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-200" />
          <span className="text-xs text-zinc-400">ou insira o código manualmente</span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>

        <div className="w-full flex flex-col gap-3">
          <Input
            label="Código do profissional"
            placeholder="Cole o código aqui..."
            value={barberId}
            onChange={(e) => setBarberId(e.target.value)}
            leftIcon={<Hash size={16} />}
          />
          <Button fullWidth size="lg" loading={loading} onClick={handleGo}>
            Ver agenda
          </Button>
        </div>
      </main>

      <ClientNav />
    </div>
  )
}
