import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);

  if (process.env.NODE_ENV === 'production') {
    console.log('Application is running in ... production environment');
  } else {
    console.log('Application is running in ...development environment');
  }
}
bootstrap();
