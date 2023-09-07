import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeratesService } from '@src/client/exchangerates.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { ConverterService } from '../converter.service';

describe('ConverterService', () => {
  let service: ConverterService;
  const mockExchangeratesService = { fetchConvert: jest.fn() };
  const mockTransactionModel = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConverterService,
        { provide: ExchangeratesService, useValue: mockExchangeratesService },
        {
          provide: getModelToken('TransactionModel'),
          useValue: mockTransactionModel,
        },
      ],
    }).compile();

    service = module.get<ConverterService>(ConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException with correct message if "to" parameter is invalid', async () => {
    const req = { to: '123', amount: 100, from: 'USD', user: 'testUser' };
    await expect(service.execute(req)).rejects.toThrow(
      new BadRequestException(
        `You provide an invalid value for the 'to' parameter`,
        {
          cause: new Error(),
          description: `You need to provide a valid 'currency ISO code' in to param.`,
        },
      ),
    );
  });

  it('should throw BadRequestException with correct message if "from" parameter is invalid', async () => {
    const req = { to: 'EUR', amount: 100, from: '123', user: 'testUser' };
    await expect(service.execute(req)).rejects.toThrow(
      new BadRequestException(
        `You provide an invalid value for the 'from' parameter`,
        {
          cause: new Error(),
          description: `You need to provide a valid 'currency ISO code' in to param or leave it undefined to use the default value.`,
        },
      ),
    );
  });

  it('should throw BadRequestException with correct message if "amount" parameter is invalid', async () => {
    const req = {
      to: 'EUR',
      amount: Number('abc'),
      from: 'USD',
      user: 'testUser',
    };
    await expect(service.execute(req)).rejects.toThrow(
      new BadRequestException(
        `You provide an invalide 'amount' value to converter parameter`,
        {
          cause: new Error(),
          description: `You must provide a valid 'amount' in numeric format and Number type for the conversion.`,
        },
      ),
    );
  });

  it('should return a transaction data if all parameters are valid', async () => {
    const req = { to: 'EUR', amount: 100, from: 'USD', user: 'testUser' };
    const mockApiResponse = { rates: { EUR: 0.85 } };
    const expectedResponse = {
      from: 'USD',
      amount: 100,
      to: ['EUR'],
      rates: { EUR: 85 },
      date: expect.any(Date),
      user: 'testUser',
    };
    mockExchangeratesService.fetchConvert.mockResolvedValue(mockApiResponse);
    mockTransactionModel.create.mockResolvedValue(expectedResponse);

    const result = await service.execute(req);
    expect(result).toEqual(expectedResponse);
  });
});
