// src/swagger/schemas/contrato.js
module.exports = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      dataContrato: { type: 'string', format: 'date-time' },
      valorContrato: { type: 'number' },
      parcelas: { type: 'integer' },
      juros: { type: 'number' },
      clientId: { type: 'integer' },
      createdAt: { type: 'string', format: 'date-time' },
    },
    required: ['dataContrato', 'valorContrato', 'parcelas', 'juros', 'clientId'],
  };
  