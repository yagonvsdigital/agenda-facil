import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '../users/user.entity'
import { Appointment } from '../appointments/appointment.entity'

@Entity('barbers')
export class BarberProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User, (u) => u.barberProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'salon_name', nullable: true, length: 120 })
  salonName: string

  @Column({ nullable: true, length: 200 })
  address: string

  @Column({ name: 'working_hours', type: 'jsonb' })
  workingHours: { start: string; end: string }

  @Column({ name: 'working_days', type: 'int', array: true })
  workingDays: number[]

  @Column({ name: 'slot_duration', default: 30 })
  slotDuration: number

  @Column({ name: 'qr_code_url', nullable: true, length: 500 })
  qrCodeUrl: string

  @OneToMany(() => Appointment, (a) => a.barber)
  appointments: Appointment[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
