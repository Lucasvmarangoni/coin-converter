import { Test, TestingModule } from "@nestjs/testing";
import { ConvertService, ResponseData } from "../convert";
import { Transactions } from "@src/app/models/transactions";
import { ExchangeratesService } from "@src/client/exchangerates.service";
import { getModelToken } from "@nestjs/mongoose";
import { allRates } from "./util/all-rates";

describe('Convert Service', () => {

    let convertService: ConvertService
    const { USD, EUR, BRL, AMD } = allRates

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
    }
    class ExchangeratesServiceMock {
        async fetchConvert(base: string): Promise<any> {
            return {
                rates: allRates
            };
        }
    }
    const createTestingModuleWithData = async (create?: ResponseData) => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                ConvertService,
                {
                    provide: getModelToken(Transactions.name),
                    useValue: {
                        create: jest.fn().mockResolvedValue(create),
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

        convertService = moduleRef.get<ConvertService>(ConvertService);
        return moduleRef;
    }

    it('Should return the converted value when a valid currency is provided', async () => {

        const params = {
            to: 'USD',
            amount: 10,
            from: 'EUR'
        }
        await createTestingModuleWithData(responseData);
        const response = await convertService.execute(params);

        expect(convertService).toBeDefined();
        expect(convertService).toBeInstanceOf(ConvertService);
        expect(response).toEqual({
            "from": "EUR",
            "amount": 10,
            "to": [
                "USD"
            ],
            "rates": {
                USD,
            },
            "date": expect.any(Date),
            "id": expect.any(String),
        });
    })

    it('Should return the converted value when a valid currency is provided with an empty from parameter', async () => {

        const params = {
            to: 'USD',
            amount: 10,
            from: ''
        }
        await createTestingModuleWithData(responseData);
        const response = await convertService.execute(params);

        expect(convertService).toBeDefined();
        expect(convertService).toBeInstanceOf(ConvertService);
        expect(response).toEqual({
            "from": "EUR",
            "amount": 10,
            "to": [
                "USD"
            ],
            "rates": {
                USD,
            },
            "date": expect.any(Date),
            "id": expect.any(String),
        });
    })

    it('Should return the converted value when a valid currencies is provided', async () => {

        const params = {
            to: 'USD,BRL,AMD',
            amount: 10,
            from: '',
        }
        responseData = {
            ...responseData,
            to: ['USD', 'BRL', 'AMD'],
            rates: { USD, BRL, AMD }
        };
        await createTestingModuleWithData(responseData);
        const response = await convertService.execute(params);

        expect(convertService).toBeDefined();
        expect(convertService).toBeInstanceOf(ConvertService);
        expect(response).toEqual({
            "from": "EUR",
            "amount": 10,
            "to": [
                "USD",
                "BRL",
                "AMD"
            ],
            "rates": {
                USD,
                BRL,
                AMD,
            },
            "date": expect.any(Date),
            "id": expect.any(String),
        });
    })

    it('Should return the converted value when a valid currencies is provided with not default base currency', async () => {

        const params = {
            to: 'USD,AMD',
            amount: 10,
            from: 'BRL',
        }

        responseData = {
            ...responseData,
            from: 'BRL',
            to: ['USD', 'AMD'],
            rates: { USD, AMD },
        }
        await createTestingModuleWithData(responseData);
        const response = await convertService.execute(params);

        expect(convertService).toBeDefined();
        expect(convertService).toBeInstanceOf(ConvertService);
        expect(response).toEqual({
            "from": "BRL",
            "amount": 10,
            "to": [
                "USD",
                "AMD"
            ],
            "rates": {
                USD,
                AMD,
            },
            "date": expect.any(Date),
            "id": expect.any(String),
        });
    })

    it('Should return erro "Currency to convert is required" when not provide or invalid value in "to" param', async () => {

        const params = {
            to: '',
            amount: 10,
            from: 'BRL',
        }
        await createTestingModuleWithData();
       
        await expect(
            new Promise((resolve, reject) => {
                convertService.execute(params).then(resolve).catch(reject);
            })
          ).rejects.toThrow(new Error('Currency "to" convert is required'));
    })

    it('Should return erro "Currency to convert is required" when not provide or invalid value in "amount" param', async () => {

        const params = {
            to: 'USD',
            amount: Number('xx'),
            from: 'BRL',
        }
        await createTestingModuleWithData();
       
        await expect(
            new Promise((resolve, reject) => {
                convertService.execute(params).then(resolve).catch(reject);
            })
          ).rejects.toThrow(new Error('"Amount" to convert is required'));
    })
});