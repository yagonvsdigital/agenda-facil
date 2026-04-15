import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { BarberProfile } from '../barbers/barber.entity'

export type UserRole = 'client' | 'barber'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 120 })
  name: string

  @Column({ unique: true, length: 20 })
  phone: string

  @Column({ nullable: true, length: 120 })
  email: string

  @Column({ type: 'enum', enum: ['client', 'barber'] })
  role: UserRole

  @Column({ default: false })
  verified: boolean

  @Column({ name: 'daily_cancellations', default: 0 })
  dailyCancellations: number

  @Column({ name: 'cancellation_reset_date', type: 'date', nullable: true })
  cancellationResetDate: string

  @Column({ name: 'fcm_token', nullable: true, length: 300 })
  fcmToken: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToOne(() => BarberProfile, (b) => b.user, { nullable: true })
  barberProfile: BarberProfile
}
