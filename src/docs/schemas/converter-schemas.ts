export const schemaOkResponse = {
  properties: {
    user: { type: 'string', example: '64feae0ad15e0c0e55a0b228' },
    from: { type: 'string', example: 'AMD' },
    amount: { type: 'number', example: 100 },
    to: { type: 'array', example: ['USD', 'BRL'] },
    rates: {
      type: 'object',
      example: { USD: 0.2573041234622473, BRL: 1.2529688328817232 },
    },
    date: { type: 'string', format: 'date-time' },
    id: { type: 'string', example: '6503ed162f1190d6b35f5a03' },
  },
};

export const schemaOkDeletedResponse = {
  properties: {
    message: {
      type: 'string',
      example: 'You transactions are deleted successful',
    },
  },
};
