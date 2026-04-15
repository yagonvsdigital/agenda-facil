import { Modal as RNModal, View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ visible, onClose, title, children }: Props) {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable onPress={e => e.stopPropagation()}>
          <View className="bg-white rounded-t-3xl px-5 pt-4 pb-8">
            <View className="flex-row items-center justify-between mb-5">
              {title && <Text className="font-bold text-slate-900 text-base">{title}</Text>}
              <Pressable onPress={onClose} className="p-1 ml-auto">
                <Ionicons name="close" size={22} color="#64748b" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
              {children}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}
