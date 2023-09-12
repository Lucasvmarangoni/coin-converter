import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateService } from '../create.service';
import { HashPassword } from '../util/hash-password';

describe('CreateService', () => {
  let service: CreateService;
  let userModel: Model<User>;
  let hashPassword: HashPassword;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateService,
        {
          provide: getModelToken('UserModel'),
          useValue: {
            create: jest.fn(),
          },
        },
        HashPassword,
      ],
    }).compile();

    service = module.get<CreateService>(CreateService);
    userModel = module.get<Model<User>>(getModelToken('UserModel'));
    hashPassword = module.get<HashPassword>(HashPassword);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const req = {
      email: 'test@test.com',
      name: 'Test User',
      username: 'testuser',
      password: 'password',
    };

    jest.spyOn(hashPassword, 'hash').mockResolvedValue('hashedpassword');
    jest.spyOn(userModel, 'create').mockResolvedValue(req as any);

    const result = await service.execute(req);

    expect(result).toEqual({
      user: { ...req, password: undefined, createdAt: expect.any(Date) },
    });
    expect(hashPassword.hash).toHaveBeenCalledWith(req.password);
    expect(userModel.create).toHaveBeenCalledWith({
      ...req,
      password: 'hashedpassword',
      createdAt: expect.any(Date),
    });
  });

  it('should throw BadRequestException when user already exists', async () => {
    const req = {
      email: 'test@test.com',
      name: 'Test User',
      username: 'testuser',
      password: 'password',
    };

    jest.spyOn(hashPassword, 'hash').mockResolvedValue('hashedpassword');
    jest
      .spyOn(userModel, 'create')
      .mockRejectedValue({ message: 'duplicate key' });

    await expect(service.execute(req)).rejects.toThrow(BadRequestException);
    expect(hashPassword.hash).toHaveBeenCalledWith(req.password);
    expect(userModel.create).toHaveBeenCalledWith({
      ...req,
      password: 'hashedpassword',
      createdAt: expect.any(Date),
    });
  });
});
