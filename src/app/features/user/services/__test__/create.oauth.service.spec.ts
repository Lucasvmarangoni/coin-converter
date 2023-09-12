import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@src/app/models/user';
import { UnprocessableEntityException } from '@nestjs/common';
import { CreateForOAuth } from '../create.oauth.service';
import { CreateService } from '../create.service';
import { FindUsersService } from '../../util/find-user';
import { UserResponse } from '../models/user-models';
import { UserInfo } from '@src/app/auth/models/user-info';
import { getModelToken } from '@nestjs/mongoose';

describe('CreateForOAuth', () => {
  let service: CreateForOAuth;
  let createUserService: CreateService;
  let findUsersService: FindUsersService;
  const mockcreateUserService = { execute: jest.fn() };
  const mockfindUserService = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        CreateForOAuth,
        { provide: FindUsersService, useValue: mockfindUserService },
        { provide: CreateService, useValue: mockcreateUserService },
        {
          provide: getModelToken('UserModel'),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateForOAuth>(CreateForOAuth);
    createUserService = module.get<CreateService>(CreateService);
    findUsersService = module.get<FindUsersService>(FindUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(createUserService).toBeDefined();
    expect(findUsersService).toBeDefined();
  });

  it('should create a user with OAuth', async () => {
    const userData: Partial<User> = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const userResponse: UserResponse = {
      user: {
        name: 'Test User',
        username: 'TestUser12345',
        email: 'test@example.com',
        createdAt: new Date(),
      },
    };

    jest.spyOn(findUsersService, 'findOne').mockResolvedValue(null);
    jest.spyOn(createUserService, 'execute').mockResolvedValue(userResponse);

    const result = await service.execute(userData);

    expect(result).toEqual(userResponse);
    expect(createUserService.execute).toHaveBeenCalledWith({
      name: userData.name,
      email: userData.email,
      username: expect.any(String),
      password: expect.any(String),
    });
  });

  it('should throw an error when unable to generate a unique username', async () => {
    const findData: UserInfo = {
      name: 'teste',
      username: expect.any(String),
      email: 'test@example.com',
      password: 'jbGHUI7869675%',
      createdAt: new Date(),
      id: '64feae0ad15e0c0e55a0b228',
    };
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
    };

    jest.spyOn(findUsersService, 'findOne').mockResolvedValue(findData);

    await expect(service.execute(userData)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });
});
