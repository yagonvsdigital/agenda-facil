import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export default function RegisterClient() {
  const router = useRouter()
  const { login } = useStore()
  const { toast } = useToast()
  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [devCode, setDevCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendOtp() {
    if (!name.trim()) { toast('error', 'Informe seu nome'); return }
    if (phone.trim().length < 8) { toast('error', 'Telefone inválido'); return }
    setLoading(true)
    try {
      await api.auth.register({ name: name.trim(), phone: phone.trim(), role: 'client' }).catch(() => {})
      const res = await api.auth.sendOtp(phone.trim())
      setDevCode(res.dev_code ?? '')
      setStep('otp')
    } catch (e: any) { toast('error', e.message) }
    finally { setLoading(false) }
  }

  async function handleVerify() {
    setLoading(true)
    try {
      const res = await api.auth.verifyOtp(phone.trim(), otp.trim())
      login(res.access_token, res.user)
    } catch (e: any) { toast('error', e.message) }
    finally { setLoading(false) }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-4">
          <Pressable onPress={() => router.back()} className="mb-8 p-2 -ml-2 self-start">
            <Ionicons name="arrow-back" size={22} color="#475569" />
          </Pressable>
          <View className="w-12 h-12 bg-brand-100 rounded-2xl items-center justify-center mb-6">
            <Ionicons name="person" size={22} color="#0d9488" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-900 mb-2">Criar conta</Text>
          <Text className="text-slate-500 mb-8">É rápido. Apenas nome e telefone.</Text>

          {step === 'info' ? (
            <View className="gap-4">
              <Input label="Seu nome completo" placeholder="Ex: Maria Souza" value={name} onChangeText={setName} />
              <Input label="Telefone (com DDD)" placeholder="11999990000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              <Button fullWidth loading={loading} onPress={handleSendOtp}>Continuar</Button>
            </View>
          ) : (
            <View className="gap-4">
              <Input label="Código de verificação" placeholder="000000" keyboardType="number-pad" value={otp} onChangeText={setOtp} maxLength={6} />
              {devCode ? (
                <View className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                  <Text className="text-brand-800 text-sm">Modo dev — código: <Text className="font-bold">{devCode}</Text></Text>
                </View>
              ) : null}
              <Button fullWidth loading={loading} onPress={handleVerify}>Criar conta</Button>
              <Button variant="ghost" fullWidth onPress={() => setStep('info')}>Voltar</Button>
            </View>
          )}
          <Pressable onPress={() => router.push('/(auth)/login')} className="mt-6 py-3 items-center">
            <Text className="text-slate-500 text-sm">Já tem conta? <Text className="text-brand-600 font-semibold">Entrar</Text></Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
