import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ChevronLeft, Share2, Copy, Download, Smartphone, CalendarCheck } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useToast } from '@/components/ui/Toast'
import BarberNav from '@/components/barber/BarberNav'

export default function BarberQRCode() {
  const navigate = useNavigate()
  const { barberProfile, currentUser } = useStore()
  const { toast } = useToast()

  if (!barberProfile || !currentUser) return null

  const appUrl = window.location.origin
  const bookingUrl = `${appUrl}/book/${barberProfile.id}`
  const professionalName = barberProfile.salonName ?? currentUser.name

  function handleCopyBooking() {
    navigator.clipboard.writeText(bookingUrl).then(() => toast('success', 'Link de agendamento copiado!'))
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `Agendar com ${professionalName}`,
        text: 'Clique para agendar seu horário',
        url: bookingUrl,
      })
    } else {
      handleCopyBooking()
    }
  }

  function downloadQR(svgId: string, filename: string) {
    const svg = document.getElementById(svgId)
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, 400, 400)
        ctx.drawImage(img, 0, 0, 400, 400)
        const link = document.createElement('a')
        link.download = filename
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
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
        <h1 className="font-bold text-zinc-900 flex-1">Meus QR Codes</h1>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-6 max-w-sm mx-auto w-full">

        {/* QR 1 — Agendamento */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-brand-600">
            <CalendarCheck size={18} />
            <p className="font-semibold text-sm">Agendar com {professionalName}</p>
          </div>
          <QRCodeSVG
            id="qr-booking"
            value={bookingUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#111111"
            level="M"
          />
          <p className="text-xs text-zinc-400 text-center break-all">{bookingUrl}</p>
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={handleCopyBooking}
              className="flex flex-col items-center gap-1.5 bg-zinc-50 rounded-xl py-3 px-2 border border-zinc-100 hover:border-brand-300 transition-all"
            >
              <Copy size={18} className="text-brand-500" />
              <span className="text-xs text-zinc-600 font-medium">Copiar</span>
            </button>
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1.5 bg-zinc-50 rounded-xl py-3 px-2 border border-zinc-100 hover:border-brand-300 transition-all"
            >
              <Share2 size={18} className="text-brand-500" />
              <span className="text-xs text-zinc-600 font-medium">Compartilhar</span>
            </button>
            <button
              onClick={() => downloadQR('qr-booking', `agenda-${barberProfile!.id}.png`)}
              className="flex flex-col items-center gap-1.5 bg-zinc-50 rounded-xl py-3 px-2 border border-zinc-100 hover:border-brand-300 transition-all"
            >
              <Download size={18} className="text-brand-500" />
              <span className="text-xs text-zinc-600 font-medium">Baixar</span>
            </button>
          </div>
          <p className="text-xs text-zinc-400 text-center">
            Cole na parede do seu espaço ou envie pelo WhatsApp para seus clientes agendarem diretamente.
          </p>
        </div>

        {/* QR 2 — Download do app */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Smartphone size={18} />
            <p className="font-semibold text-sm">Baixar o Agenda Fácil</p>
          </div>
          <QRCodeSVG
            id="qr-app"
            value={appUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#111111"
            level="M"
          />
          <p className="text-xs text-zinc-400 text-center break-all">{appUrl}</p>
          <button
            onClick={() => downloadQR('qr-app', 'agenda-facil-download.png')}
            className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline"
          >
            <Download size={15} /> Baixar PNG
          </button>
          <p className="text-xs text-zinc-400 text-center">
            Mostre este QR para seus clientes instalarem o app e se cadastrarem facilmente.
          </p>
        </div>

      </main>

      <BarberNav />
    </div>
  )
}
