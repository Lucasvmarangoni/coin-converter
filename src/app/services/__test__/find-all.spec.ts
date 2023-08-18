import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing"
import { Transactions } from "@src/app/models/transactions";
import { FindAllService } from "../converter/find-all";

describe('Find all transactions testining', () => {

    let findAllService: FindAllService;
    const responseData = [
        {
        "from": "EUR",
        "amount": 10,
        "to": [
            "USD"
        ],
        "rates": {
            USD: 1.2,
        },
        "date": expect.any(Date),
        "id": expect.any(String),
    },
    {
        "from": "EUR",
        "amount": 10,
        "to": [
            "USD"
        ],
        "rates": {
            USD: 1.3,
        },
        "date": expect.any(Date),
        "id": expect.any(String),
    }
    ]

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                FindAllService,
                {
                    provide: getModelToken(Transactions.name),
                    useValue: {
                        find: jest.fn().mockResolvedValue(responseData),
                        exec: jest.fn().mockResolvedValue(responseData),
                    }
                },
            ],
        }).compile();

        findAllService = moduleRef.get<FindAllService>(FindAllService);
    })

    it('Sould be defined', () => {
        expect(findAllService).toBeDefined();
    })

    it('Should call service execute and return all transactions', async () => {
        const response = await findAllService.execute();       
        expect(response).toEqual(responseData);
    })

})

