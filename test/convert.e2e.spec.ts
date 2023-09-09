import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ObjectId } from 'bson';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { clearDatabase } from './util/clear-database';

describe('AppController (e2e)', () => {
  let app: INestApplication, token, connection: Connection;

  beforeAll(async () => {
    const userData = {
      name: 'John Doe',
      username: 'johnuser',
      email: 'john@gmail.com',
      password: '1aS@3$4%sF',
    };
    const authnUser = {
      username: userData.username,
      password: userData.password,
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    connection = app.get<Connection>(getConnectionToken());
    await clearDatabase(connection);

    await request(app.getHttpServer())
      .post('/api/user')
      .send(userData)
      .expect(201);
    token = await request(app.getHttpServer())
      .post('/api/login/')
      .send(authnUser);
    token = token.body.access_token;
  });

  afterAll(async () => {
    await clearDatabase(connection);
    await app.close();
  });

  it('(POST) Transaction of converter currency from default base', async () => {
    const { body, status } = await request(app.getHttpServer())
      .post('/api/converter/USD/10/EUR')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

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
      user: expect.any(String),
    });
  });

  it('(POST) Transaction of multiple currencies converter from default base', async () => {
    const { body, status } = await request(app.getHttpServer())
      .post('/api/converter/USD,BRL/10/')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

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
      user: expect.any(String),
    });
  });

  it('(POST) Transaction of multiple currencies converter from non-default base', async () => {
    const { body, status } = await request(app.getHttpServer())
      .post('/api/converter/USD,BRL/10/AMD')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

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
      user: expect.any(String),
    });
  });

  it('(POST) Transaction of invalid to currency', async () => {
    const { body, status } = await request(app.getHttpServer())
      .post('/api/converter/10/AMD')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(status).toBe(400);
    expect(body.message).toBe(
      `You provide an invalid value for the 'to' parameter`,
    );
    expect(body.statusCode).toBe(400);
    expect(body.error).toBe(
      `You need to provide a valid 'currency ISO code' in to param.`,
    );
    expect(body).toEqual({
      message: "You provide an invalid value for the 'to' parameter",
      error: "You need to provide a valid 'currency ISO code' in to param.",
      statusCode: 400,
    });
  });

  it('(POST) Transaction of invalid amount', async () => {
    const { body, status } = await request(app.getHttpServer())
      .post('/api/converter/AMD/x/BRL')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(status).toBe(400);
    expect(body.message).toBe(
      `You provide an invalide 'amount' value to converter parameter`,
    );
    expect(body.statusCode).toBe(400);
    expect(body.error).toBe(
      `You must provide a valid 'amount' in numeric format and Number type for the conversion.`,
    );
    expect(body).toEqual({
      message: "You provide an invalide 'amount' value to converter parameter",
      error:
        "You must provide a valid 'amount' in numeric format and Number type for the conversion.",
      statusCode: 400,
    });
  });

  it('(POST) Transaction of invalid from', async () => {
    const { body, status } = await request(app.getHttpServer())
      .post('/api/converter/AMD/10/ASDASD')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(status).toBe(400);
    expect(body.message).toBe(
      `You provide an invalid value for the 'from' parameter`,
    );
    expect(body.statusCode).toBe(400);
    expect(body.error).toBe(
      `You need to provide a valid 'currency ISO code' in to param or leave it undefined to use the default value.`,
    );
    expect(body).toEqual({
      message: "You provide an invalid value for the 'from' parameter",
      error:
        "You need to provide a valid 'currency ISO code' in to param or leave it undefined to use the default value.",
      statusCode: 400,
    });
  });

  it('(POST) Transaction of invalid token', async () => {
    const { body, status } = await request(app.getHttpServer())
      .post('/api/converter/10/AMD')
      .set('Authorization', `Bearer invalid_token`);

    // TODO: corrigir esse caso de teste quando eu implementar o tratamento das exceções.

    expect(body.statusCode).toBe(401);
    expect(body.error).toBe('Unauthorized');
    expect(body.message).toBe(`Unauthorized`);
    expect(body).toEqual({
      message: 'Unauthorized',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });
});
