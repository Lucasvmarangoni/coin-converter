import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
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
  ) {}

  public async fetchConvert(
    sourceCurrency: string,
  ): Promise<ExchangeRatesResponse> {
    this.ParamsValidator(sourceCurrency);

    const api = await this.configService.get<ApiConfig>('api', {
      infer: true,
    });

    const url = `${api.url}${sourceCurrency}&access_key=${api.key}`;
    let response: ExchangeRatesResponse;

    try {
      const response$ = this.request.get<ExchangeRatesResponse>(url);
      const axiosResponse: AxiosResponse<ExchangeRatesResponse> =
        await firstValueFrom(response$);
      response = axiosResponse.data;

      if (!this.isValidResponse(response)) {
        throw new ExchangeratesResponseError('Invalid response');
      }
      return response;
    } catch (err) {
      const { response } = err;
      if (err instanceof Error && response && response.status) {
        throw new ExchangeratesResponseError(
          `Error: ${JSON.stringify(response.data)} Code: ${response.status}`,
        );
      }
      throw new ClientRequestError(JSON.stringify(err));
    }
  }

  private ParamsValidator(sourceCurrency: string) {
    if (!sourceCurrenciesAccepted.includes(sourceCurrency)) {
      if (typeof sourceCurrency !== 'string' || !sourceCurrency.trim()) {
        throw new ExchangeratesInvalidInputError(
          `${acceptedCurrencies} Invalid source currency. It must be a non-empty string.`,
        );
      }
      throw new ExchangeratesInvalidInputError(acceptedCurrencies);
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
