import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, QrCode, Settings } from 'lucide-react'

const tabs = [
  { path: '/barber/dashboard', icon: LayoutDashboard, label: 'Início' },
  { path: '/barber/schedule', icon: Calendar, label: 'Agenda' },
  { path: '/barber/qrcode', icon: QrCode, label: 'QR Code' },
  { path: '/barber/settings', icon: Settings, label: 'Config.' },
]

export default function BarberNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-zinc-100 flex z-10 safe-bottom">
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
              active ? 'text-brand-500' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
