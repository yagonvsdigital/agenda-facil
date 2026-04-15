import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function NotificationBell() {
  const { notifications, refreshNotifications } = useStore()
  const [open, setOpen] = useState(false)

  const unread = notifications.filter((n) => !n.read).length

  function handleOpen() {
    setOpen(true)
    refreshNotifications()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-soft" />
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Notificações">
        {notifications.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-4">Nenhuma notificação</p>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.slice(0, 20).map((n) => (
              <div
                key={n.id}
                className={`rounded-xl p-3 ${n.read ? 'bg-zinc-50' : 'bg-brand-50 border border-brand-100'}`}
              >
                <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatDistanceToNow(parseISO(n.createdAt), { locale: ptBR, addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}
