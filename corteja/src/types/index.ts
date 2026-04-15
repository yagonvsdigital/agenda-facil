export type UserRole = 'barber' | 'client'

export interface Barber {
  id: string
  name: string
  salonName?: string
  phone: string
  address?: string
  workingHours: { start: string; end: string }
  workingDays: number[]
  slotDuration: number
  createdAt: string
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  verified: boolean
  createdAt: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Appointment {
  id: string
  barberId: string
  clientId: string
  clientName: string
  clientPhone: string
  date: string
  startTime: string
  endTime: string
  serviceType?: string
  status: AppointmentStatus
  createdAt: string
}

export interface BlockedSlot {
  id: string
  barberId: string
  date: string
  startTime: string
  endTime: string
  reason?: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
  appointmentId?: string
  blockedSlotId?: string
}

export interface Notification {
  id: string
  userId: string
  userRole: UserRole
  title: string
  message: string
  read: boolean
  createdAt: string
}
