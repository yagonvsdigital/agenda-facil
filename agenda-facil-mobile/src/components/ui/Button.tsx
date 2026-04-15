import { ActivityIndicator, Pressable, Text } from 'react-native'

interface Props {
  children: React.ReactNode
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

export function Button({
  children, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, className = '',
}: Props) {
  const base = 'items-center justify-center rounded-2xl flex-row'
  const sizes = { sm: 'px-4 py-2', md: 'px-5 py-3', lg: 'px-6 py-4' }
  const textSizes = { sm: 'text-sm', md: 'text-sm', lg: 'text-base' }
  const variants = {
    primary: 'bg-brand-600 active:bg-brand-700',
    secondary: 'bg-white border border-slate-200 active:bg-slate-50',
    danger: 'bg-red-500 active:bg-red-600',
    ghost: 'active:bg-slate-100',
  }
  const textVariants = {
    primary: 'text-white font-bold',
    secondary: 'text-slate-700 font-semibold',
    danger: 'text-white font-bold',
    ghost: 'text-brand-600 font-semibold',
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading
        ? <ActivityIndicator color={variant === 'secondary' ? '#0d9488' : '#fff'} size="small" />
        : <Text className={`${textSizes[size]} ${textVariants[variant]}`}>{children}</Text>
      }
    </Pressable>
  )
}
