import { Test, TestingModule } from '@nestjs/testing';
import { ConverterService, ResponseData } from '../converter.service';
import { ExchangeratesService } from '@src/client/exchangerates.service';
import { getModelToken } from '@nestjs/mongoose';
import { allRates } from './util/all-rates';

describe('Convert Service', () => {
  let converterService: ConverterService;
  const { USD, EUR, BRL, AMD } = allRates;

  interface ResponseDataWithoutID extends Omit<ResponseData, 'id'> {
    id?: string;
  }
  let responseData: ResponseDataWithoutID = {
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
  const createTestingModuleWithData = async (responseData?: ResponseData) => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ConverterService,
        {
          provide: getModelToken('TransactionModel'),
          useValue: {
            create: jest.fn().mockResolvedValue(responseData),
          },
        },
        {
          provide: ExchangeratesService,
          useClass: ExchangeratesServiceMock,
          useValue: {
            fetchConvert: jest.fn().mockResolvedValue('EUR'),
          },
        },
      ],
    }).compile();

    converterService = moduleRef.get<ConverterService>(ConverterService);
    return moduleRef;
  };

  it('Should return the converter value when a valid currency is provided', async () => {
    const params = {
      to: 'USD',
      amount: 10,
      from: 'EUR',
      user: '60f9b0b5b54b4b0015f1b0a0',
    };
    await createTestingModuleWithData(responseData);
    const response = await converterService.execute(params);

    expect(converterService).toBeDefined();
    expect(converterService).toBeInstanceOf(ConverterService);
    expect(response).toEqual({
      from: 'EUR',
      amount: 10,
      to: ['USD'],
      rates: {
        USD,
      },
      date: expect.any(Date),
      id: expect.any(String),
    });
  });

  it('Should return the converter value when a valid currency is provided with an empty from parameter', async () => {
    const params = {
      to: 'USD',
      amount: 10,
      from: '',
      user: '60f9b0b5b54b4b0015f1b0a0',
    };
    await createTestingModuleWithData(responseData);
    const response = await converterService.execute(params);

    expect(converterService).toBeDefined();
    expect(converterService).toBeInstanceOf(ConverterService);
    expect(response).toEqual({
      from: 'EUR',
      amount: 10,
      to: ['USD'],
      rates: {
        USD,
      },
      date: expect.any(Date),
      id: expect.any(String),
    });
  });

  it('Should return the converter value when a valid currencies is provided', async () => {
    const params = {
      to: 'USD,BRL,AMD',
      amount: 10,
      from: '',
      user: '60f9b0b5b54b4b0015f1b0a0',
    };
    responseData = {
      ...responseData,
      to: ['USD', 'BRL', 'AMD'],
      rates: { USD, BRL, AMD },
    };
    await createTestingModuleWithData(responseData);
    const response = await converterService.execute(params);

    expect(converterService).toBeDefined();
    expect(converterService).toBeInstanceOf(ConverterService);
    expect(response).toEqual({
      from: 'EUR',
      amount: 10,
      to: ['USD', 'BRL', 'AMD'],
      rates: {
        USD,
        BRL,
        AMD,
      },
      date: expect.any(Date),
      id: expect.any(String),
    });
  });

  it('Should return the converter value when a valid currencies is provided with not default base currency', async () => {
    const params = {
      to: 'USD,AMD',
      amount: 10,
      from: 'BRL',
      user: '60f9b0b5b54b4b0015f1b0a0',
    };

    responseData = {
      ...responseData,
      from: 'BRL',
      to: ['USD', 'AMD'],
      rates: { USD, AMD },
    };
    await createTestingModuleWithData(responseData);
    const response = await converterService.execute(params);

    expect(converterService).toBeDefined();
    expect(converterService).toBeInstanceOf(ConverterService);
    expect(response).toEqual({
      from: 'BRL',
      amount: 10,
      to: ['USD', 'AMD'],
      rates: {
        USD,
        AMD,
      },
      date: expect.any(Date),
      id: expect.any(String),
    });
  });

  it('Should return erro "Currency to converter is required" when not provide or invalid value in "to" param', async () => {
    const params = {
      to: '',
      amount: 10,
      from: 'BRL',
      user: '60f9b0b5b54b4b0015f1b0a0',
    };
    await createTestingModuleWithData();

    await expect(
      new Promise((resolve, reject) => {
        converterService.execute(params).then(resolve).catch(reject);
      }),
    ).rejects.toThrow(new Error(`Currency 'to' converter is required`));
  });

  it('Should return erro "Currency to converter is required" when not provide or invalid value in "amount" param', async () => {
    const params = {
      to: 'USD',
      amount: Number('xx'),
      from: 'BRL',
      user: '60f9b0b5b54b4b0015f1b0a0',
    };
    await createTestingModuleWithData();

    await expect(
      new Promise((resolve, reject) => {
        converterService.execute(params).then(resolve).catch(reject);
      }),
    ).rejects.toThrow(new Error(`'Amount' to converter is required`));
  });
});
