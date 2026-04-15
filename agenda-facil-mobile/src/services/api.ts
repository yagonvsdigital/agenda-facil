import { useStore } from '../store/useStore'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  auth = false,
): Promise<T> {
  const token = useStore.getState().token
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth && token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro de conexão' }))
    throw new Error(err.message ?? 'Erro desconhecido')
  }
  if (res.status === 204) return {} as T
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────
export interface UserDto {
  id: string; name: string; phone: string; role: 'client' | 'barber'
  email?: string; verified?: boolean; fcmToken?: string | null
}
export interface BarberDto {
  id: string; userId: string; salonName?: string; address?: string
  workingHours: { start: string; end: string; slotDuration?: number }
  workingDays: number[]; qrCodeUrl?: string; slotDuration?: number
  user?: { name: string; phone: string }
}
export interface TimeSlotDto {
  startTime: string; endTime: string; available: boolean
  appointmentId?: string | null
}
export interface SlotsResponse { slots: TimeSlotDto[]; dayOff: boolean }
export interface AppointmentDto {
  id: string; barberId: string; clientId: string; date: string
  startTime: string; endTime: string; status: string
  serviceType?: string | null; clientName?: string; clientPhone?: string
}
export interface BlockedSlotDto {
  id: string; date: string; startTime: string; endTime: string; reason?: string | null
}
export interface ClientProfessionalDto {
  id: string; barberId: string; nickname: string | null
  createdAt: string; barber: BarberDto
}

// ─── API ──────────────────────────────────────────────────────
export const api = {
  auth: {
    sendOtp: (phone: string) =>
      request<{ dev_code?: string }>('POST', '/auth/send-otp', { phone }),
    verifyOtp: (phone: string, code: string) =>
      request<{ access_token: string; user: UserDto }>('POST', '/auth/verify-otp', { phone, code }),
    register: (data: { name: string; phone: string; email?: string; role: 'client' | 'barber' }) =>
      request<UserDto>('POST', '/auth/register', data),
  },
  users: {
    saveFcmToken: (token: string) =>
      request<void>('PATCH', '/users/fcm-token', { token }, true),
  },
  barbers: {
    getPublic: (id: string) => request<BarberDto>('GET', `/barbers/${id}`),
    getMyProfile: () => request<BarberDto>('GET', '/barbers/me/profile', undefined, true),
    createProfile: (data: object) => request<BarberDto>('POST', '/barbers/profile', data, true),
    updateProfile: (data: object) => request<BarberDto>('PATCH', '/barbers/profile', data, true),
  },
  clients: {
    getMyProfessionals: () =>
      request<ClientProfessionalDto[]>('GET', '/clients/professionals', undefined, true),
    addProfessional: (barberId: string) =>
      request<ClientProfessionalDto>('POST', '/clients/professionals', { barberId }, true),
    updateNickname: (barberId: string, nickname: string) =>
      request<ClientProfessionalDto>('PATCH', `/clients/professionals/${barberId}/nickname`, { nickname }, true),
  },
  appointments: {
    getSlots: (barberId: string, date: string) =>
      request<SlotsResponse>('GET', `/appointments/slots/${barberId}?date=${date}`),
    book: (data: { barberId: string; date: string; startTime: string; serviceType?: string }) =>
      request<AppointmentDto>('POST', '/appointments/book', data, true),
    getBarberAppts: (date?: string) =>
      request<AppointmentDto[]>('GET', `/appointments/barber${date ? `?date=${date}` : ''}`, undefined, true),
    getClientAppts: () =>
      request<AppointmentDto[]>('GET', '/appointments/client', undefined, true),
    cancel: (id: string) =>
      request<void>('DELETE', `/appointments/${id}/cancel`, undefined, true),
    reschedule: (id: string, data: { date: string; startTime: string }) =>
      request<void>('PATCH', `/appointments/${id}/reschedule`, data, true),
    addBlock: (data: object) =>
      request<BlockedSlotDto>('POST', '/appointments/blocked', data, true),
    removeBlock: (id: string) =>
      request<void>('DELETE', `/appointments/blocked/${id}`, undefined, true),
    getBlocked: (barberId: string, date?: string) =>
      request<BlockedSlotDto[]>('GET', `/appointments/blocked/${barberId}${date ? `?date=${date}` : ''}`),
  },
}
