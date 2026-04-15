const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

function getToken() {
  return localStorage.getItem('cj_token')
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Erro na requisição')
  }
  return res.json() as Promise<T>
}

export const api = {
  users: {
    saveFcmToken: (token: string) =>
      request<{ affected: number }>('PATCH', '/users/fcm-token', { token }, true),
  },

  auth: {
    sendOtp: (phone: string) =>
      request<{ dev_code?: string }>('POST', '/auth/send-otp', { phone }),
    verifyOtp: (phone: string, code: string) =>
      request<{ access_token: string; user: UserDto }>('POST', '/auth/verify-otp', { phone, code }),
    register: (data: { name: string; phone: string; email?: string; role: 'client' | 'barber' }) =>
      request<UserDto>('POST', '/auth/register', data),
  },

  barbers: {
    getPublic: (id: string) =>
      request<BarberDto>('GET', `/barbers/${id}`),
    getMyProfile: () =>
      request<BarberDto>('GET', '/barbers/me/profile', undefined, true),
    createProfile: (data: CreateBarberDto) =>
      request<BarberDto>('POST', '/barbers/profile', data, true),
    updateProfile: (data: CreateBarberDto) =>
      request<BarberDto>('PATCH', '/barbers/profile', data, true),
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
    book: (data: BookDto) =>
      request<AppointmentDto>('POST', '/appointments/book', data, true),
    getBarberAppts: (date?: string) =>
      request<AppointmentDto[]>('GET', `/appointments/barber${date ? `?date=${date}` : ''}`, undefined, true),
    getClientAppts: () =>
      request<AppointmentDto[]>('GET', '/appointments/client', undefined, true),
    updateStatus: (id: string, status: 'confirmed' | 'completed') =>
      request<{ id: string; status: string }>('PATCH', `/appointments/${id}/status`, { status }, true),
    cancel: (id: string) =>
      request<{ id: string; status: string; slot: { date: string; startTime: string; endTime: string } }>(
        'DELETE', `/appointments/${id}/cancel`, undefined, true,
      ),
    reschedule: (id: string, data: { date: string; startTime: string }) =>
      request<{ id: string; date: string; startTime: string; endTime: string }>(
        'PATCH', `/appointments/${id}/reschedule`, data, true,
      ),
    addBlock: (data: BlockSlotDto) =>
      request<BlockedSlotDto>('POST', '/appointments/blocked', data, true),
    removeBlock: (id: string) =>
      request<{ deleted: boolean }>('DELETE', `/appointments/blocked/${id}`, undefined, true),
    getBlocked: (barberId: string, date?: string) =>
      request<BlockedSlotDto[]>('GET', `/appointments/blocked/${barberId}${date ? `?date=${date}` : ''}`),
  },
}

export interface UserDto {
  id: string
  name: string
  phone: string
  email?: string
  role: 'client' | 'barber'
  verified: boolean
  createdAt: string
}

export interface BarberDto {
  id: string
  userId: string
  salonName?: string
  address?: string
  workingHours: { start: string; end: string }
  workingDays: number[]
  slotDuration: number
  qrCodeUrl?: string
  user: UserDto
}

export interface AppointmentDto {
  id: string
  barberId: string
  clientId: string
  clientName: string
  clientPhone: string
  date: string
  startTime: string
  endTime: string
  serviceType?: string
  status: string
  createdAt: string
  barber?: BarberDto
}

export interface BlockedSlotDto {
  id: string
  barberId: string
  date: string
  startTime: string
  endTime: string
  reason?: string
}

export interface TimeSlotDto {
  startTime: string
  endTime: string
  available: boolean
  appointmentId?: string
  blockedSlotId?: string
}

export interface SlotsResponse {
  slots: TimeSlotDto[]
  dayOff: boolean
}

export interface CreateBarberDto {
  salonName?: string
  address?: string
  workStart: string
  workEnd: string
  workingDays: number[]
  slotDuration: number
}

export interface BookDto {
  barberId: string
  date: string
  startTime: string
  serviceType?: string
}

export interface BlockSlotDto {
  date: string
  startTime: string
  endTime: string
  reason?: string
}

export interface ClientProfessionalDto {
  id: string
  barberId: string
  nickname: string | null
  createdAt: string
  barber: BarberDto
}
