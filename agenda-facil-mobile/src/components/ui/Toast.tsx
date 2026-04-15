import { createContext, useContext, useRef, useState, useCallback } from 'react'
import { View, Text, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type ToastType = 'success' | 'error' | 'info'

interface ToastCtx {
  toast: (type: ToastType, message: string) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [type, setType] = useState<ToastType>('info')
  const [message, setMessage] = useState('')
  const opacity = useRef(new Animated.Value(0)).current
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const toast = useCallback((t: ToastType, msg: string) => {
    if (timer.current) clearTimeout(timer.current)
    setType(t); setMessage(msg); setVisible(true)
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start()
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setVisible(false))
    }, 3000)
  }, [opacity])

  const icons: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
    success: 'checkmark-circle', error: 'alert-circle', info: 'information-circle',
  }
  const colors: Record<ToastType, string> = {
    success: 'bg-green-600', error: 'bg-red-500', info: 'bg-brand-600',
  }

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {visible && (
        <Animated.View
          style={{ opacity, position: 'absolute', top: 60, left: 16, right: 16, zIndex: 9999 }}
        >
          <View className={`${colors[type]} rounded-2xl px-4 py-3 flex-row items-center gap-3 shadow-lg`}>
            <Ionicons name={icons[type]} size={20} color="white" />
            <Text className="text-white text-sm font-semibold flex-1">{message}</Text>
          </View>
        </Animated.View>
      )}
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
