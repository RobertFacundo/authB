import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //!!!!!!!!!!
  app.enableCors({
    origin: 'https://frontend-three-iota-40.vercel.app', // Permite solicitudes de este dominio
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log('Application is running...', 'Bootstrap');
}
bootstrap();
