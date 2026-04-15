import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Appointment } from './appointment.entity'
import { BlockedSlot } from './blocked-slot.entity'
import { AppointmentsService } from './appointments.service'
import { AppointmentsController } from './appointments.controller'
import { BarbersModule } from '../barbers/barbers.module'
import { UsersModule } from '../users/users.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { WebsocketModule } from '../websocket/websocket.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, BlockedSlot]),
    BarbersModule,
    UsersModule,
    NotificationsModule,
    WebsocketModule,
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
