import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { clearDatabase } from './util/clear-database';

describe('Authentication (e2e)', () => {
  let app: INestApplication, connection: Connection;

  const validUserData = {
    name: 'John Doe',
    username: 'johnuser',
    email: 'john@gmail.com',
    password: '1aS@3$4%sF',
  };

  let token: string;

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

  afterAll(async () => {
    await clearDatabase(connection);
    await app.close();
  });

  describe('POST (/user) - create user', () => {
    it('should returned 201 created', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send(validUserData)
        .expect(201);

      expect(response.body).toEqual({
        name: 'John Doe',
        username: 'johnuser',
        email: 'john@gmail.com',
        createdAt: expect.any(String),
      });
    });

    it('/user (POST) - username already exists', async () => {
      const userData = {
        name: 'John Doe',
        username: 'johnuser',
        email: 'john@gmail.com',
        password: '1aS@3$4%sF',
      };
      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send(userData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'This user already exist. Try with other username or email.',
        error: 'mongoose validation error',
        statusCode: 400,
      });
    });

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

        token = response.body.access_token;

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toEqual({
          access_token: expect.any(String),
        });
      });
    });
  });

  describe('/user/profile (GET) - user profile', () => {
    it('When a get user profile ', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        user: {
          name: 'John Doe',
          username: 'johnuser',
          email: 'john@gmail.com',
          createdAt: expect.any(String),
        },
      });
    });
  });

  describe('POST (/user/update) - create user', () => {
    it('should returned 200', async () => {
      const updateUser = {
        ...validUserData,
        username: 'updateJohn',
      };

      const response = await request(app.getHttpServer())
        .put('/api/user/update')
        .set('Authorization', `Bearer ${token}`)
        .send(updateUser)
        .expect(200);

      expect(response.body).toEqual({
        user: {
          name: 'John Doe',
          username: 'updateJohn',
          email: 'john@gmail.com',
          createdAt: expect.any(String),
        },
      });
    });
  });

  describe('/user/delete (DELETE) - delete user', () => {
    it('When a get user profile ', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/user/delete')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'You account is deleted successful',
      });
    });
  });
});
