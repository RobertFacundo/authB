import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a string containing the expected HTML structure', () => {
      const response = appController.getHello();

      expect(typeof response).toBe('string')

      expect(response).toContain('<div');
      expect(response).toContain('This backend is hosted for FREE on Render');
    });
  });
});
