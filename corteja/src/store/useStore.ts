import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, UserDto, BarberDto, AppointmentDto, BlockedSlotDto } from '@/services/api'
import { connectSocket, disconnectSocket } from '@/services/socket'
import { requestNotificationPermission } from '@/services/firebase'
import type { Notification } from '@/types'
import { db } from '@/services/storage'

interface AppState {
  token: string | null
  currentUser: UserDto | null
  barberProfile: BarberDto | null
  appointments: AppointmentDto[]
  blockedSlots: BlockedSlotDto[]
  notifications: Notification[]

  login: (token: string, user: UserDto) => Promise<void>
  logout: () => void
  loadBarberProfile: () => Promise<void>
  loadAppointments: () => Promise<void>
  loadBlockedSlots: (date?: string) => Promise<void>
  refreshNotifications: () => void
  pushLocalNotification: (n: Notification) => void
  triggerRefresh: () => Promise<void>
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      currentUser: null,
      barberProfile: null,
      appointments: [],
      blockedSlots: [],
      notifications: [],

      login: async (token, user) => {
        localStorage.setItem('cj_token', token)
        set({ token, currentUser: user })
        connectSocket(token)
        requestNotificationPermission().catch(() => {})

        if (user.role === 'barber') {
          await get().loadBarberProfile()
        }
        await get().loadAppointments()
        get().refreshNotifications()
      },

      logout: () => {
        localStorage.removeItem('cj_token')
        disconnectSocket()
        set({
          token: null,
          currentUser: null,
          barberProfile: null,
          appointments: [],
          blockedSlots: [],
          notifications: [],
        })
      },

      loadBarberProfile: async () => {
        try {
          const profile = await api.barbers.getMyProfile()
          set({ barberProfile: profile })
        } catch {
          // not yet created
        }
      },

      loadAppointments: async () => {
        const { currentUser } = get()
        if (!currentUser) return
        try {
          if (currentUser.role === 'barber') {
            const appts = await api.appointments.getBarberAppts()
            set({ appointments: appts })
          } else {
            const appts = await api.appointments.getClientAppts()
            set({ appointments: appts })
          }
        } catch (e) {
          console.warn('loadAppointments error', e)
        }
      },

      loadBlockedSlots: async (date?: string) => {
        const { barberProfile } = get()
        if (!barberProfile) return
        try {
          const slots = await api.appointments.getBlocked(barberProfile.id, date)
          set({ blockedSlots: slots })
        } catch {}
      },

      refreshNotifications: () => {
        const { currentUser } = get()
        if (!currentUser) return
        const notifs = db.notifications.byUser(currentUser.id)
        set({ notifications: notifs })
      },

      pushLocalNotification: (n: Notification) => {
        db.notifications.save(n)
        set((state) => ({ notifications: [n, ...state.notifications] }))
      },

      triggerRefresh: async () => {
        await get().loadAppointments()
        get().refreshNotifications()
      },
    }),
    {
      name: 'corteja-store',
      partialize: (s) => ({
        token: s.token,
        currentUser: s.currentUser,
      }),
    },
  ),
)
