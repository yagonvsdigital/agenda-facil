import { addMinutes, format, parse, isAfter, isBefore } from 'date-fns'
import type { Barber, TimeSlot, Appointment, BlockedSlot } from '@/types'

export function generateSlots(
  barber: Barber,
  date: string,
  appointments: Appointment[],
  blockedSlots: BlockedSlot[]
): TimeSlot[] {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay()
  if (!barber.workingDays.includes(dayOfWeek)) return []

  const slots: TimeSlot[] = []
  const startBase = parse(barber.workingHours.start, 'HH:mm', new Date())
  const endBase = parse(barber.workingHours.end, 'HH:mm', new Date())

  let cursor = startBase
  while (isBefore(cursor, endBase)) {
    const next = addMinutes(cursor, barber.slotDuration)
    if (isAfter(next, endBase)) break

    const startTime = format(cursor, 'HH:mm')
    const endTime = format(next, 'HH:mm')

    const isBooked = appointments.some(
      (a) =>
        a.date === date &&
        a.status !== 'cancelled' &&
        timesOverlap(a.startTime, a.endTime, startTime, endTime)
    )

    const blockedBy = blockedSlots.find(
      (b) =>
        b.date === date &&
        timesOverlap(b.startTime, b.endTime, startTime, endTime)
    )

    const appt = appointments.find(
      (a) =>
        a.date === date &&
        a.status !== 'cancelled' &&
        timesOverlap(a.startTime, a.endTime, startTime, endTime)
    )

    slots.push({
      startTime,
      endTime,
      available: !isBooked && !blockedBy,
      appointmentId: appt?.id,
      blockedSlotId: blockedBy?.id,
    })

    cursor = next
  }

  return slots
}

function timesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const aS = toMin(aStart), aE = toMin(aEnd)
  const bS = toMin(bStart), bE = toMin(bEnd)
  return aS < bE && bS < aE
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  return digits
}

export function dayName(day: number): string {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day]
}

export function fullDayName(day: number): string {
  return [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ][day]
}


