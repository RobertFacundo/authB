import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let mailService: MailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            getUserByEmail: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            getUserByProfile: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sholud successully register an user', async () => {
    const firstName = 'John';
    const lastName = 'Doe';
    const email = 'johndoe@example.com';
    const password = 'StrongPassword1!';
    const captchaToken = 'captcha-token';

    jest.spyOn(service, 'verifyReCaptcha').mockResolvedValue(true);

    jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
    jest.spyOn(userService, 'createUser').mockResolvedValue({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 10),
      id: 1,
      isActive: false,
      isOAuth: false
    });

    jest.spyOn(mailService, 'sendVerificationEmail').mockResolvedValue(undefined);

    const result = await service.register(firstName, lastName, email, password, captchaToken);

    expect(result.message).toBe('User registered successfully. Please check your email for verification.');
    expect(userService.createUser).toHaveBeenCalledWith(firstName, lastName, email, expect.any(String));
    expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(email);
  });

  it('should successfully log in an user', async () => {
    const email = 'johndoe@example.com';
    const password = 'StrongPassword1!';

    jest.spyOn(userService, 'getUserByEmail').mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email,
      password: await bcrypt.hash(password, 10),
      isActive: true,
      isOAuth: false
    });

    const token = 'mock-jwt-token';
    jest.spyOn(jwtService, 'sign').mockReturnValue(token);

    const result = await service.login(email, password);

    expect(result.access_token).toBe(token);
    expect(jwtService.sign).toHaveBeenCalled();
  });

  it('should successfully verify an email', async () => {
    const token = 'valid-token';
    const decoded = { email: 'johndoe@example.com', sub: 1 };
    const password = 'StrongPassword1!';

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(decoded);
    jest.spyOn(userService, 'getUserByEmail').mockResolvedValue({
      id: 1, email: 'johndoe@example.com', isActive: false, firstName: 'John',
      lastName: 'Doe', isOAuth: false, password
    });
    jest.spyOn(userService, 'updateUser').mockResolvedValue({
      id: 1, email: 'johndoe@example.com', isActive: true, firstName: 'John',
      lastName: 'Doe', isOAuth: false, password
    });

    const result = await service.verifyEmail(token);

    expect(result.message).toBe('Email verified successfully!');
    expect(userService.updateUser).toHaveBeenCalled();
  });

  it('should send password reset email', async () => {
    const email = 'johndoe@example.com';
    const password = 'StrongPassword1!';
    const token = 'reset-token';

    jest.spyOn(userService, 'getUserByEmail').mockResolvedValue({
      id: 1, email, isActive: false, firstName: 'John',
      lastName: 'Doe', isOAuth: false, password
    });
    jest.spyOn(jwtService, 'sign').mockReturnValue(token);
    jest.spyOn(mailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);

    const result = await service.forgotPassword(email);

    expect(result.message).toBe('Password reset link has been sent to your email.');
    expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(email, token)
  })
});
