import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    getGitHubUrl: jest.fn(),
    githubLogin: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [
            {
              ttl: 60,
              limit: 10,
            },
          ],
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register an user', async () => {
    const mockBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: '4567869!bB',
      captchaToken: 'valid-captcha',
    };

    const expectedResult = { message: 'User registered successfully' };

    mockAuthService.register.mockResolvedValue(expectedResult);

    const result = await controller.register(mockBody);

    expect(mockAuthService.register).toHaveBeenCalledWith(
      'John',
      'Doe',
      'john@example.com',
      '4567869!bB',
      'valid-captcha'
    );
    expect(result).toBe(expectedResult);
  });

  it('shoudl login an user', async () => {
    const mockLogin = {
      email: 'test@example.com',
      password: 'secret123',
    };
    const mockToken = { accessToken: 'token' };

    mockAuthService.login.mockResolvedValue(mockToken);

    const result = await controller.login(mockLogin);

    expect(mockAuthService.login).toHaveBeenCalledWith(
      'test@example.com',
      'secret123'
    );
    expect(result).toBe(mockToken);
  });

  it('should verify email with token', async () => {
    const token = 'verify-token';
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockAuthService.verifyEmail.mockResolvedValue(true);

    await controller.verifyEmail(token, mockRes);

    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(token);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Your email has been successfully verified!',
      success: true,
    });
  });
  it('should return valid token message for password reset', async () => {
    const token = 'verify-token';
    mockJwtService.verifyAsync.mockResolvedValue({ userId: 123 });

    const result = await controller.getResetPassword(token);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
    expect(result).toEqual({ message: 'Token is valid. Show reset password form.' })
  });
});
