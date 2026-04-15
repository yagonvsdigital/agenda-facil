import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async sendPush(userId: string, title: string, body: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    const token = user?.fcmToken
    if (!token) return

    // Suporta Expo Push Tokens (exponent/...) e FCM tokens
    if (token.startsWith('ExponentPushToken')) {
      await this.sendExpoNotification(token, title, body)
    } else {
      await this.sendFirebaseNotification(token, title, body)
    }
  }

  private async sendExpoNotification(token: string, title: string, body: string): Promise<void> {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: token, title, body, sound: 'default', priority: 'high' }),
      })
    } catch {}
  }

  private async sendFirebaseNotification(token: string, title: string, body: string): Promise<void> {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    if (!projectId || !clientEmail || !privateKey) return
    try {
      const { GoogleAuth } = await import('google-auth-library').catch(() => ({ GoogleAuth: null }))
      if (!GoogleAuth) return
      const auth = new GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey.replace(/\\n/g, '\n') },
        scopes: 'https://www.googleapis.com/auth/firebase.messaging',
      })
      const accessToken = await (await auth.getClient()).getAccessToken()
      await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { token, notification: { title, body } } }),
      })
    } catch {}
  }

  async notifyNewAppointment(barberId: string, clientName: string, date: string, time: string): Promise<void> {
    await this.sendPush(barberId, '📅 Novo agendamento!', `${clientName} agendou para ${date} às ${time}`)
  }

  async notifyRescheduled(clientId: string, newDate: string, newTime: string): Promise<void> {
    await this.sendPush(clientId, '🔄 Horário remarcado', `Seu horário foi remarcado para ${newDate} às ${newTime}`)
  }

  async notifyCanceled(clientId: string, date: string, time: string): Promise<void> {
    await this.sendPush(clientId, '❌ Agendamento cancelado', `Seu horário do dia ${date} às ${time} foi cancelado`)
  }
}
