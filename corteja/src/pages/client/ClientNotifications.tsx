import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ClientNav from '@/components/client/ClientNav'

export default function ClientNotifications() {
  const navigate = useNavigate()
  const { notifications, refreshNotifications } = useStore()

  function handleMarkAll() {
    // Marca todas como lidas localmente
    refreshNotifications()
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
        <h1 className="font-bold text-zinc-900 flex-1">Notificações</h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAll}
            className="text-xs text-brand-600 font-medium hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </header>

      <main className="flex-1 px-4 py-4 flex flex-col gap-2 max-w-lg mx-auto w-full">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl p-4 ${n.read ? 'bg-white border border-zinc-100' : 'bg-brand-50 border border-brand-100'}`}
            >
              <p className="text-sm font-semibold text-zinc-900">{n.title}</p>
              <p className="text-sm text-zinc-600 mt-0.5">{n.message}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {formatDistanceToNow(parseISO(n.createdAt), { locale: ptBR, addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </main>

      <ClientNav />
    </div>
  )
}
