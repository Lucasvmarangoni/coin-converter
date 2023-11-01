import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { ConverterController } from '@src/app/modules/converter/http/controllers/converter.controller';
import { allRates } from '@src/app/modules/converter/domain/services/__test__/util/all-rates';
import { ExchangeratesService } from '@src/client/exchangerates.service';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockCacheManager } from '@src/app/common/constants/mock-cache';
import { ResponseData } from '@src/app/modules/converter/domain/services/interfaces/response';
import { ConverterService } from '@src/app/modules/converter/domain/services/converter.service';
import { DeleteService } from '@src/app/modules/converter/domain/services/delete.service';
import { FindAllService } from '@src/app/modules/converter/domain/services/find-all.service';

describe('converter controller', () => {
  let controller: ConverterController,
    converterService: ConverterService,
    findAllService: FindAllService;
  const { USD } = allRates;
  const mockExchangeratesService = { fetchConvert: jest.fn() };
  const mockTransactionModel = { create: jest.fn(), find: jest.fn() };

  interface ResponseDataWithoutID extends Omit<ResponseData, 'id'> {
    id?: string;
  }
  const expectedResponse: ResponseDataWithoutID = {
    from: 'EUR',
    amount: 10,
    to: ['USD'],
    rates: { USD },
    date: new Date('2023-07-21T21:45:25.272Z'),
    id: '60f9b0b5b54b4b0015f1b0a0',
    user: '1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ConverterController],
      providers: [
        ConverterService,
        FindAllService,
        DeleteService,
        { provide: ExchangeratesService, useValue: mockExchangeratesService },
        {
          provide: getModelToken('TransactionModel'),
          useValue: mockTransactionModel,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<ConverterController>(ConverterController);
    converterService = module.get<ConverterService>(ConverterService);
    findAllService = module.get<FindAllService>(FindAllService);
  });

  describe('convert', () => {
    it('should be defined', async () => {
      expect(controller).toBeDefined();
      expect(converterService).toBeDefined();
      expect(findAllService).toBeDefined();
    });

    it('should call service execute with params and return converter value', async () => {
      const params = { to: 'USD', amount: 10, from: 'EUR' };
      const mockApiResponse = { rates: { USD: 0.85 } };
      const req = {
        user: jest.fn().mockReturnThis(),
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockExchangeratesService.fetchConvert.mockResolvedValue(mockApiResponse);
      mockTransactionModel.create.mockResolvedValue(expectedResponse);

      await controller.converter(params, req as unknown as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe('listAll', () => {
    it('should call service findAll and return all transactions', async () => {
      const responseDataArray = [
        expectedResponse,
        expectedResponse,
        expectedResponse,
        expectedResponse,
      ];
      const req = {
        user: jest.fn().mockReturnThis(),
      };
      mockTransactionModel.create.mockResolvedValue(responseDataArray);
      mockTransactionModel.find.mockResolvedValue(responseDataArray);
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      await controller.listAll(req as unknown as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(responseDataArray);
    });
  });
});
