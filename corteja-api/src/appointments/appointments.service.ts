import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import {
  format,
  addMinutes,
  parse,
  isBefore,
  isAfter,
  differenceInMinutes,
  parseISO,
} from 'date-fns'
import { Appointment } from './appointment.entity'
import { BlockedSlot } from './blocked-slot.entity'
import { BarbersService } from '../barbers/barbers.service'
import { NotificationsService } from '../notifications/notifications.service'
import { EventsGateway } from '../websocket/events.gateway'
import { UsersService } from '../users/users.service'
import { ClientProfessional } from '../clients/client-professional.entity'

/** Limite de cancelamentos por dia por cliente */
const MAX_DAILY_CANCELLATIONS = 3

/** Prazo mínimo antes do horário para permitir cancelamento (minutos) */
const MIN_CANCEL_NOTICE_MINUTES = 60

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly apptRepo: Repository<Appointment>,
    @InjectRepository(BlockedSlot)
    private readonly blockedRepo: Repository<BlockedSlot>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly barbers: BarbersService,
    private readonly users: UsersService,
    private readonly notifications: NotificationsService,
    private readonly events: EventsGateway,
  ) {}

  // ─── Slots ──────────────────────────────────────────────────────────────────

  async getSlots(barberId: string, date: string) {
    const barber = await this.barbers.findById(barberId)
    if (!barber) throw new NotFoundException('Profissional não encontrado')

    const dayOfWeek = new Date(date + 'T12:00:00').getDay()
    if (!barber.workingDays.includes(dayOfWeek)) {
      return { slots: [], dayOff: true }
    }

    const appointments = await this.apptRepo.find({ where: { barberId, date } })
    const blockedSlots = await this.blockedRepo.find({ where: { barberId, date } })

    const { start, end } = barber.workingHours
    const startBase = parse(start, 'HH:mm', new Date())
    const endBase = parse(end, 'HH:mm', new Date())
    const slots: { startTime: string; endTime: string; available: boolean; appointmentId: string | null; blockedSlotId: string | null }[] = []
    let cursor = startBase

    while (isBefore(cursor, endBase)) {
      const next = addMinutes(cursor, barber.slotDuration)
      if (isAfter(next, endBase)) break

      const slotStart = format(cursor, 'HH:mm')
      const slotEnd = format(next, 'HH:mm')

      // Horário está LIVRE se não existe agendamento com status != 'cancelled'
      const bookedAppt = appointments.find(
        (a) =>
          a.status !== 'cancelled' &&
          this.timesOverlap(a.startTime, a.endTime, slotStart, slotEnd),
      )
      const blocked = blockedSlots.find((b) =>
        this.timesOverlap(b.startTime, b.endTime, slotStart, slotEnd),
      )

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !bookedAppt && !blocked,
        appointmentId: bookedAppt?.id ?? null,
        blockedSlotId: blocked?.id ?? null,
      })

      cursor = next
    }

    return { slots, dayOff: false }
  }

  // ─── Booking (SELECT FOR UPDATE) ────────────────────────────────────────────

  async book(data: {
    barberId: string
    clientId: string
    clientName: string
    clientPhone: string
    date: string
    startTime: string
    endTime: string
    serviceType?: string
  }) {
    return this.dataSource.transaction(async (em) => {
      const conflict = await em
        .createQueryBuilder(Appointment, 'a')
        .where('a.barber_id = :barberId', { barberId: data.barberId })
        .andWhere('a.date = :date', { date: data.date })
        .andWhere('a.status != :status', { status: 'cancelled' })
        .andWhere('(a.start_time < :endTime AND a.end_time > :startTime)', {
          startTime: data.startTime,
          endTime: data.endTime,
        })
        .setLock('pessimistic_write')
        .getOne()

      if (conflict) {
        throw new ConflictException('Este horário acabou de ser ocupado. Escolha outro.')
      }

      const blocked = await em
        .createQueryBuilder(BlockedSlot, 'b')
        .where('b.barber_id = :barberId', { barberId: data.barberId })
        .andWhere('b.date = :date', { date: data.date })
        .andWhere('(b.start_time < :endTime AND b.end_time > :startTime)', {
          startTime: data.startTime,
          endTime: data.endTime,
        })
        .getOne()

      if (blocked) {
        throw new ConflictException('Este horário está bloqueado pelo profissional.')
      }

      const existing = await em.findOne(Appointment, {
        where: { barberId: data.barberId, clientId: data.clientId, date: data.date },
      })
      if (existing && existing.status !== 'cancelled') {
        throw new BadRequestException('Você já tem um agendamento neste dia com este profissional.')
      }

      const appt = em.create(Appointment, { ...data, status: 'pending' })
      const saved = await em.save(appt)

      // Auto-salva o profissional na lista do cliente (upsert silencioso)
      try {
        const exists = await this.dataSource.getRepository(ClientProfessional).findOne({
          where: { clientId: data.clientId, barberId: data.barberId },
        })
        if (!exists) {
          await this.dataSource.getRepository(ClientProfessional).save(
            this.dataSource.getRepository(ClientProfessional).create({
              clientId: data.clientId,
              barberId: data.barberId,
              nickname: null,
            }),
          )
        }
      } catch {}

      this.events.emitToBarber(data.barberId, 'appointment_created', saved)
      this.notifications.notifyNewAppointment(data.barberId, data.clientName, data.date, data.startTime)
      this.notifications.notifyClientConfirmed(data.clientId, data.barberId, data.date, data.startTime)

      return saved
    })
  }

  // ─── Leitura ─────────────────────────────────────────────────────────────────

  async getBarberAppointments(barberId: string, date?: string) {
    const qb = this.apptRepo
      .createQueryBuilder('a')
      .where('a.barber_id = :barberId', { barberId })
      .andWhere('a.status != :status', { status: 'cancelled' })
      .orderBy('a.date', 'ASC')
      .addOrderBy('a.start_time', 'ASC')

    if (date) qb.andWhere('a.date = :date', { date })
    return qb.getMany()
  }

  async getClientAppointments(clientId: string) {
    return this.apptRepo.find({
      where: { clientId },
      relations: ['barber', 'barber.user'],
      order: { date: 'DESC', startTime: 'DESC' },
    })
  }

  // ─── Cancelamento ────────────────────────────────────────────────────────────

  /**
   * Cancela o agendamento aplicando todos os guards de segurança.
   *
   * Regras:
   *   1. Apenas o dono (cliente ou barbeiro do perfil) pode cancelar
   *   2. Cliente: prazo mínimo de 60 min antes do horário
   *   3. Cliente: máximo 3 cancelamentos por dia
   *
   * Após cancelar:
   *   - status = 'cancelled'  — registro mantido para histórico
   *   - cancelledAt + cancelledBy preenchidos
   *   - Evento 'appointment_canceled' emitido para a sala do barbeiro (todos
   *     os clientes conectados ouvem e o slot reaparece imediatamente)
   *   - Evento emitido também ao cliente
   *   - Push notification para a parte afetada
   */
  async cancelAppointment(
    id: string,
    requesterId: string,
    requesterRole: 'barber' | 'client',
  ) {
    const appt = await this.apptRepo.findOne({ where: { id }, relations: ['barber', 'client'] })
    if (!appt) throw new NotFoundException('Agendamento não encontrado')

    if (appt.status === 'cancelled') {
      throw new BadRequestException('Agendamento já está cancelado')
    }

    // Autorização
    if (requesterRole === 'barber' && appt.barber.userId !== requesterId) {
      throw new ForbiddenException('Você não tem permissão para cancelar este agendamento')
    }
    if (requesterRole === 'client' && appt.clientId !== requesterId) {
      throw new ForbiddenException('Você não tem permissão para cancelar este agendamento')
    }

    // Guards de anti-abuso aplicados apenas ao cliente
    if (requesterRole === 'client') {
      this.assertCancellationWindow(appt)
      await this.assertDailyCancellationLimit(requesterId)
    }

    await this.apptRepo.update(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: requesterRole,
    })

    if (requesterRole === 'client') {
      await this.incrementClientCancellations(requesterId)
    }

    // Payload completo: o frontend usa barberId + date + startTime
    // para localizar e reabrir o slot exato na UI sem precisar recarregar
    const payload = {
      id,
      barberId: appt.barberId,
      date: appt.date,
      startTime: appt.startTime,
      endTime: appt.endTime,
      cancelledBy: requesterRole,
    }

    // Todos os clientes na sala do barbeiro recebem e veem o slot abrir
    this.events.emitToBarber(appt.barberId, 'appointment_canceled', payload)
    // O cliente específico recebe para atualizar seu painel
    this.events.emitToClient(appt.clientId, 'appointment_canceled', payload)

    if (requesterRole === 'barber') {
      this.notifications.notifyAppointmentCancelled(appt.clientId, appt.startTime, appt.date)
    } else {
      this.notifications.notifyProfessionalCancellation(
        appt.barber.userId,
        appt.client?.name ?? 'Cliente',
        appt.startTime,
        appt.date,
      )
    }

    return {
      id,
      status: 'cancelled',
      slot: { date: appt.date, startTime: appt.startTime, endTime: appt.endTime },
    }
  }

  // ─── Confirmar / Concluir ────────────────────────────────────────────────────

  async updateStatus(
    id: string,
    status: 'confirmed' | 'completed',
    requesterId: string,
    requesterRole: string,
  ) {
    const appt = await this.apptRepo.findOne({ where: { id }, relations: ['barber'] })
    if (!appt) throw new NotFoundException('Agendamento não encontrado')

    if (requesterRole === 'barber' && appt.barber.userId !== requesterId) {
      throw new ForbiddenException()
    }

    await this.apptRepo.update(id, { status })

    this.events.emitToBarber(appt.barberId, 'appointment_updated', { id, status })
    this.events.emitToClient(appt.clientId, 'appointment_updated', { id, status })

    if (status === 'confirmed') {
      this.notifications.notifyClientConfirmed(appt.clientId, appt.barberId, appt.date, appt.startTime)
    }

    return { id, status }
  }

  // ─── Remarcação ──────────────────────────────────────────────────────────────

  async rescheduleAppointment(
    id: string,
    requesterId: string,
    dto: { date: string; startTime: string },
  ) {
    return this.apptRepo.manager.transaction(async (em) => {
      const appt = await em.findOne(Appointment, {
        where: { id },
        relations: ['barber', 'barber.user', 'client'],
        lock: { mode: 'pessimistic_write' },
      })
      if (!appt) throw new NotFoundException('Agendamento não encontrado')

      // Apenas o barbeiro dono pode remarcar
      if (appt.barber.userId !== requesterId) {
        throw new ForbiddenException('Apenas o profissional pode remarcar este horário')
      }
      if (appt.status === 'cancelled') {
        throw new BadRequestException('Não é possível remarcar um agendamento cancelado')
      }

      // Calcula novo endTime baseado na duração original
      const oldStart = appt.startTime.split(':').map(Number)
      const oldEnd = appt.endTime.split(':').map(Number)
      const durationMin = (oldEnd[0] * 60 + oldEnd[1]) - (oldStart[0] * 60 + oldStart[1])
      const [newH, newM] = dto.startTime.split(':').map(Number)
      const newEndMin = newH * 60 + newM + durationMin
      const newEndTime = `${String(Math.floor(newEndMin / 60)).padStart(2, '0')}:${String(newEndMin % 60).padStart(2, '0')}`

      // Verifica conflito no novo slot
      const conflict = await em
        .createQueryBuilder(Appointment, 'a')
        .where('a.barber_id = :barberId', { barberId: appt.barberId })
        .andWhere('a.date = :date', { date: dto.date })
        .andWhere('a.status = :status', { status: 'confirmed' })
        .andWhere('a.id != :id', { id })
        .andWhere('a.start_time < :end AND a.end_time > :start', {
          start: dto.startTime,
          end: newEndTime,
        })
        .getOne()

      if (conflict) throw new BadRequestException('Horário já está ocupado')

      await em.update(Appointment, id, {
        date: dto.date,
        startTime: dto.startTime,
        endTime: newEndTime,
        status: 'confirmed',
      })

      // Notifica cliente
      this.events.emitToUser(appt.clientId, 'appointment_rescheduled', {
        id,
        date: dto.date,
        startTime: dto.startTime,
        endTime: newEndTime,
        barberName: appt.barber.user?.name,
      })
      this.notifications.notifyRescheduled(appt.clientId, dto.date, dto.startTime)

      // Notifica sala do barbeiro (atualiza disponibilidade em tempo real)
      this.events.emitToBarber(appt.barberId, 'appointment_rescheduled', { id })

      return { id, date: dto.date, startTime: dto.startTime, endTime: newEndTime }
    })
  }

  // ─── Horários bloqueados ──────────────────────────────────────────────────────

  async addBlockedSlot(data: {
    barberId: string
    date: string
    startTime: string
    endTime: string
    reason?: string
  }) {
    const slot = this.blockedRepo.create(data)
    const saved = await this.blockedRepo.save(slot)
    this.events.emitToBarber(data.barberId, 'slot_blocked', saved)
    return saved
  }

  async removeBlockedSlot(id: string, barberId: string) {
    const slot = await this.blockedRepo.findOne({ where: { id, barberId } })
    if (!slot) throw new NotFoundException()
    await this.blockedRepo.delete(id)
    this.events.emitToBarber(barberId, 'slot_unblocked', { id })
    return { deleted: true }
  }

  async getBlockedSlots(barberId: string, date?: string) {
    const qb = this.blockedRepo
      .createQueryBuilder('b')
      .where('b.barber_id = :barberId', { barberId })
    if (date) qb.andWhere('b.date = :date', { date })
    return qb.getMany()
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────

  private assertCancellationWindow(appt: Appointment) {
    const apptDatetime = parseISO(`${appt.date}T${appt.startTime}:00`)
    const minutesUntil = differenceInMinutes(apptDatetime, new Date())
    if (minutesUntil < MIN_CANCEL_NOTICE_MINUTES) {
      throw new BadRequestException(
        `Cancelamento permitido somente até ${MIN_CANCEL_NOTICE_MINUTES} minutos antes do horário.`,
      )
    }
  }

  private async assertDailyCancellationLimit(clientId: string) {
    const user = await this.users.findById(clientId)
    if (!user) return

    const today = format(new Date(), 'yyyy-MM-dd')
    const resetNeeded = user.cancellationResetDate !== today
    const count = resetNeeded ? 0 : user.dailyCancellations

    if (count >= MAX_DAILY_CANCELLATIONS) {
      throw new BadRequestException(
        `Limite de ${MAX_DAILY_CANCELLATIONS} cancelamentos por dia atingido. Tente novamente amanhã.`,
      )
    }
  }

  private async incrementClientCancellations(clientId: string) {
    const user = await this.users.findById(clientId)
    if (!user) return

    const today = format(new Date(), 'yyyy-MM-dd')
    const resetNeeded = user.cancellationResetDate !== today
    const newCount = resetNeeded ? 1 : user.dailyCancellations + 1

    await this.users.update(clientId, {
      dailyCancellations: newCount,
      cancellationResetDate: today,
    })
  }

  private timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    return toMin(aStart) < toMin(bEnd) && toMin(bStart) < toMin(aEnd)
  }
}
