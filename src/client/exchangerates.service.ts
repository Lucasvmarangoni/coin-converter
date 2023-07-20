import { currencies } from './util/all-currencies';
import { ConfigService } from '@nestjs/config';
import { HttpService } from "@nestjs/axios";
import { InternalError } from '@src/util/err/internal-error';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface ExchangeRatesResponse {
  readonly success: boolean;
  readonly timestamp: number;
  readonly base: string;
  readonly date: string;
  readonly rates: { [currency: string]: number };
}

export class ExchangeratesResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the Exchangerates service';
    super(`${internalMessage}: ${message}`);
  }
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to Exchangerates';
    super(`${internalMessage}: ${message}`);
  }
}

export class ExchangeratesInvalidInputError extends InternalError {
  constructor(message: string) {
    const internalMessage = message;
    super(`${internalMessage}`);
  }
}
export const sourceCurrenciesAccepted = ['EUR'];
export const acceptedCurrencies = `At the moment, it is only possible to perform conversions based on the ${sourceCurrenciesAccepted.join(
  ',',
)} currency.`;

interface ApiConfig {
  readonly url: string;
  readonly key: string;
}

@Injectable()
export class ExchangeratesService {
  constructor(
    private request: HttpService,    
    private configService: ConfigService<ApiConfig, true>,
  ) { }

  public async fetchConvert(
    sourceCurrency: string,
    destinationCurrency: string | string[],
  ): Promise<ExchangeRatesResponse> {
    this.ParamsValidator(sourceCurrency, destinationCurrency);

    const symbols = Array.isArray(destinationCurrency)
      ? destinationCurrency.join(',')
      : destinationCurrency;  

    const api = await this.configService.get<ApiConfig>('api', {
      infer: true,
    });
    console.log(api);
    
    const url = `${api.url}${sourceCurrency}&symbols=${symbols}&access_key=${api.key}`;      
    let response: ExchangeRatesResponse;    
    
    try {
      const response$ = this.request.get<ExchangeRatesResponse>(url);      
      console.log('response1: ' +response$);
      const axiosResponse: AxiosResponse<ExchangeRatesResponse> = await firstValueFrom(response$);
      response = axiosResponse.data;      
      console.log('response2: ' + response);
      
      if (!this.isValidResponse(response)) {
        throw new ExchangeratesResponseError('Invalid response');
      }    
      return response;
    } catch (err) {
      const { response } = err 
      if (err instanceof Error && response && response.status) {
        throw new ExchangeratesResponseError(
          `Error: ${JSON.stringify(response.data)} Code: ${response.status}`,
        );
      }      
      throw new ClientRequestError(JSON.stringify(err));
    }    
  }

  private ParamsValidator(
    sourceCurrency: string,
    destinationCurrency: string | string[],
  ) {
    if (Array.isArray(destinationCurrency)) {
      const invalidCurrencies = destinationCurrency.filter(
        (currency) => currency !== '' && !currencies.includes(currency),
      );

      if (invalidCurrencies.length > 0) {
        throw new ExchangeratesInvalidInputError(
          `These currencies do not exist: ${invalidCurrencies.join(', ')}`,
        );
      }
    } else if (
      destinationCurrency !== '' &&
      !currencies.includes(destinationCurrency)
    ) {
      throw new ExchangeratesInvalidInputError(
        `This currency does not exist: ${destinationCurrency}`,
      );
    }

    if (!sourceCurrenciesAccepted.includes(sourceCurrency)) {
      if (typeof sourceCurrency !== 'string' || !sourceCurrency.trim()) {
        if (
          (typeof destinationCurrency !== 'string' ||
            !destinationCurrency.trim()) &&
          (!Array.isArray(destinationCurrency) ||
            !destinationCurrency.every(
              (currency) =>
                typeof currency === 'string' && currency.trim() !== '',
            ))
        ) {
          throw new ExchangeratesInvalidInputError(
            `${acceptedCurrencies} Both source currency and destination currency are invalid. They must be a non-empty string or a non-empty array of strings.`,
          );
        }
        throw new ExchangeratesInvalidInputError(
          `${acceptedCurrencies} Invalid source currency. It must be a non-empty string.`,
        );
      }
      throw new ExchangeratesInvalidInputError(acceptedCurrencies);
    }
    if (
      (typeof destinationCurrency !== 'string' ||
        !destinationCurrency.trim()) &&
      (!Array.isArray(destinationCurrency) ||
        !destinationCurrency.every(
          (currency) => typeof currency === 'string' && currency.trim() !== '',
        ))
    ) {
      throw new ExchangeratesInvalidInputError(
        'Invalid destination currency. It must be a non-empty string or a non-empty array of strings.',
      );
    }
  }

  private isValidResponse(response: Partial<ExchangeRatesResponse>): boolean {
    return !!(
      response.success &&
      response.timestamp &&
      response.base &&
      response.date &&
      response.rates
    );
  }
}
