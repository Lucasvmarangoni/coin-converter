import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserService } from '../../services/create.service';
import { DeleteAllUsersService } from '../../services/delete.service';
import { FindUsersService } from '../../../../auth/find.service';
import { UserController } from '../user.controller';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserRequest } from '../../services/create.service';
import { Response } from 'express';
import { LoginValidationMiddleware } from '@src/app/auth/middlewares/login-validation.middleware';
import { CreateUserDto } from '../dto/user-dto';

describe('User controller', () => {
  let createUserService: CreateUserService,
    findUsersService: FindUsersService,
    controller: UserController;

  const createTestingModuleWithData = async (userData?: CreateUserRequest) => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        CreateUserService,
        FindUsersService,
        DeleteAllUsersService,
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
    createUserService = moduleRef.get<CreateUserService>(CreateUserService);
    findUsersService = moduleRef.get<FindUsersService>(FindUsersService);
  };

  it('to be defined', async () => {
    await createTestingModuleWithData();

    expect(controller).toBeDefined();
    expect(createUserService).toBeDefined();
    expect(findUsersService).toBeDefined();
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

      jest.spyOn(createUserService, 'execute').mockResolvedValue({ user });
      await controller.create(dto, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(user);
    });
  });
});
