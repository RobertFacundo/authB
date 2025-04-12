import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const port = process.env.PORT || 3000; 

  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription('Endpoints documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);

  if (process.env.NODE_ENV === 'production') {
    console.log('Application is running in... production environment');
  } else {
    console.log('Application is running in... development environment');
  }
}
bootstrap();
