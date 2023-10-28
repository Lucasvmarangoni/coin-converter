import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { FindAllService } from '@src/app/modules/converter/services/find-all.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockCacheManager } from '@src/app/common/constants/mock-cache';

describe('Find all transactions testining', () => {
  let findAllService: FindAllService;
  const database = [
    {
      user: '64e92312c74a2b4749bd2cf3',
      from: 'EUR',
      amount: 10,
      to: ['USD'],
      rates: {
        USD: 1.2,
      },
      date: expect.any(Date),
      id: expect.any(String),
    },
    {
      user: '64e92312c74a2b4749bd2cf3',
      from: 'EUR',
      amount: 10,
      to: ['USD'],
      rates: {
        USD: 1.3,
      },
      date: expect.any(Date),
      id: expect.any(String),
    },
    {
      user: 'other-id',
      from: 'EUR',
      amount: 10,
      to: ['USD'],
      rates: {
        USD: 1.3,
      },
      date: expect.any(Date),
      id: expect.any(String),
    },
  ];

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllService,
        {
          provide: getModelToken('TransactionModel'),
          useValue: {
            find: jest.fn().mockImplementation((query) => {
              const user = query.user;
              const filteredTransactions = database.filter(
                (transaction) => transaction.user === user
              );
              return Promise.resolve(filteredTransactions);
            }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    findAllService = moduleRef.get<FindAllService>(FindAllService);
  });

  it('Sould be defined', () => {
    expect(findAllService).toBeDefined();
  });

  it('Should call service execute and return all transactions', async () => {
    const user = { id: '64e92312c74a2b4749bd2cf3', email: 'john@gmail.com' };
    const response = await findAllService.execute(user.id, user.email);

    expect(response[0]).toEqual(database[0]);
    expect(response).toHaveLength(2);
  });
});
