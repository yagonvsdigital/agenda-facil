import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BarberProfile } from '../barbers/barber.entity'
import { User } from '../users/user.entity'

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

@Entity('appointments')
@Index(['barberId', 'date', 'startTime'], { unique: false })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'barber_id' })
  barberId: string

  @ManyToOne(() => BarberProfile, (b) => b.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'barber_id' })
  barber: BarberProfile

  @Column({ name: 'client_id' })
  clientId: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: User

  @Column({ type: 'date' })
  date: string

  @Column({ name: 'start_time', length: 5 })
  startTime: string

  @Column({ name: 'end_time', length: 5 })
  endTime: string

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  })
  status: AppointmentStatus

  @Column({ name: 'service_type', nullable: true, length: 80 })
  serviceType: string

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date

  @Column({ name: 'cancelled_by', nullable: true, length: 10 })
  cancelledBy: 'barber' | 'client'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
