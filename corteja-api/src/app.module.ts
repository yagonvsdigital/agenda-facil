import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { User } from './users/user.entity'
import { BarberProfile } from './barbers/barber.entity'
import { Appointment } from './appointments/appointment.entity'
import { BlockedSlot } from './appointments/blocked-slot.entity'
import { OtpCode } from './auth/otp.entity'
import { ClientProfessional } from './clients/client-professional.entity'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { BarbersModule } from './barbers/barbers.module'
import { AppointmentsModule } from './appointments/appointments.module'
import { NotificationsModule } from './notifications/notifications.module'
import { WebsocketModule } from './websocket/websocket.module'
import { ClientsModule } from './clients/clients.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'corteja'),
        password: config.get('DB_PASS', 'corteja_pass'),
        database: config.get('DB_NAME', 'corteja_db'),
        entities: [User, BarberProfile, Appointment, BlockedSlot, OtpCode, ClientProfessional],
        synchronize: true,
        logging: false,
        ssl: false,
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),

    AuthModule,
    UsersModule,
    BarbersModule,
    AppointmentsModule,
    NotificationsModule,
    WebsocketModule,
    ClientsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
