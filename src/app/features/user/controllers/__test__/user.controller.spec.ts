import { Test, TestingModule } from '@nestjs/testing';
import { CreateService } from '../../services/create.service';
import { DeleteService } from '../../services/delete.service';
import { FindUsersService } from '../../services/find.service';
import { UserController } from '../user.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Response } from 'express';
import { CreateUserDto } from '../dto/user-dto';
import { CreateUserRequest } from '../../services/models/user-models';
import { ProfileService } from '../../services/profile.service';
import { UserInfo } from '@src/app/auth/models/user-info';

describe('User controller', () => {
  let createService: CreateService,
    findUsersService: FindUsersService,
    profileService: ProfileService,
    controller: UserController;

  const createTestingModuleWithData = async (userData?: CreateUserRequest) => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        CreateService,
        FindUsersService,
        DeleteService,
        ProfileService,
        {
          provide: getModelToken('UserModel'),
          useValue: {
            create: jest.fn().mockResolvedValue(userData),
          },
        },
      ],
      controllers: [UserController],
    }).compile();

    controller = moduleRef.get<UserController>(UserController);
    createService = moduleRef.get<CreateService>(CreateService);
    findUsersService = moduleRef.get<FindUsersService>(FindUsersService);
    profileService = moduleRef.get<ProfileService>(ProfileService);
  };

  it('to be defined', async () => {
    await createTestingModuleWithData();

    expect(controller).toBeDefined();
    expect(createService).toBeDefined();
    expect(findUsersService).toBeDefined();
    expect(profileService).toBeDefined();
  });

  describe('create user', () => {
    it('sould return 201 created and a created user when valid data is provided', async () => {
      const dto: CreateUserDto = {
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
