import { useState } from 'react'
import { TextInput, Text, View, TextInputProps, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  isPassword?: boolean
}

export function Input({ label, error, leftIcon, isPassword, ...props }: Props) {
  const [focused, setFocused] = useState(false)
  const [showPass, setShowPass] = useState(false)

  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-semibold text-slate-700">{label}</Text>}
      <View className={`flex-row items-center bg-white border rounded-2xl px-3.5 py-3 ${focused ? 'border-brand-500' : error ? 'border-red-400' : 'border-slate-200'}`}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPass}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor="#94a3b8"
          className="flex-1 text-slate-900 text-sm"
        />
        {isPassword && (
          <Pressable onPress={() => setShowPass(v => !v)}>
            <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color="#94a3b8" />
          </Pressable>
        )}
      </View>
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  )
}
