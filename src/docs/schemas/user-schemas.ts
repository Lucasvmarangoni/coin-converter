export const schemaOkResponse = {
  properties: {
    name: { type: 'string', example: 'John Doe' },
    username: { type: 'string', example: 'john123' },
    email: { type: 'string', format: 'email', example: 'john@mail.com' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const schemaOkDeletedResponse = {
  properties: {
    message: {
      type: 'string',
      example: 'You account is deleted successful',
    },
  },
};
