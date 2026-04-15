import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initSocket, disconnectSocket } from '../services/socket'
import type { UserDto } from '../services/api'

interface Notification {
  id: string; message: string; read: boolean; createdAt: string
}

interface Store {
  token: string | null
  currentUser: UserDto | null
  notifications: Notification[]
  login: (token: string, user: UserDto) => void
  logout: () => void
  addNotification: (msg: string) => void
  markAllRead: () => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      token: null,
      currentUser: null,
      notifications: [],

      login(token, user) {
        set({ token, currentUser: user })
        initSocket(token)
      },

      logout() {
        disconnectSocket()
        set({ token: null, currentUser: null, notifications: [] })
      },

      addNotification(message) {
        const n: Notification = {
          id: Date.now().toString(),
          message,
          read: false,
          createdAt: new Date().toISOString(),
        }
        set(s => ({ notifications: [n, ...s.notifications].slice(0, 50) }))
      },

      markAllRead() {
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }))
      },
    }),
    {
      name: 'agenda-facil-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({ token: s.token, currentUser: s.currentUser }),
    },
  ),
)
