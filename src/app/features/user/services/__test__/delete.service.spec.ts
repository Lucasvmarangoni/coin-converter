import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';
import { DeleteService } from '../delete.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockCacheManager } from '@src/util/mock-cache';

describe('DeleteService', () => {
  let service: DeleteService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteService,
        {
          provide: getModelToken('UserModel'),
          useValue: {
            deleteOne: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<DeleteService>(DeleteService);
    userModel = module.get<Model<User>>(getModelToken('UserModel'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete a user', async () => {
    const user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    };
    await service.execute(user as User);

    expect(userModel.deleteOne).toHaveBeenCalledWith({ id: user.id });
  });
});
