import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('otp_codes')
export class OtpCode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 20 })
  phone: string

  @Column({ length: 6 })
  code: string

  @Column({ name: 'expires_at' })
  expiresAt: Date

  @Column({ default: false })
  used: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
