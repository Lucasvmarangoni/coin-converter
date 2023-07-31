import { Test, TestingModule } from '@nestjs/testing';
import { ConverterService, ResponseData } from '@src/app/services/converter';
import { ConverterController } from '../converter-controller';
import { allRates } from '@src/app/services/__test__/util/all-rates';
import { AppClientModule } from '@src/client/client.module';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Transactions } from '@src/app/models/transactions';
import { FindAllService } from '@src/app/services/find-all';
import { ExchangeratesService } from '@src/client/exchangerates.service';
import { Response } from 'express';

describe('ConverterController', () => {
    let converterController: ConverterController;
    let converterService: ConverterService;
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

    const createTestingModuleWithData = async (responseData?: ResponseData) => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [
                AppClientModule,
                MongooseModule.forFeature()
            ],
            controllers: [ConverterController],
            providers: [
                ConverterService,
                {
                    provide: getModelToken(Transactions.name),
                    useValue: {
                        create: jest.fn().mockResolvedValue(responseData),
                    },
                },
                FindAllService,
            ],
        }).overrideProvider(ExchangeratesService).useClass(ExchangeratesServiceMock).compile();

        converterController = moduleRef.get<ConverterController>(ConverterController);
        converterService = moduleRef.get<ConverterService>(ConverterService);
        return moduleRef;
    };


    it('should call service execute with params and return converter value', async () => {

        const params = { to: 'USD', amount: 10, from: 'EUR' };
        await createTestingModuleWithData(responseData);
        let req = undefined
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        }

        await converterController.converter(params, req, res as Response);

        expect(converterController).toBeDefined();
        expect(converterService).toBeDefined();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(responseData);
    });

    it('should call service execute with params and return converter value', async () => {

        const params = { to: '', amount: 10, from: 'EUR' };
        await createTestingModuleWithData();
        let req = undefined
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        }

        await converterController.converter(params, req, res as Response)        

        expect(converterController).toBeDefined();
        expect(converterService).toBeDefined();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({            
            cause: "Valid currency 'to' converter is required",
            code: 400,
            error: "BAD_REQUEST",
            message: "You need to provide a valid Valid 'currency ISO code' in to param."
        });
    });
});
