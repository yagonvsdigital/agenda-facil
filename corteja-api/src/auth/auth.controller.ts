import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator'
import { AuthService } from './auth.service'

class SendOtpDto {
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos (somente números)' })
  phone: string
}

class VerifyOtpDto {
  @IsString()
  @Matches(/^\d{10,11}$/)
  phone: string

  @IsString()
  @Length(6, 6)
  code: string
}

class RegisterDto {
  @IsString()
  @Length(2, 120)
  name: string

  @IsString()
  @Matches(/^\d{10,11}$/)
  phone: string

  @IsOptional()
  @IsString()
  email?: string

  @IsEnum(['client', 'barber'])
  role: 'client' | 'barber'
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('send-otp')
  @HttpCode(200)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phone)
  }

  @Post('verify-otp')
  @HttpCode(200)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.code)
  }

  @Post('register')
  @HttpCode(201)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto)
  }
}
