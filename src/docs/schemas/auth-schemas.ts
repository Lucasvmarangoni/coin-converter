export const authnResponse = {
  properties: {
    access_token: {
      type: 'string',
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NGZlYWUwYWQxNWUwYzBlNTVhMGIyMjgiLCJ1c2VybmFtZSI6ImpvaG4iLCJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwiaWF0IjoxNjk0NzUzODQxLCJleHAiOjE2OTQ4MTM4NDF9.zxcErShxSQ-qTFYOW6k6Z-SAlqLwgXBk19sS-AFFnW8',
    },
  },
};
// auth-schemas.ts

export const BodyAuthSchema = {
  properties: {
    authnWithEmail: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'john@mail.com',
          description: 'The user email.',
          require: true,
        },
        password: {
          type: 'string',
          example: 'hbGHss6$65',
          description: 'The user password.',
          require: true,
        },
      },
    },
    authnWithUsername: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'john123',
          description: 'The user username.',
          require: true,
        },
        password: {
          type: 'string',
          example: 'hbGHss6$65',
          description: 'The user password.',
          require: true,
        },
      },
    },
  },
};
