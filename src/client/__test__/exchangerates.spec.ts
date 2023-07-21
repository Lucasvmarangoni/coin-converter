import { ConfigService } from '@nestjs/config';
import {
    ClientRequestError,
    ExchangeRatesResponse,
    ExchangeratesService,
    acceptedCurrencies,
    sourceCurrenciesAccepted,
} from '../exchangerates.service';
import { Test } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AppConfigModule } from '@src/config.module';
import { of } from 'rxjs';

describe('Exchangerates client', () => {
    let exchangeratesService: ExchangeratesService;
    let httpService: HttpService;

    const sourceCurrency = 'EUR';

    jest.mock('@nestjs/axios', () => ({
        HttpModule: {
            register: jest.fn(),
        },
        HttpService: jest.fn(() => ({
            get: jest.fn(),
        })),
    }));

    const createTestingModuleWithData = async (exchangeRatesResponse?: Partial<ExchangeRatesResponse>) => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                HttpModule,
                AppConfigModule
            ],
            providers: [
                ExchangeratesService,
                ConfigService,
                {
                    provide: HttpService,
                    useValue: {
                        get: jest.fn().mockReturnValue(of({ data: exchangeRatesResponse })),
                    },
                },
            ]
        }).compile();

        httpService = moduleRef.get<HttpService>(HttpService)
        exchangeratesService = moduleRef.get<ExchangeratesService>(ExchangeratesService);

        return moduleRef;
    };

    it('should return the normalized response from the ExchangeRates service.', async () => {

        const exchangeRatesResponse = {
            "success": true,
            "timestamp": 1686621843,
            "base": "EUR",
            "date": "2023-06-13",
            "rates": {
                "USD": 3.955097,
                "BRL": 92.349891,
                "JPY": 106.328178,
                "AMD": 628.982
            }
        }
        await createTestingModuleWithData(exchangeRatesResponse);

        const response = await exchangeratesService.fetchConvert(
            sourceCurrency
        );
        expect(response).toEqual(exchangeRatesResponse);
    });


    it('should return the ClientRequestError for an invalid response.', async () => {

        const exchangeRatesResponse = {

            "base": "EUR",
            "date": "2023-06-13",
            "rates": {
                "USD": 3.955097,
                "BRL": 92.349891,
                "JPY": 106.328178,
                "AMD": 628.982
            }
        }
        await createTestingModuleWithData(exchangeRatesResponse);

        const response = exchangeratesService.fetchConvert(
            sourceCurrency,         
        );
        expect(response).rejects.toThrow(ClientRequestError);
    });

    // !! Do not break lines in the exception strings. (toThrow)

    it('should return the ExchangeratesInvalidInputError when an invalid currency is provided', async () => {
        const invalidSourceCurrency = 'BRL';
        await createTestingModuleWithData();

        const response = exchangeratesService.fetchConvert(
            invalidSourceCurrency           
        );

        await expect(response).rejects.toThrow(
            `At the moment, it is only possible to perform conversions based on the ${sourceCurrenciesAccepted.join(
                ',',
            )} currency.`,
        );
    });

    it('should return the ExchangeratesInvalidInputError when an invalid source currency type is provided', async () => {
        const invalidSourceCurrency = '';
        await createTestingModuleWithData();

        const response = exchangeratesService.fetchConvert(
            invalidSourceCurrency,        
        );

        await expect(response).rejects.toThrow(
            `${acceptedCurrencies} Invalid source currency. It must be a non-empty string.`,
        );
    });
   
});

