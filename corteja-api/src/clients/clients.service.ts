import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ClientProfessional } from './client-professional.entity'
import { BarberProfile } from '../barbers/barber.entity'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientProfessional)
    private readonly repo: Repository<ClientProfessional>,
    @InjectRepository(BarberProfile)
    private readonly barberRepo: Repository<BarberProfile>,
  ) {}

  async getMyProfessionals(clientId: string): Promise<ClientProfessional[]> {
    return this.repo.find({
      where: { clientId },
      relations: ['barber', 'barber.user'],
      order: { createdAt: 'DESC' },
    })
  }

  async addProfessional(clientId: string, barberId: string): Promise<ClientProfessional> {
    const barber = await this.barberRepo.findOne({ where: { id: barberId } })
    if (!barber) throw new NotFoundException('Profissional não encontrado')

    const existing = await this.repo.findOne({ where: { clientId, barberId } })
    if (existing) return existing

    const entry = this.repo.create({ clientId, barberId, nickname: null })
    return this.repo.save(entry)
  }

  async updateNickname(clientId: string, barberId: string, nickname: string | null): Promise<ClientProfessional> {
    const entry = await this.repo.findOne({ where: { clientId, barberId } })
    if (!entry) throw new NotFoundException('Profissional não encontrado na sua lista')

    await this.repo.update(entry.id, { nickname: nickname || null })
    return this.repo.findOne({
      where: { id: entry.id },
      relations: ['barber', 'barber.user'],
    }) as Promise<ClientProfessional>
  }
}
