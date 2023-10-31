import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { UpdateService } from '@src/app/modules/user/services/update.service';
import { HashPassword } from '@src/app/modules/user/services/util/hash-password';
import { Cache } from 'cache-manager';
import { UserInfo } from '@src/app/common/models/user-info';
import { mockCacheManager } from '@src/app/common/constants/mock-cache';

describe('UpdateService', () => {
  let service: UpdateService;
  let findUser: FindUser;
  let cacheManager: Cache;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateService,
        {
          provide: getModelToken('UserModel'),
          useValue: {
            updateOne: jest.fn(),
          },
        },
        {
          provide: FindUser,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: HashPassword,
          useValue: {
            hash: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<UpdateService>(UpdateService);
    findUser = module.get<FindUser>(FindUser);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    userModel = module.get<Model<User>>(getModelToken('UserModel'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(findUser).toBeDefined();
    expect(cacheManager).toBeDefined();
    expect(userModel).toBeDefined();
  });

  it('should update user', async () => {
    const user: UserInfo = {
      id: '1',
      name: 'Test',
      username: 'test',
      email: 'test@test.com',
      password: 'password',
      createdAt: new Date('2023-09-12T11:15:15.662Z'),
    };

    jest.spyOn(findUser, 'findOne').mockResolvedValue(user);

    const result = await service.execute('test@test.com', {
      name: 'Updated',
      username: 'updated',
      email: 'updated@test.com',
      password: 'updatedPassword',
    });

    expect(result).toEqual({
      user: {
        ...result?.user,
        password: undefined,
        createdAt: user.createdAt,
      },
    });
  });

  it('should update user with partial data', async () => {
    const user: UserInfo = {
      id: '1',
      name: 'Test',
      username: 'test',
      email: 'test@test.com',
      password: 'password',
      createdAt: new Date('2023-09-12T11:15:15.662Z'),
    };

    jest.spyOn(findUser, 'findOne').mockResolvedValue(user);
    jest.spyOn(userModel, 'updateOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue({ nModified: 1 }),
    } as any);
    jest.spyOn(cacheManager, 'set').mockResolvedValue();

    const result = await service.execute('test@test.com', {
      name: 'Updated',
      email: 'updated@test.com',
      password: undefined,
    });

    expect(result).toEqual({
      user: {
        ...result?.user,
        username: user.username,
        password: undefined,
        createdAt: user.createdAt,
      },
    });
  });
});
