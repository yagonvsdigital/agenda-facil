import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { IsArray, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/user.entity'
import { BarbersService } from './barbers.service'

class CreateBarberProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  salonName?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  workStart: string

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  workEnd: string

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  workingDays: number[]

  @IsInt()
  @Min(10)
  @Max(120)
  slotDuration: number
}

class UpdateBarberProfileDto extends CreateBarberProfileDto {}

@Controller('barbers')
export class BarbersController {
  constructor(private readonly barbers: BarbersService) {}

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    const barber = await this.barbers.findById(id)
    if (!barber) throw new NotFoundException('Profissional não encontrado')
    return barber
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  createProfile(
    @CurrentUser() user: User,
    @Body() dto: CreateBarberProfileDto,
  ) {
    return this.barbers.createProfile(user, dto)
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateBarberProfileDto,
  ) {
    return this.barbers.updateProfile(user.id, dto)
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() user: User) {
    return this.barbers.findByUserId(user.id)
  }
}
