import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClientProfessional } from './client-professional.entity'
import { BarberProfile } from '../barbers/barber.entity'
import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfessional, BarberProfile])],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
