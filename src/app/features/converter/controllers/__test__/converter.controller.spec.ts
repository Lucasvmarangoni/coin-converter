import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ConverterController } from '../converter.controller';
import { allRates } from '../../services/__test__/util/all-rates';
import {
  ConverterService,
  ResponseData,
} from '../../services/converter.service';
import { FindAllService } from '../../services/find-all.service';
import { AppClientModule } from '@src/client/client.module';
import { ExchangeratesService } from '@src/client/exchangerates.service';
import { getModelToken } from '@nestjs/mongoose';

describe('converter controller', () => {
  let controller: ConverterController,
    converterService: ConverterService,
    findAllService: FindAllService;
  const { USD, EUR, BRL, AMD } = allRates;

  interface ResponseDataWithoutID extends Omit<ResponseData, 'id'> {
    id?: string;
  }
  const responseData: ResponseDataWithoutID = {
    from: 'EUR',
    amount: 10,
    to: ['USD'],
    rates: { USD },
    date: new Date('2023-07-21T21:45:25.272Z'),
    id: '60f9b0b5b54b4b0015f1b0a0',
  };

  class ExchangeratesServiceMock {
    async fetchConvert(base: string): Promise<any> {
      return {
        rates: allRates,
      };
    }
  }

  const createTestingModuleWithData = async (
    responseData?: ResponseData | ResponseData[],
  ) => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppClientModule],
      controllers: [ConverterController],
      providers: [
        ConverterService,
        {
          provide: FindAllService,
          useValue: {
            execute: jest.fn().mockResolvedValue(responseData),
          },
        },
        {
          provide: getModelToken('TransactionModel'),
          useValue: {
            create: jest.fn().mockResolvedValue(responseData),
          },
        },
      ],
    })
      .overrideProvider(ExchangeratesService)
      .useClass(ExchangeratesServiceMock)
      .compile();

    controller = moduleRef.get<ConverterController>(ConverterController);
    converterService = moduleRef.get<ConverterService>(ConverterService);
    findAllService = moduleRef.get<FindAllService>(FindAllService);
  };

  describe('convert', () => {
    it('should be defined', async () => {
      await createTestingModuleWithData();

      expect(controller).toBeDefined();
      expect(converterService).toBeDefined();
      expect(findAllService).toBeDefined();
    });

    it('should call service execute with params and return converter value', async () => {
      const params = { to: 'USD', amount: 10, from: 'EUR' };
      await createTestingModuleWithData(responseData);
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await controller.converter(params, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(responseData);
    });

    it('should call service execute with params and return converter value', async () => {
      const params = { to: '', amount: 10, from: 'EUR' };
      await createTestingModuleWithData();
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await controller.converter(params, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        cause: "Valid currency 'to' converter is required",
        code: 400,
        error: 'BAD_REQUEST',
        message:
          "You need to provide a valid Valid 'currency ISO code' in to param.",
      });
    });
  });

  describe('listAll', () => {
    it('should call service findAll and return all transactions', async () => {
      const responseDataArray = [
        responseData,
        responseData,
        responseData,
        responseData,
      ];
      await createTestingModuleWithData(responseDataArray);

      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      await controller.listAll(res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(responseDataArray);
    });
  });
});
