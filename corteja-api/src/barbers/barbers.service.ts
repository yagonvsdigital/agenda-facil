import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as QRCode from 'qrcode'
import { ConfigService } from '@nestjs/config'
import { BarberProfile } from './barber.entity'
import { User } from '../users/user.entity'

@Injectable()
export class BarbersService {
  constructor(
    @InjectRepository(BarberProfile)
    private readonly repo: Repository<BarberProfile>,
    private readonly config: ConfigService,
  ) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['user'] })
  }

  findByUserId(userId: string) {
    return this.repo.findOne({ where: { userId }, relations: ['user'] })
  }

  async createProfile(
    user: User,
    data: {
      salonName?: string
      address?: string
      workStart: string
      workEnd: string
      workingDays: number[]
      slotDuration: number
    },
  ) {
    const existing = await this.findByUserId(user.id)
    if (existing) throw new BadRequestException('Perfil já existe')

    const profile = this.repo.create({
      userId: user.id,
      salonName: data.salonName,
      address: data.address,
      workingHours: { start: data.workStart, end: data.workEnd },
      workingDays: data.workingDays,
      slotDuration: data.slotDuration,
    })
    const saved = await this.repo.save(profile)

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost')
    const bookingUrl = `${frontendUrl}/book/${saved.id}`

    await this.repo.update(saved.id, { qrCodeUrl: bookingUrl })
    return { ...saved, qrCodeUrl: bookingUrl }
  }

  async updateProfile(
    userId: string,
    data: {
      salonName?: string
      address?: string
      workStart: string
      workEnd: string
      workingDays: number[]
      slotDuration: number
    },
  ) {
    const profile = await this.findByUserId(userId)
    if (!profile) throw new BadRequestException('Perfil não encontrado')

    await this.repo.update(profile.id, {
      salonName: data.salonName,
      address: data.address,
      workingHours: { start: data.workStart, end: data.workEnd },
      workingDays: data.workingDays,
      slotDuration: data.slotDuration,
    })

    return this.findByUserId(userId)
  }
}
