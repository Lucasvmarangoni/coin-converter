import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ObjectId } from 'bson';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('(POST) Transaction of converter currency from default base', async () => {
    const { body, status } = await request(app.getHttpServer()).post(
      '/converter/USD/10/EUR',
    );

    expect(status).toBe(201);
    expect(ObjectId.isValid(body.id)).toBe(true);
    expect(body).toEqual({
      from: 'EUR',
      amount: 10,
      to: ['USD'],
      rates: {
        USD: expect.any(Number),
      },
      date: body.date,
      id: expect.any(String),
    });
  });

  it('(POST) Transaction of multiple currencies converter from default base', async () => {
    const { body, status } = await request(app.getHttpServer()).post(
      '/converter/USD,BRL/10/',
    );

    expect(status).toBe(201);
    expect(ObjectId.isValid(body.id)).toBe(true);
    expect(body).toEqual({
      from: 'EUR',
      amount: 10,
      to: ['USD', 'BRL'],
      rates: {
        USD: expect.any(Number),
        BRL: expect.any(Number),
      },
      date: body.date,
      id: expect.any(String),
    });
  });

  it('(POST) Transaction of multiple currencies converter from non-default base', async () => {
    const { body, status } = await request(app.getHttpServer()).post(
      '/converter/USD,BRL/10/AMD',
    );

    expect(status).toBe(201);
    expect(ObjectId.isValid(body.id)).toBe(true);
    expect(body).toEqual({
      from: 'AMD',
      amount: 10,
      to: ['USD', 'BRL'],
      rates: {
        USD: expect.any(Number),
        BRL: expect.any(Number),
      },
      date: body.date,
      id: expect.any(String),
    });
  });

  it('(POST) Transaction of invalid none currency', async () => {
    const { body, status } = await request(app.getHttpServer()).post(
      '/converter/10/AMD',
    );

    expect(status).toBe(400);
    expect(body).toThrow('Invalid currency');
  });
});
