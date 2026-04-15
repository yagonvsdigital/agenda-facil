import '../global.css'
import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { ToastProvider } from '@/components/ui/Toast'
import { useStore } from '@/store/useStore'

SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
  }),
})

function AuthGuard() {
  const { currentUser } = useStore()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    SplashScreen.hideAsync()
    const inAuth = segments[0] === '(auth)'
    const inBarber = segments[0] === '(barber)'
    const inClient = segments[0] === '(client)'

    if (!currentUser && !inAuth && segments[0] !== undefined) {
      router.replace('/')
    } else if (currentUser?.role === 'barber' && !inBarber) {
      router.replace('/(barber)/')
    } else if (currentUser?.role === 'client' && !inClient) {
      router.replace('/(client)/')
    }
  }, [currentUser, segments])

  return <Slot />
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <AuthGuard />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
