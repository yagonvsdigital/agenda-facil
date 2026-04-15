import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity'
import { BarberProfile } from '../barbers/barber.entity'

@Entity('client_professionals')
@Index(['clientId', 'barberId'], { unique: true })
export class ClientProfessional {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'client_id' })
  clientId: string

  @Column({ name: 'barber_id' })
  barberId: string

  @Column({ type: 'varchar', nullable: true, length: 50 })
  nickname: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: User

  @ManyToOne(() => BarberProfile, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'barber_id' })
  barber: BarberProfile
}
