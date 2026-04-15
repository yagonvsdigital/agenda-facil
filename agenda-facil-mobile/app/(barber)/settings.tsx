import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, Switch, StatusBar, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { BarberDto } from '@/services/api'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function BarberSettings() {
  const { currentUser, logout } = useStore()
  const { toast } = useToast()
  const [profile, setProfile] = useState<BarberDto | null>(null)
  const [salonName, setSalonName] = useState('')
  const [address, setAddress] = useState('')
  const [workStart, setWorkStart] = useState('09:00')
  const [workEnd, setWorkEnd] = useState('18:00')
  const [slotDuration, setSlotDuration] = useState('30')
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.barbers.getMyProfile()
      .then(p => {
        setProfile(p)
        setSalonName(p.salonName ?? '')
        setAddress(p.address ?? '')
        setWorkStart(p.workingHours.start)
        setWorkEnd(p.workingHours.end)
        setSlotDuration(String(p.slotDuration ?? 30))
        setWorkingDays(p.workingDays)
      })
      .catch(() => null)
  }, [])

  function toggleDay(d: number) {
    setWorkingDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort())
  }

  async function handleSave() {
    setLoading(true)
    try {
      const data = { salonName, address, workStart, workEnd, slotDuration: Number(slotDuration), workingDays }
      if (profile) await api.barbers.updateProfile(data)
      else await api.barbers.createProfile(data)
      toast('success', 'Perfil salvo!')
      const p = await api.barbers.getMyProfile()
      setProfile(p)
    } catch (e: any) { toast('error', e.message) }
    finally { setLoading(false) }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Text className="text-xl font-extrabold text-slate-900 mb-2">Meu Perfil</Text>

        {/* User info */}
        <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-4 border border-slate-100">
          <View className="w-12 h-12 bg-brand-600 rounded-2xl items-center justify-center">
            <Text className="text-white font-bold text-lg">{currentUser?.name[0]}</Text>
          </View>
          <View>
            <Text className="font-bold text-slate-900">{currentUser?.name}</Text>
            <Text className="text-slate-500 text-sm">{currentUser?.phone}</Text>
          </View>
        </View>

        {/* Salon info */}
        <View className="bg-white rounded-2xl p-4 gap-4 border border-slate-100">
          <Text className="font-bold text-slate-700">Informações do estabelecimento</Text>
          <Input label="Nome do estabelecimento" placeholder="Ex: Barbearia Los Primos" value={salonName} onChangeText={setSalonName} />
          <Input label="Endereço (opcional)" placeholder="Rua Exemplo, 123" value={address} onChangeText={setAddress} />
        </View>

        {/* Working hours */}
        <View className="bg-white rounded-2xl p-4 gap-4 border border-slate-100">
          <Text className="font-bold text-slate-700">Horário de funcionamento</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Início" placeholder="09:00" value={workStart} onChangeText={setWorkStart} keyboardType="numbers-and-punctuation" />
            </View>
            <View className="flex-1">
              <Input label="Fim" placeholder="18:00" value={workEnd} onChangeText={setWorkEnd} keyboardType="numbers-and-punctuation" />
            </View>
          </View>
          <Input label="Duração do slot (minutos)" placeholder="30" value={slotDuration} onChangeText={setSlotDuration} keyboardType="number-pad" />
        </View>

        {/* Working days */}
        <View className="bg-white rounded-2xl p-4 gap-3 border border-slate-100">
          <Text className="font-bold text-slate-700">Dias de atendimento</Text>
          <View className="flex-row gap-2 flex-wrap">
            {DAYS.map((d, i) => (
              <Pressable key={i} onPress={() => toggleDay(i)} className={`w-10 h-10 rounded-xl items-center justify-center ${workingDays.includes(i) ? 'bg-brand-600' : 'bg-slate-100'}`}>
                <Text className={`text-xs font-bold ${workingDays.includes(i) ? 'text-white' : 'text-slate-500'}`}>{d}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button fullWidth loading={loading} onPress={handleSave} size="lg">Salvar alterações</Button>

        <Pressable onPress={() => Alert.alert('Sair', 'Deseja sair da conta?', [{ text: 'Cancelar' }, { text: 'Sair', style: 'destructive', onPress: logout }])} className="py-3 items-center">
          <Text className="text-red-500 font-semibold text-sm">Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
