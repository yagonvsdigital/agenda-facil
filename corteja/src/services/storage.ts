import type {
  Barber,
  Client,
  Appointment,
  BlockedSlot,
  Notification,
} from '@/types'

const KEYS = {
  barbers: 'cj_barbers',
  clients: 'cj_clients',
  appointments: 'cj_appointments',
  blockedSlots: 'cj_blocked_slots',
  notifications: 'cj_notifications',
  currentUser: 'cj_current_user',
}

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export const db = {
  barbers: {
    all: (): Barber[] => read<Barber>(KEYS.barbers),
    find: (id: string) => read<Barber>(KEYS.barbers).find((b) => b.id === id),
    findByPhone: (phone: string) =>
      read<Barber>(KEYS.barbers).find((b) => b.phone === phone),
    save: (barber: Barber) => {
      const all = read<Barber>(KEYS.barbers).filter((b) => b.id !== barber.id)
      write(KEYS.barbers, [...all, barber])
    },
  },

  clients: {
    all: (): Client[] => read<Client>(KEYS.clients),
    find: (id: string) => read<Client>(KEYS.clients).find((c) => c.id === id),
    findByPhone: (phone: string) =>
      read<Client>(KEYS.clients).find((c) => c.phone === phone),
    save: (client: Client) => {
      const all = read<Client>(KEYS.clients).filter((c) => c.id !== client.id)
      write(KEYS.clients, [...all, client])
    },
  },

  appointments: {
    all: (): Appointment[] => read<Appointment>(KEYS.appointments),
    find: (id: string) =>
      read<Appointment>(KEYS.appointments).find((a) => a.id === id),
    byBarber: (barberId: string) =>
      read<Appointment>(KEYS.appointments).filter(
        (a) => a.barberId === barberId && a.status !== 'cancelled'
      ),
    byClient: (clientId: string) =>
      read<Appointment>(KEYS.appointments).filter(
        (a) => a.clientId === clientId
      ),
    save: (appt: Appointment) => {
      const all = read<Appointment>(KEYS.appointments).filter(
        (a) => a.id !== appt.id
      )
      write(KEYS.appointments, [...all, appt])
    },
    delete: (id: string) => {
      write(
        KEYS.appointments,
        read<Appointment>(KEYS.appointments).filter((a) => a.id !== id)
      )
    },
  },

  blockedSlots: {
    all: (): BlockedSlot[] => read<BlockedSlot>(KEYS.blockedSlots),
    byBarber: (barberId: string) =>
      read<BlockedSlot>(KEYS.blockedSlots).filter(
        (s) => s.barberId === barberId
      ),
    save: (slot: BlockedSlot) => {
      const all = read<BlockedSlot>(KEYS.blockedSlots).filter(
        (s) => s.id !== slot.id
      )
      write(KEYS.blockedSlots, [...all, slot])
    },
    delete: (id: string) => {
      write(
        KEYS.blockedSlots,
        read<BlockedSlot>(KEYS.blockedSlots).filter((s) => s.id !== id)
      )
    },
  },

  notifications: {
    byUser: (userId: string): Notification[] =>
      read<Notification>(KEYS.notifications)
        .filter((n) => n.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    save: (n: Notification) => {
      const all = read<Notification>(KEYS.notifications)
      write(KEYS.notifications, [n, ...all])
    },
    markRead: (id: string) => {
      const all = read<Notification>(KEYS.notifications).map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      write(KEYS.notifications, all)
    },
    markAllRead: (userId: string) => {
      const all = read<Notification>(KEYS.notifications).map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      )
      write(KEYS.notifications, all)
    },
  },

  session: {
    get: () => {
      try {
        return JSON.parse(localStorage.getItem(KEYS.currentUser) ?? 'null') as {
          id: string
          role: 'barber' | 'client'
        } | null
      } catch {
        return null
      }
    },
    set: (data: { id: string; role: 'barber' | 'client' } | null) => {
      if (data) localStorage.setItem(KEYS.currentUser, JSON.stringify(data))
      else localStorage.removeItem(KEYS.currentUser)
    },
  },
}
