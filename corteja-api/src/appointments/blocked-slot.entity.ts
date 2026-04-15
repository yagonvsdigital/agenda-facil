import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('blocked_slots')
@Index(['barberId', 'date'])
export class BlockedSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'barber_id' })
  barberId: string

  @Column({ type: 'date' })
  date: string

  @Column({ name: 'start_time', length: 5 })
  startTime: string

  @Column({ name: 'end_time', length: 5 })
  endTime: string

  @Column({ nullable: true, length: 100 })
  reason: string
}
