// src/swagger/paths/userId.js
module.exports = {
  delete: {
    tags: ['User'],
    summary: 'Deletar um usuário',
    description: 'Remove um usuário do banco de dados com base no id informado.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
        description: 'ID do usuário a ser deletado.',
      },
    ],
    responses: {
      200: { description: 'Usuário deletado com sucesso.' },
      404: { description: 'Usuário não encontrado.' },
      500: { description: 'Erro interno no servidor.' },
    },
  },
};
