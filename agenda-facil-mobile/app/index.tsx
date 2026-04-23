import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

const features = [
  { icon: 'qr-code', title: 'QR Code exclusivo', desc: 'Clientes agendam escaneando o código do profissional' },
  { icon: 'flash', title: 'Tempo real', desc: 'Horários somem e reaparecem instantaneamente' },
  { icon: 'shield-checkmark', title: 'Zero conflitos', desc: 'Nenhum cliente pega o mesmo horário' },
  { icon: 'notifications', title: 'Notificações', desc: 'Alertas automáticos para profissional e cliente' },
  { icon: 'lock-closed', title: 'Seguro', desc: 'Verificação de telefone para evitar agendamentos falsos' },
  { icon: 'phone-portrait', title: 'Funciona no celular', desc: 'Leve, rápido e otimizado para qualquer dispositivo' },
]

const professionals = [
  { name: 'Dr. Yago Neves', type: 'Médico', color: '#0d9488', slots: ['09:00 · Rafael M.', '10:00 · Lucas P.', '11:00 · Bruno A.'] },
  { name: 'W. J. N. Carpentry', type: 'Carpintaria', color: '#d97706', slots: ['08:00 · Carlos S. — Cozinha sob medida', '11:00 · Fernanda L. — Closet', '13:00 · Marcos T. — Revisão'] },
  { name: 'Manicure Jaqueline', type: 'Manicure', color: '#ec4899', slots: ['09:00 · Bianca R. — Unhas em gel', '11:00 · Patricia V. — Manicure', '13:00 · Camila F. — Nail art'] },
  { name: 'Barbearia', type: 'Barbearia', color: '#475569', slots: ['09:00 · João V. — Degradê', '10:00 · Pedro H. — Social', '11:30 · Felipe A. — Degradê'] },
]

export default function Onboarding() {
  const router = useRouter()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <View style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32, alignItems: 'center' }}>
          <View style={{ width: 72, height: 72, backgroundColor: '#0d9488', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#0d9488', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}>
            <Ionicons name="calendar-sharp" size={34} color="white" />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#0d9488', letterSpacing: 1.5, marginBottom: 4 }}>SECRETARIA DIGITAL</Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#0f172a', textAlign: 'center', lineHeight: 38 }}>
            Agendamento{'\n'}<Text style={{ color: '#0d9488' }}>inteligente</Text>
          </Text>
          <Text style={{ color: '#64748b', fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 22, paddingHorizontal: 8 }}>
            Sua secretária digital. Simples, rápida e confiável para qualquer profissional.
          </Text>
        </View>

        {/* CTAs */}
        <View style={{ paddingHorizontal: 24, gap: 12, marginBottom: 40 }}>
          <Pressable
            onPress={() => router.push('/(auth)/register-barber')}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#0f766e' : '#0d9488', borderRadius: 16, paddingVertical: 16, alignItems: 'center' })}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Sou profissional</Text>
            <Text style={{ color: '#99f6e4', fontSize: 12, marginTop: 2 }}>Crie sua agenda gratuita</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(auth)/register-client')}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#e2e8f0' : '#f1f5f9', borderRadius: 16, paddingVertical: 16, alignItems: 'center' })}
          >
            <Text style={{ color: '#334155', fontWeight: '700', fontSize: 16 }}>Sou cliente</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(auth)/login')} style={{ paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ color: '#0d9488', fontSize: 14, fontWeight: '600' }}>Já tenho conta → Entrar</Text>
          </Pressable>
        </View>

        {/* Benefícios */}
        <View style={{ paddingHorizontal: 24, marginBottom: 40 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 }}>Por que usar?</Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Tudo que você precisa para organizar sua agenda</Text>
          <View style={{ gap: 10 }}>
            {features.map(f => (
              <View key={f.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <View style={{ width: 40, height: 40, backgroundColor: '#ccfbf1', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={f.icon as any} size={20} color="#0d9488" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{f.title}</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Exemplos de profissionais */}
        <View style={{ paddingHorizontal: 24, marginBottom: 40 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 }}>Para todo tipo de profissional</Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Médicos, carpinteiros, manicures, barbeiros e muito mais</Text>
          <View style={{ gap: 12 }}>
            {professionals.map(p => (
              <View key={p.name} style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
                <View style={{ backgroundColor: p.color, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>{p.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{p.name}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{p.type} · agenda do dia</Text>
                  </View>
                </View>
                <View style={{ padding: 12, gap: 6 }}>
                  {p.slots.map(s => (
                    <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#dcfce7' }}>
                      <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                      <Text style={{ fontSize: 11, color: '#334155', flex: 1 }}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer CTA */}
        <View style={{ paddingHorizontal: 24, alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => router.push('/(auth)/register-barber')}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#0f766e' : '#0d9488', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center' })}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Começar agora — é grátis</Text>
          </Pressable>
          <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Já usado por profissionais de diversas áreas
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
