import { Test, TestingModule } from '@nestjs/testing';
import { CreateService } from '@src/app/modules/user/services/create.service';
import { DeleteService } from '@src/app/modules/user/services/delete.service';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { UserController } from '@src/app/modules/user/controllers/user.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { CreateUpdateUserDto } from '@src/app/modules/user/controllers/dto/create-dto';
import { ProfileService } from '@src/app/modules/user/services/profile.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UpdateService } from '@src/app/modules/user/services/update.service';
import { HashPassword } from '@src/app/modules/user/services/util/hash-password';
import { mockCacheManager } from '@src/app/common/constants/mock-cache';
import { getQueueToken } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('User controller', () => {
  let createService: CreateService,
    findUser: FindUser,
    profileService: ProfileService,
    controller: UserController;

  const usersQueue = {
    add: jest.fn(),
  } as any;

  const eventEmitterMock = {
    once: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [
      //   BullModule.registerQueue({
      //     name: 'users',
      //   }),
      //   EventEmitterModule.forRoot(),
      // ],
      providers: [
        CreateService,
        FindUser,
        DeleteService,
        ProfileService,
        UpdateService,
        HashPassword,
        {
          provide: getModelToken('UserModel'),
          useValue: {
            create: jest.fn(),
          },
        },
        { provide: EventEmitter2, useValue: eventEmitterMock },
        {
          provide: getQueueToken('users'),
          useValue: usersQueue,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
    createService = module.get<CreateService>(CreateService);
    findUser = module.get<FindUser>(FindUser);
    profileService = module.get<ProfileService>(ProfileService);
  });

  it('to be defined', async () => {
    expect(controller).toBeDefined();
    expect(createService).toBeDefined();
    expect(findUser).toBeDefined();
    expect(profileService).toBeDefined();
  });

  describe('create user', () => {
    it('sould return 201 created and a created user when valid data is provided', async () => {
      const dto: CreateUpdateUserDto = {
        name: 'john doe',
        username: 'john',
        email: 'john@gmail.com',
        password: 'asHaf#as231',
      };
      const user = {
        name: 'john doe',
        username: 'john',
        email: 'john@gmail.com',
        createdAt: new Date('2023-09-05T05:04:57.686Z'),
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.spyOn(createService, 'execute').mockResolvedValue({ user });
      await controller.create(dto, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(user);
    });
  });

  describe('find user', () => {
    it('sould return 200 OK when authorized user is provided', async () => {
      const user = {
        name: 'john doe',
        username: 'john',
        email: 'john@gmail.com',
        createdAt: new Date('2023-09-05T05:04:57.686Z'),
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.spyOn(profileService, 'execute').mockResolvedValue({ user });
      await controller.getProfile(user as unknown as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user });
    });
  });
});
