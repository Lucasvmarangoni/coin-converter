import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { UpdateService } from '@src/app/modules/user/domain/services/update.service';
import { HashPassword } from '@src/app/modules/user/domain/services/util/hash-password';
import { Cache } from 'cache-manager';
import { UserInfo } from '@src/app/common/interfaces/user-info';
import { mockCacheManager } from '@src/app/common/constants/mock-cache';
import { getQueueToken } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { UserUpdatedEvent } from '@src/app/common/events/user-updated-event';

describe('UpdateService', () => {
  let service: UpdateService,
    findUser: FindUser,
    cacheManager: Cache,
    hashPassword: HashPassword,
    usersQueue: Queue;

  const eventEmitterMock = {
    once: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    usersQueue = {
      add: jest.fn(),
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateService,
        { provide: EventEmitter2, useValue: eventEmitterMock },
        {
          provide: getQueueToken('users'),
          useValue: usersQueue,
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
        HashPassword,
      ],
    }).compile();

    service = module.get<UpdateService>(UpdateService);
    findUser = module.get<FindUser>(FindUser);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    hashPassword = module.get<HashPassword>(HashPassword);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(findUser).toBeDefined();
    expect(cacheManager).toBeDefined();
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
    jest.spyOn(usersQueue, 'add').mockResolvedValue(null as any);
    eventEmitterMock.once.mockImplementation((event, callback) => {
      if (event === 'user.updated') {
        callback();
      }
    });
    jest.spyOn(hashPassword, 'hash').mockResolvedValue('hashedpassword');

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
    expect(hashPassword.hash).toHaveBeenCalledWith('updatedPassword');
    expect(usersQueue.add).toHaveBeenCalledWith(
      'user.updating',
      expect.any(UserUpdatedEvent)
    );
    expect(eventEmitterMock.once).toHaveBeenCalledWith(
      'user.updated',
      expect.any(Function)
    );
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
