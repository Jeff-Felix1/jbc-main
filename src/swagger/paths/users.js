// src/swagger/paths/users.js
module.exports = {
  post: {
    tags: ['User'],
    summary: 'Cadastro de um novo usuário',
    description:
      'Cria um usuário no banco de dados com os campos email, password e role.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              password: { type: 'string' },
              role: { type: 'string', enum: ['admin', 'vendedor'] },
            },
            required: ['email', 'password', 'role'],
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Usuário criado com sucesso.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' },
          },
        },
      },
      400: { description: 'Requisição inválida.' },
      409: { description: 'Usuário já existe.' },
      500: { description: 'Erro interno no servidor.' },
    },
  },
  get: {
    tags: ['User'],
    summary: 'Lista todos os usuários',
    description: 'Retorna a lista de todos os usuários cadastrados.',
    responses: {
      200: {
        description: 'Lista de usuários retornada com sucesso.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
      500: { description: 'Erro interno no servidor.' },
    },
  },
};
