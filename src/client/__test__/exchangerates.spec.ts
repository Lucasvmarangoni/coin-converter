import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ClientRequestError } from '../err/client-request-error';
import { ExchangeratesResponseError } from '../err/response-error';
import { ExchangeratesService, ExchangeRatesResponse } from '../exchangerates.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockCacheManager } from '@src/app/common/constants/mock-cache';

describe('ExchangeratesService', () => {
  let service: ExchangeratesService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeratesService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ExchangeratesService>(ExchangeratesService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchConvert', () => {
    it('should throw an error if the response from the API is not valid', async () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce({
        url: 'http://api.exchangeratesapi.io/v1/latest?base=',
        key: 'testKey',
      });
      const mockAxiosResponse: AxiosResponse = {
        data: { success: false },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: undefined,
      };
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockAxiosResponse));

      await expect(service.fetchConvert('EUR')).rejects.toThrow(
        ExchangeratesResponseError
      );
    });

    it('should return the response from the API if it is valid', async () => {
      const mockResponse: ExchangeRatesResponse = {
        success: true,
        timestamp: 1633027206,
        base: 'EUR',
        date: '2021-09-30',
        rates: { USD: 1.16 },
      };
      jest.spyOn(configService, 'get').mockReturnValueOnce({
        url: 'http://api.exchangeratesapi.io/v1/latest?base=',
        key: 'testKey',
      });
      const mockAxiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: undefined,
      };
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockAxiosResponse));

      const result = await service.fetchConvert('EUR');

      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the request to the API fails', async () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce({
        url: 'http://api.exchangeratesapi.io/v1/latest?base=',
        key: 'testKey',
      });
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new Error('Request failed');
      });

      await expect(service.fetchConvert('EUR')).rejects.toThrow(ClientRequestError);
    });
  });
});
