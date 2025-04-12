import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer'
import * as jwt from 'jsonwebtoken';

jest.mock('nodemailer')
jest.mock('jsonwebtoken');

describe('MailService', () => {
  let service: MailService;
  let sendMailMock: jest.Mock;
  let signMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue(true);
    signMock = jest.fn().mockReturnValue('mocked-jwt-value');

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
    (jwt.sign as jest.Mock) = signMock;

    process.env.MAIL_USER = 'test@mail.com';
    process.env.MAIL_PASS = 'password123';
    process.env.JWT_SECRET_KEY = 'supersecretkey';
    process.env.NODE_ENV = 'test';

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a verification email', async () => {
    const email = 'user@example.com';

    await service.sendVerificationEmail(email);

    expect(jwt.sign).toHaveBeenCalledWith({ email }, 'supersecretkey', { expiresIn: '1h' });
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: 'Please verify your email address',
        html: expect.stringContaining('Verify Email'),
      })
    );
  });

  it('should send a password resetemail', async () => {
    const email = 'user@example.com';
    const token = 'mocked-reset-token';

    await service.sendPasswordResetEmail(email, token);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: 'Password Reset Request',
        html: expect.stringContaining('Reset Email'),
      })
    );
  });
});
