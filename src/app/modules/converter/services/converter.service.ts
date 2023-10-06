import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Transaction } from '@src/app/models/transactions';
import { ExchangeratesService } from '@src/client/exchangerates.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { currencies } from '../util/all-currencies';
import {
  RequestData,
  ResponseData,
  ConvertProps,
  Rate,
} from '../models/converter-models';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ConverterService {
  private readonly sourceCurrenciesAccepted = 'EUR';

  constructor(
    @InjectModel('TransactionModel')
    private readonly transactionsModel: Model<Transaction>,
    private readonly exchangeratesService: ExchangeratesService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(req: RequestData): Promise<ResponseData> {
    this.exceptions(req);

    req.from ?? (req.from = this.sourceCurrenciesAccepted);
    req.to = req.to.toUpperCase();
    req.from = req.from.toUpperCase();

    const { to, amount, from } = req;
    const converterAmount = await this.converterCurrency(req);

    const transactionData: ResponseData = {
      from: from,
      amount: amount,
      to: to.split(',').map((item) => item.trim()),
      rates: converterAmount.rates,
      date: new Date(),
      user: req.user.id,
    };

    let response: ResponseData;
    try {
      response = await this.transactionsModel.create(transactionData);
    } catch (err) {
      throw new BadRequestException('mongoose validation error', {
        cause: new Error(),
        description: 'Some provided value to be invalid',
      });
    }
    const cached =
      (await this.cacheManager.get<ResponseData[]>(
        `transactions:${req.user.email}`,
      )) || [];
    cached.push(response);

    this.cacheManager.set(`transactions:${req.user.email}`, cached);
    return response;
  }

  private async converterCurrency(req: RequestData): Promise<ConvertProps> {
    let conversionRate: Rate;
    const selectRates = {};

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
      conversionRate = selectRates;

      for (const key in selectRates) {
        selectRates[key] *= req.amount;
      }
    } else {
      conversionRate = selectRates;

      for (const key in selectRates) {
        if (key !== req.from) {
          selectRates[key] /= rates[req.from];
          selectRates[key] *= req.amount;
        }
      }
    }
    return {
      rates: conversionRate,
    };
  }

  private exceptions(req: RequestData) {
    const { to, amount, from } = req;
    const toArray = to.split(',');
    const validCurrencies = toArray.every((to) => {
      return currencies.includes(to);
    });

    if (!to || !Number.isNaN(Number(req.to)) || !validCurrencies) {
      throw new BadRequestException(
        `You provide an invalid value for the 'to' parameter`,
        {
          cause: new Error(),
          description: `You need to provide a valid 'currency ISO code' in to param.`,
        },
      );
    } else if (
      !Number.isNaN(Number(from)) ||
      (!!from && !currencies.includes(from))
    ) {
      throw new BadRequestException(
        `You provide an invalid value for the 'from' parameter`,
        {
          cause: new Error(),
          description: `You need to provide a valid 'currency ISO code' in to param or leave it undefined to use the default value.`,
        },
      );
    } else if (!amount || typeof amount !== 'number') {
      throw new BadRequestException(
        `You provide an invalide 'amount' value to converter parameter`,
        {
          cause: new Error(),
          description: `You must provide a valid 'amount' in numeric format and Number type for the conversion.`,
        },
      );
    }
  }
}
