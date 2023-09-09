import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { clearDatabase } from './util/clear-database';

describe('Authentication (e2e)', () => {
  let app: INestApplication, connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        // MongooseModule.forRootAsync({
        //   useFactory: () => ({
        //     uri: process.env.MONGODB_URI,
        //   }),
        //   inject: [getConnectionToken()],
        // }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    connection = app.get<Connection>(getConnectionToken());
    await clearDatabase(connection);
    await app.init();
  });

  describe('POST (/user) - create user', () => {
    it('should returned 201 created', async () => {
      const userData = {
        name: 'John Doe',
        username: 'johnuser',
        email: 'john@gmail.com',
        password: '1aS@3$4%sF',
      };
      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        name: 'John Doe',
        username: 'johnuser',
        email: 'john@gmail.com',
        createdAt: expect.any(String),
      });
    });

    // it('/user (POST) - username already exists', async () => {
    //   const userData = {
    //     name: 'John Doe',
    //     username: 'johnuser',
    //     email: 'john@gmail.com',
    //     password: '1aS@3$4%sF',
    //   };
    //   const response = await request(app.getHttpServer())
    //     .post('/user')
    //     .send(userData)
    //     .expect(400);

    //   expect(response.body).toEqual({
    //     statusCode: 400,
    //     message: 'Username already exists',
    //     error: 'Bad Request',
    //   });
    // });

    describe('POST (/login) - login (authn)', () => {
      it('with email', async () => {
        const credentials = {
          email: 'john@gmail.com',
          password: '1aS@3$4%sF',
        };
        const response = await request(app.getHttpServer())
          .post('/api/login')
          .send(credentials)
          .expect(200);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toEqual({
          access_token: expect.any(String),
        });
      });

      it('/login (POST) with username', async () => {
        const credentials = {
          username: 'johnuser',
          password: '1aS@3$4%sF',
        };
        const response = await request(app.getHttpServer())
          .post('/api/login')
          .send(credentials)
          .expect(200);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toEqual({
          access_token: expect.any(String),
        });
      });
    });

    afterAll(async () => {
      await clearDatabase(connection);
      await app.close();
    });
  });
});
