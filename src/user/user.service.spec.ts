import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateUser', () => {
    it('should create a user successfully', async () => {
      const dto = { firstName: 'Facu', lastName: 'Robert', email: 'facu@test.com', password: '4567869!bB', isOAuth: false, isActive: false };
      const user = { id: 1, ...dto };

      repo.create.mockReturnValue(user);
      repo.save.mockResolvedValue(user);

      const result = await service.createUser(dto.firstName, dto.lastName, dto.email, dto.password);
      console.log('Object passed to repo.create:', repo.create.mock.calls[0][0]);

      expect(repo.create).toHaveBeenCalledWith({
        firstName: 'Facu',
        lastName: 'Robert',
        email: 'facu@test.com',
        password: '4567869!bB',
        isOAuth: false
      });
      expect(repo.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, email: 'facu@test.com' } as User;
      repo.findOne.mockResolvedValue(user);

      const result = await service.getUserByEmail('facu@test.com');
      expect(result).toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'facu@test.com' } });
    });
  });

  describe('validatePassword', () => {
    it('should return true if password is valid', async () => {
      const user = { email: 'facu@test.com', password: await bcrypt.hash('4567869!bB', 10) } as User;
      repo.findOne.mockResolvedValue(user);

      const isValid = await service.validatePassword(user.email, '4567869!bB');
      expect(isValid).toBe(true);
    });

    it('should return false if password not valid', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.validatePassword('nonexisting@user.com', '123');
      expect(result).toBe(false);
    })
  });

  describe('changePassword', () => {
    it('should hash and update the password', async () => {
      const user = { id: 1, password: '4567869!bB' } as User;
      repo.findOne.mockResolvedValue(user);
      repo.save.mockResolvedValue({ ...user, password: '$2a$10$hashedpasswordexample1234' } as User);

      const result = await service.changePassword(1, '1234567!aA');
      expect(result.password).not.toBe('1234567!aA');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw erro if user not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.changePassword(99, '1238467!aA')).rejects.toThrow('User not found');
    });
  });

  describe('update user', () => {
    it('should update user fields', async () => {
      const existing = { id: 1, firstName: 'Old', lastName: 'Name', email: 'old@test.com', isActive: true } as User;
      const updated = { id: 1, firstName: 'New', lastName: 'Name', email: 'new@test.com', isActive: false } as User;

      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue(updated);

      const result = await service.updateUser(updated);
      expect(result).toEqual(updated);
      expect(repo.save).toHaveBeenCalled();
    });

    it('it should throw an error if user not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateUser({ id: 99 } as User)).rejects.toThrow('User not found');
    });
  });
});
