import { ScrollView, View, Text, Pressable, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const proFeatures = [
  { icon: 'qr-code', text: 'QR Code exclusivo para sua agenda' },
  { icon: 'calendar-sharp', text: 'Agenda inteligente sem conflitos' },
  { icon: 'notifications', text: 'Notificações automáticas' },
  { icon: 'cash', text: 'Receba pagamentos via PIX' },
]

export default function Home() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <LinearGradient
          colors={['#0f172a', '#134e4a']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 48 }}
        >
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View style={{ backgroundColor: '#0d9488', borderRadius: 20, padding: 16, marginBottom: 20 }}>
              <Ionicons name="calendar-sharp" size={40} color="white" />
            </View>
            <Text style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 3, fontWeight: '600', marginBottom: 8 }}>
              SECRETARIA DIGITAL
            </Text>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 38 }}>
              Agendamento{'\n'}
              <Text style={{ color: '#2dd4bf' }}>inteligente</Text>
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
              Sua secretária digital para qualquer profissional.{'\n'}Simples, rápida e confiável.
            </Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 24, marginTop: -20 }}>

          {/* CARD PROFISSIONAL */}
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 16, elevation: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, borderWidth: 2, borderColor: '#0d9488' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <View style={{ backgroundColor: '#ccfbf1', borderRadius: 10, padding: 6 }}>
                <Ionicons name="briefcase" size={18} color="#0d9488" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Sou profissional</Text>
              <View style={{ marginLeft: 'auto', backgroundColor: '#0d9488', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>PAGO</Text>
              </View>
            </View>
            <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
              Médico, barbeiro, manicure, carpinteiro, advogado... qualquer área.
            </Text>

            {proFeatures.map(f => (
              <View key={f.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Ionicons name={f.icon as any} size={16} color="#0d9488" />
                <Text style={{ color: '#334155', fontSize: 14 }}>{f.text}</Text>
              </View>
            ))}

            <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginTop: 8, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#166534', fontSize: 13, fontWeight: '600' }}>7 dias grátis</Text>
              <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '800' }}>R$10<Text style={{ fontSize: 13, fontWeight: '500', color: '#64748b' }}>/mês</Text></Text>
            </View>

            <Pressable
              onPress={() => router.push('/(auth)/register-barber')}
              style={{ backgroundColor: '#0d9488', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Criar conta profissional</Text>
              <Text style={{ color: '#99f6e4', fontSize: 12, marginTop: 2 }}>7 dias grátis · depois R$10/mês</Text>
            </Pressable>
          </View>

          {/* CARD CLIENTE */}
          <View style={{ backgroundColor: '#f8fafc', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <View style={{ backgroundColor: '#e2e8f0', borderRadius: 10, padding: 6 }}>
                <Ionicons name="person" size={18} color="#475569" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Sou cliente</Text>
              <View style={{ marginLeft: 'auto', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: '#475569', fontSize: 11, fontWeight: '700' }}>GRÁTIS</Text>
              </View>
            </View>
            <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
              Escaneie o QR Code do profissional e agende seu horário em segundos.
            </Text>

            {[
              { icon: 'scan', text: 'Escaneie o QR Code do profissional' },
              { icon: 'time', text: 'Veja os horários disponíveis' },
              { icon: 'checkmark-circle', text: 'Confirme o agendamento instantaneamente' },
            ].map(f => (
              <View key={f.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Ionicons name={f.icon as any} size={16} color="#475569" />
                <Text style={{ color: '#334155', fontSize: 14 }}>{f.text}</Text>
              </View>
            ))}

            <Pressable
              onPress={() => router.push('/(auth)/register-client')}
              style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16, borderWidth: 2, borderColor: '#e2e8f0' }}
            >
              <Text style={{ color: '#334155', fontWeight: '800', fontSize: 16 }}>Criar conta gratuita</Text>
            </Pressable>
          </View>

          {/* JÁ TENHO CONTA */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={{ paddingVertical: 16, alignItems: 'center', marginBottom: 32 }}
          >
            <Text style={{ color: '#0d9488', fontWeight: '700', fontSize: 15 }}>
              Já tenho conta → <Text style={{ textDecorationLine: 'underline' }}>Entrar</Text>
            </Text>
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
