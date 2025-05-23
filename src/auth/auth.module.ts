import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [], 
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), 
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService], 
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy],
})
export class AuthModule { }
