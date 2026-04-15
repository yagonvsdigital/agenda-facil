import { nanoid } from './nanoid'
import { db } from './storage'

export function pushNotification(
  userId: string,
  userRole: 'barber' | 'client',
  title: string,
  message: string
) {
  db.notifications.save({
    id: nanoid(),
    userId,
    userRole,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  })

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: message, icon: '/scissors.svg' })
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
