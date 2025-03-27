// src/swagger/schemas/user.js
module.exports = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      description: 'ID do usuário',
    },
    email: {
      type: 'string',
      description: 'Email do usuário',
    },
    password: {
      type: 'string',
      description: 'Senha (hasheada) do usuário',
    },
    role: {
      type: 'string',
      enum: ['admin', 'vendedor'],
      description: 'Papel do usuário',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Data de criação do usuário',
    },
  },
  required: ['email', 'role'],
};
