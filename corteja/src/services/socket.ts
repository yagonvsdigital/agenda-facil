import { io, Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:3000'

let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => {
    console.debug('[socket] connected')
  })
  socket.on('disconnect', (reason) => {
    console.debug('[socket] disconnected', reason)
  })
  socket.on('connect_error', (err) => {
    console.warn('[socket] error', err.message)
  })

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}

export function joinBarberRoom(barberId: string) {
  socket?.emit('join_barber_room', barberId)
}
