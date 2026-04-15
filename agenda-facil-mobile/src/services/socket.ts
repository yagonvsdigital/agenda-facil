import { io, Socket } from 'socket.io-client'

const WS_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1')
  .replace('/api/v1', '')

let socket: Socket | null = null

export function initSocket(token: string): Socket {
  if (socket?.connected) return socket
  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  })
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function joinBarberRoom(barberId: string) {
  socket?.emit('join_barber_room', { barberId })
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
