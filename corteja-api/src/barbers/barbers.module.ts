import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BarberProfile } from './barber.entity'
import { BarbersService } from './barbers.service'
import { BarbersController } from './barbers.controller'

@Module({
  imports: [TypeOrmModule.forFeature([BarberProfile])],
  providers: [BarbersService],
  controllers: [BarbersController],
  exports: [BarbersService],
})
export class BarbersModule {}
