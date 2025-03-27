module.exports = {
  put: {
    tags: ['Client'],
    summary: 'Atualiza um cliente',
    description:
      'Atualiza os dados de um cliente existente com base no ID informado. Permite atualização parcial dos campos.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
        description: 'ID do cliente a ser atualizado.',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              cpf: { type: 'string' },
              nome: { type: 'string' },
              status: { type: 'string' },
              dataNascimento: { type: 'string', format: 'date-time' },
              valorDisponivel: { type: 'number' },
              telefone: { type: 'string' }, // Novo campo
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Cliente atualizado com sucesso.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Client' },
          },
        },
      },
      400: { description: 'Nenhum campo para atualizar foi fornecido.' },
      404: { description: 'Cliente não encontrado.' },
      500: { description: 'Erro interno no servidor.' },
    },
  },
  delete: {
    tags: ['Client'],
    summary: 'Deleta um cliente',
    description: 'Remove um cliente do banco de dados com base no ID informado.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
        description: 'ID do cliente a ser deletado.',
      },
    ],
    responses: {
      200: { description: 'Cliente deletado com sucesso.' },
      404: { description: 'Cliente não encontrado.' },
      500: { description: 'Erro interno no servidor.' },
    },
  },
};