import { api } from './api'

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export async function requestNotificationPermission(): Promise<void> {
  // Sem Firebase configurado → silencioso
  if (!FIREBASE_CONFIG.projectId || !VAPID_KEY) return

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — firebase é opcional; instalado apenas se configurado
    const { initializeApp, getApps } = await import('firebase/app')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { getMessaging, getToken } = await import('firebase/messaging')

    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG)
    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token) {
      await api.users.saveFcmToken(token).catch(() => {})
    }
  } catch {
    // Sem suporte ou negado — não bloqueia o app
  }
}
