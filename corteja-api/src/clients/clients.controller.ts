import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { IsOptional, IsString, IsUUID, Length } from 'class-validator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/user.entity'
import { ClientsService } from './clients.service'

class AddProfessionalDto {
  @IsUUID()
  barberId: string
}

class UpdateNicknameDto {
  @IsOptional()
  @IsString()
  @Length(0, 50)
  nickname?: string
}

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get('professionals')
  getMyProfessionals(@CurrentUser() user: User) {
    return this.clients.getMyProfessionals(user.id)
  }

  @Post('professionals')
  addProfessional(@CurrentUser() user: User, @Body() dto: AddProfessionalDto) {
    return this.clients.addProfessional(user.id, dto.barberId)
  }

  @Patch('professionals/:barberId/nickname')
  updateNickname(
    @CurrentUser() user: User,
    @Param('barberId') barberId: string,
    @Body() dto: UpdateNicknameDto,
  ) {
    return this.clients.updateNickname(user.id, barberId, dto.nickname ?? null)
  }
}
