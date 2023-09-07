import { getModelToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { CreateService, UserProps } from '../create.service';

describe('User create service', () => {
  let createService: CreateService;

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
        CreateService,
        {
          provide: getModelToken('UserModel'),
          useValue: {
            create: jest.fn().mockResolvedValue(responseData),
          },
        },
      ],
    }).compile();

    createService = moduleRef.get<CreateService>(CreateService);
  };

  it('should be defined', async () => {
    await createTestingModuleWithData();
    expect(createService).toBeDefined();
  });

  it('should call create with params and return user', async () => {
    await createTestingModuleWithData(responseData);

    const params = {
      name: 'John Doe',
      username: 'JohnDoe',
      email: 'john@gmail.com',
      password: 'asHaf#as231',
    };
    const response = await createService.execute(params);

    expect(createService).toBeInstanceOf(CreateService);
    expect(response).toEqual({
      user: {
        ...responseData,
        password: undefined,
        createdAt: expect.any(Date),
      },
    });
  });
});
