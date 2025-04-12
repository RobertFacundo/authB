import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createUser: jest.fn(async (firstName, lastName, email, password) => ({
      id: 1,
      firstName,
      lastName,
      email,
      password,
    })),
    getUserProfile: jest.fn(async (id) =>
      id === 1
        ? { id, firstName: 'test', lastName: 'super', email: 'test@example.com' }
        : null
    ),
    changePassword: jest.fn(async (id, newPassword) =>
      id === 1 ? { id, password: newPassword } : null
    ),
    getUserByEmail: jest.fn((email) =>
      email === 'test@example.com' ? { id: 1, email } : null
    ),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks()
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an user', async () => {
    const userDto = {
      firstName: 'test',
      lastName: 'super',
      email: 'test@example.com',
      password: '1234567!aA',
    };

    const result = await controller.createUser(userDto);

    expect(result).toEqual({
      id: 1,
      ...userDto,
    });
    expect(userService.createUser).toHaveBeenCalledWith(userDto.firstName,
      userDto.lastName,
      userDto.email,
      userDto.password)
    expect(userService.createUser).toHaveBeenCalledTimes(1)
  });
  it('It should return an user profile by id', async () => {
    const result = await controller.getUserProfile(1);

    expect(result).toEqual({
      id: 1,
      firstName: 'test',
      lastName: 'super',
      email: 'test@example.com',
    });
    expect(userService.getUserProfile).toHaveBeenCalledWith(1)
  });

  it('it should return null if profile not found', async () => {
    const result = await controller.getUserProfile(3);

    expect(result).toBeNull();
    expect(userService.getUserProfile).toHaveBeenCalledWith(3);
  });

  it('it should change password', async () => {
    const result = await controller.changePassword(1, {
      newPassword: '4567896!bB',
    });

    expect(result).toEqual({
      id: 1,
      password: '4567896!bB',
    });
    expect(userService.changePassword).toHaveBeenCalledWith(
      1,
      '4567896!bB',
    )
  });

  it('should return null if user not found when updating password', async () => {
    const result = await controller.changePassword(999, { newPassword: '4567896!kK' });

    expect(result).toBeNull();
    expect(userService.changePassword).toHaveBeenCalledWith(999, '4567896!kK')
  });

  it('should return true if user exist by email', async () => {
    const result = await controller.getUserByEmail('test@example.com');

    expect(result).toBe(true);
    expect(userService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('shoudl return false if user not exist by email', async () => {
    const result = await controller.getUserByEmail('test!@example.com');

    expect(result).toBe(false);
    expect(userService.getUserByEmail).toHaveBeenCalledWith('test!@example.com');
  })
});
