import { Test, TestingModule } from '@nestjs/testing';
import { CreateService } from '../../services/create.service';
import { DeleteService } from '../../services/delete.service';
import { FindUser } from '../../util/find-user';
import { UserController } from '../user.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Response } from 'express';
import { CreateUpdateUserDto } from '../dto/create-dto';
import { CreateUserRequest } from '../../services/models/user-models';
import { ProfileService } from '../../services/profile.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UpdateService } from '../../services/update.service';
import { HashPassword } from '../../services/util/hash-password';
import { mockCacheManager } from '@src/app/common/constants/mock-cache';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('User controller', () => {
  let createService: CreateService,
    findUser: FindUser,
    profileService: ProfileService,
    controller: UserController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'users',
        }),
        EventEmitterModule.forRoot(),
      ],
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
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
      controllers: [UserController],
    }).compile();

    controller = moduleRef.get<UserController>(UserController);
    createService = moduleRef.get<CreateService>(CreateService);
    findUser = moduleRef.get<FindUser>(FindUser);
    profileService = moduleRef.get<ProfileService>(ProfileService);
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
      await controller.getProfile(user, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user });
    });
  });
});
