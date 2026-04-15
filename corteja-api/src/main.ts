import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import * as helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  })

  // Segurança
  app.use((helmet as any).default())

  // CORS — permite frontend e app mobile
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3001', 'capacitor://localhost'],
    credentials: true,
  })

  // Validação automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Prefixo global da API
  app.setGlobalPrefix('api/v1')

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`CorteJá API rodando em: http://localhost:${port}`)
}

bootstrap()
