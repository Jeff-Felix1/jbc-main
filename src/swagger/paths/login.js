// src/swagger/paths/login.js
module.exports = {
  post: {
    tags: ['Auth'],
    summary: 'Autenticação de usuário',
    description: 'Autentica o usuário e retorna um token JWT.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              password: { type: 'string' },
            },
            required: ['email', 'password'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Autenticação realizada com sucesso.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string' },
              },
            },
          },
        },
      },
      401: { description: 'Credenciais inválidas ou usuário não encontrado.' },
      500: { description: 'Erro interno no servidor.' },
    },
  },
};
