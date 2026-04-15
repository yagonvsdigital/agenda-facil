import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/user.entity'
import { AppointmentsService } from './appointments.service'

class BookDto {
  @IsString()
  barberId: string

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string

  @IsOptional()
  @IsString()
  @Length(1, 80)
  serviceType?: string
}

class UpdateStatusDto {
  @IsEnum(['confirmed', 'completed'])
  status: 'confirmed' | 'completed'
}

class RescheduleDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string
}

class BlockSlotDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime: string

  @IsOptional()
  @IsString()
  @Length(0, 100)
  reason?: string
}

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Get('slots/:barberId')
  getSlots(@Param('barberId') barberId: string, @Query('date') date: string) {
    return this.service.getSlots(barberId, date)
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  async book(@CurrentUser() user: User, @Body() dto: BookDto) {
    const barber = await this.service['barbers'].findByUserId(user.id)
    const endTime = this.calcEnd(dto.startTime, barber?.slotDuration ?? 30)

    return this.service.book({
      barberId: dto.barberId,
      clientId: user.id,
      clientName: user.name,
      clientPhone: user.phone,
      date: dto.date,
      startTime: dto.startTime,
      endTime,
      serviceType: dto.serviceType,
    })
  }

  @Get('barber')
  @UseGuards(JwtAuthGuard)
  async getBarberAppts(@CurrentUser() user: User, @Query('date') date?: string) {
    const profile = await this.service['barbers'].findByUserId(user.id)
    if (!profile) return []
    return this.service.getBarberAppointments(profile.id, date)
  }

  @Get('client')
  @UseGuards(JwtAuthGuard)
  getClientAppts(@CurrentUser() user: User) {
    return this.service.getClientAppointments(user.id)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.service.updateStatus(id, dto.status, user.id, user.role)
  }

  @Delete(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  cancelAppointment(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.cancelAppointment(id, user.id, user.role as 'barber' | 'client')
  }

  @Patch(':id/reschedule')
  @UseGuards(JwtAuthGuard)
  reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleDto,
    @CurrentUser() user: User,
  ) {
    return this.service.rescheduleAppointment(id, user.id, dto)
  }

  @Post('blocked')
  @UseGuards(JwtAuthGuard)
  async addBlock(@CurrentUser() user: User, @Body() dto: BlockSlotDto) {
    const profile = await this.service['barbers'].findByUserId(user.id)
    if (!profile) throw new Error('Perfil não encontrado')
    return this.service.addBlockedSlot({ barberId: profile.id, ...dto })
  }

  @Delete('blocked/:id')
  @UseGuards(JwtAuthGuard)
  async removeBlock(@Param('id') id: string, @CurrentUser() user: User) {
    const profile = await this.service['barbers'].findByUserId(user.id)
    if (!profile) throw new Error('Perfil não encontrado')
    return this.service.removeBlockedSlot(id, profile.id)
  }

  @Get('blocked/:barberId')
  getBlocked(@Param('barberId') barberId: string, @Query('date') date?: string) {
    return this.service.getBlockedSlots(barberId, date)
  }

  private calcEnd(startTime: string, durationMin: number) {
    const [h, m] = startTime.split(':').map(Number)
    const total = h * 60 + m + durationMin
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }
}
