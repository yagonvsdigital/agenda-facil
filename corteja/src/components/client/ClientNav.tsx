import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Bell } from 'lucide-react'
import { useStore } from '@/store/useStore'

const tabs = [
  { path: '/client/dashboard', icon: LayoutDashboard, label: 'Início' },
  { path: '/client/notifications', icon: Bell, label: 'Alertas' },
]

export default function ClientNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { notifications } = useStore()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-zinc-100 flex z-10">
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors relative ${
              active ? 'text-brand-500' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {path === '/client/notifications' && unread > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
