import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(EventsGateway.name)

  // Map userId → Set<socketId>
  private userSockets = new Map<string, Set<string>>()

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized')
  }

  handleConnection(socket: Socket) {
    try {
      const token =
        (socket.handshake.auth?.token as string) ||
        (socket.handshake.headers?.authorization as string)?.replace('Bearer ', '')

      if (!token) { socket.disconnect(); return }

      const payload = this.jwt.verify<{ sub: string }>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      })

      socket.data.userId = payload.sub

      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set())
      }
      this.userSockets.get(payload.sub)?.add(socket.id)

      this.logger.debug(`User ${payload.sub} connected (${socket.id})`)
    } catch {
      socket.disconnect()
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data?.userId as string
    if (userId) {
      this.userSockets.get(userId)?.delete(socket.id)
    }
  }

  @SubscribeMessage('join_barber_room')
  joinBarberRoom(@ConnectedSocket() socket: Socket, @MessageBody() barberId: string) {
    socket.join(`barber:${barberId}`)
  }

  emitToBarber(barberId: string, event: string, payload: unknown) {
    this.server.to(`barber:${barberId}`).emit(event, payload)
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    const sockets = this.userSockets.get(userId)
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, payload)
      })
    }
  }

  emitToClient(clientId: string, event: string, payload: unknown) {
    const sockets = this.userSockets.get(clientId)
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, payload)
      })
    }
  }

  emitToAll(event: string, payload: unknown) {
    this.server.emit(event, payload)
  }
}
