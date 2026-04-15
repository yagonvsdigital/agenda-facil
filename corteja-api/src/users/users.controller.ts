import { Body, Controller, Patch, UseGuards } from '@nestjs/common'
import { IsString, Length } from 'class-validator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from './user.entity'
import { UsersService } from './users.service'

class SaveFcmTokenDto {
  @IsString()
  @Length(1, 300)
  token: string
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  saveFcmToken(@CurrentUser() user: User, @Body() dto: SaveFcmTokenDto) {
    return this.users.saveFcmToken(user.id, dto.token)
  }
}
