import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (ConfigService: ConfigService) => {
        const dbUrl = ConfigService.get<string>('DATABASE_URL');
        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [],
            logging: process.env.NODE_ENV !== 'production',
            synchronize: process.env.NODE_ENV !== 'production',
          };
        } else {
          return {
            type: 'postgres',
            host: ConfigService.get<string>('DB_HOST'),
            port: ConfigService.get<number>('DB_PORT'),
            username: ConfigService.get<string>('DB_USERNAME'),
            password: ConfigService.get<string>('DB_PASSWORD'),
            database: ConfigService.get<string>('DB_DATABASE'),
            entities: [],
            logging: process.env.NODE_ENV !== 'production',
            synchronize: process.env.NODE_ENV !== 'production',
          };
        }
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
