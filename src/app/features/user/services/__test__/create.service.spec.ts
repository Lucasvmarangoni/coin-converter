import { getModelToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { CreateUserService, UserProps } from '../create.service';

describe('User create service', () => {
  let createUserService: CreateUserService;

  const responseData = {
    name: 'John Doe',
    username: 'JohnDoe',
    email: 'john@gmail.com',
    password: 'asHaf#as231',
    createdAt: new Date(),
  };

  const createTestingModuleWithData = async (responseData?: UserProps) => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: getModelToken('UserModel'),
          useValue: {
            create: jest.fn().mockResolvedValue(responseData),
          },
        },
      ],
    }).compile();

    createUserService = moduleRef.get<CreateUserService>(CreateUserService);
  };

  it('should be defined', async () => {
    await createTestingModuleWithData();
    expect(createUserService).toBeDefined();
  });

  it('should call create with params and return user', async () => {
    await createTestingModuleWithData(responseData);

    const params = {
      name: 'John Doe',
      username: 'JohnDoe',
      email: 'john@gmail.com',
      password: 'asHaf#as231',
    };
    const response = await createUserService.execute(params);

    expect(createUserService).toBeInstanceOf(CreateUserService);
    expect(response).toEqual({
      user: {
        ...responseData,
        password: undefined,
        createdAt: expect.any(Date),
      },
    });
  });
});
