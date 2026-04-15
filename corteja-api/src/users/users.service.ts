import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['barberProfile'] })
  }

  findByPhone(phone: string) {
    return this.repo.findOne({ where: { phone }, relations: ['barberProfile'] })
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data))
  }

  update(id: string, data: Partial<User>) {
    return this.repo.update(id, data)
  }

  saveFcmToken(userId: string, token: string) {
    return this.repo.update(userId, { fcmToken: token })
  }
}
