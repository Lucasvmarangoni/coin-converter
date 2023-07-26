import { Injectable } from "@nestjs/common";
import { ConversionRates, Transaction, Transactions } from "../models/transactions";
import { ExchangeratesService } from "@src/client/exchangerates.service";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, mongo } from "mongoose";

type Rate = { [key: string]: number }

export interface ConvertProps {
    rates: Rate,
}
export interface ResponseData {
    user?: string,
    from: string,
    amount: number,
    to: string | string[],
    rates: Rate,
    date: Date,
}
export interface RequestData {
    to: string,
    amount: number,
    from: string,
}

@Injectable()
export class ConvertService {
    private readonly sourceCurrenciesAccepted = 'EUR';

    constructor(
        @InjectModel(Transactions.name)
        private transactionsModel: Model<Transaction>,
        private exchangeratesService: ExchangeratesService) { }

    async execute(req: RequestData): Promise<ResponseData> {

        if (!req.to || !Number.isNaN(Number(req.to))) {
            throw new Error('Currency "to" convert is required')
        } else if (!req.amount || typeof req.amount !== 'number') {
            throw new Error('"Amount" to convert is required')
        }
        req.from ?? (req.from = this.sourceCurrenciesAccepted);
        req.to = req.to.toUpperCase();
        req.from = req.from.toUpperCase();

        const { to, amount, from } = req;
        const convertedAmount = await this.convertCurrency(req);

        const transactionData: ResponseData = {
            from: from,
            amount: amount,
            to: to.split(',').map((item) => item.trim()),
            rates: convertedAmount.rates,
            date: new Date()
        }
        const save = await this.transactionsModel.create(transactionData);

        const response: ResponseData = save
        return response;
    }

    private async convertCurrency(req: RequestData): Promise<ConvertProps> {

        let conversionRate: Rate;
        let selectRates = {};

        const apiResponse = await this.exchangeratesService.fetchConvert(
            this.sourceCurrenciesAccepted,
        );
        const { rates } = apiResponse;

        Object.keys(rates).forEach((key) => {
            if (req.to.includes(key)) {
                selectRates[key] = rates[key];
            }
        });
        if (req.from === this.sourceCurrenciesAccepted) {
            conversionRate = selectRates

            for (let key in selectRates) {
                selectRates[key] *= req.amount;
            }
        } else {
            conversionRate = selectRates

            for (let key in selectRates) {
                if (key !== req.from) {
                    selectRates[key] /= rates[req.from]
                    selectRates[key] *= req.amount;
                }
            }
        }
        return {
            rates: conversionRate
        };
    };
}

