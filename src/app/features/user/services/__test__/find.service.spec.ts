import { getModelToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { FindUsersService } from '../find.service';
import { UserInfo } from '@src/app/auth/models/user-info';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockCacheManager } from '@src/util/mock-cache';

describe('User create service', () => {
  let findUsersService: FindUsersService;

  const responseData = {
    id: '64dfe5b66045b01ec3844b24',
    name: 'teste',
    username: '1teste',
    email: 'johna@gmail.com',
    password: '$2b$10$XdgOTKfhhgwCNdrcKXe3AeirZzrYugqmsNjQ.h3X1fU0EOnWOqvr.',
    createdAt: new Date(),
  };

  const createTestingModuleWithData = async (
    responseData?: UserInfo | undefined,
  ) => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindUsersService,
        {
          provide: getModelToken('UserModel'),
          useValue: {
            findOne: jest.fn().mockResolvedValue(responseData),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    findUsersService = moduleRef.get<FindUsersService>(FindUsersService);
  };

  it('should be defined', async () => {
    await createTestingModuleWithData();
    expect(findUsersService).toBeDefined();
  });

  it('should call create with params and return user', async () => {
    await createTestingModuleWithData(responseData);

    const param = 'JohnDoe';
    const response = await findUsersService.findOne(param);

    expect(findUsersService).toBeInstanceOf(FindUsersService);
    expect(response).toEqual(responseData);
  });
});
