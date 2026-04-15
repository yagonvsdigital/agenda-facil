import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { OtpCode } from './otp.entity'
import { UsersService } from '../users/users.service'
import { User } from '../users/user.entity'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpCode)
    private readonly otpRepo: Repository<OtpCode>,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async sendOtp(phone: string): Promise<{ dev_code?: string }> {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await this.otpRepo.save(
      this.otpRepo.create({ phone, code, expiresAt, used: false }),
    )

    const twilioSid = this.config.get<string>('TWILIO_ACCOUNT_SID')
    if (twilioSid) {
      const twilio = require('twilio')(
        twilioSid,
        this.config.get('TWILIO_AUTH_TOKEN'),
      )
      await twilio.messages.create({
        body: `Seu código CorteJá: ${code}`,
        from: this.config.get('TWILIO_PHONE_NUMBER'),
        to: `+55${phone}`,
      })
      return {}
    }

    return { dev_code: code }
  }

  async verifyOtp(phone: string, code: string): Promise<{ access_token: string; user: User }> {
    const otp = await this.otpRepo
      .createQueryBuilder('otp')
      .where('otp.phone = :phone', { phone })
      .andWhere('otp.code = :code', { code })
      .andWhere('otp.used = false')
      .andWhere('otp.expires_at > NOW()')
      .orderBy('otp.created_at', 'DESC')
      .getOne()

    if (!otp) {
      throw new UnauthorizedException('Código inválido ou expirado')
    }

    await this.otpRepo.update(otp.id, { used: true })

    let user = await this.users.findByPhone(phone)
    if (!user) {
      throw new BadRequestException('Usuário não encontrado. Cadastre-se primeiro.')
    }

    if (!user.verified) {
      await this.users.update(user.id, { verified: true })
      user.verified = true
    }

    const token = this.jwt.sign({ sub: user.id, role: user.role })
    return { access_token: token, user }
  }

  async register(data: {
    name: string
    phone: string
    email?: string
    role: 'client' | 'barber'
  }): Promise<User> {
    const existing = await this.users.findByPhone(data.phone)
    if (existing) {
      throw new BadRequestException('Telefone já cadastrado')
    }
    return this.users.create({ ...data, verified: false })
  }

  signToken(userId: string, role: string) {
    return this.jwt.sign({ sub: userId, role })
  }
}
