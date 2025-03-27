module.exports = {
  post: {
    tags: ['Client'],
    summary: 'Cria um novo cliente (opcionalmente com contrato)',
    description:
      'Cria um cliente com CPF, nome, data de nascimento, valor disponível e telefone. Se enviados, os dados do contrato serão criados e associados ao cliente.',
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
              contrato: {
                type: 'object',
                properties: {
                  dataContrato: { type: 'string', format: 'date-time' },
                  valorContrato: { type: 'number' },
                  parcelas: { type: 'integer' },
                  juros: { type: 'number' },
                },
              },
            },
            required: ['cpf', 'nome', 'dataNascimento', 'valorDisponivel', 'status'],
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Cliente criado com sucesso.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Client' },
          },
        },
      },
      400: { description: 'Requisição inválida.' },
      409: { description: 'Cliente já existe.' },
      500: { description: 'Erro interno no servidor.' },
    },
  },
  get: {
    tags: ['Client'],
    summary: 'Lista todos os clientes',
    description:
      'Retorna a lista de todos os clientes cadastrados, incluindo os contratos associados (se houver).',
    responses: {
      200: {
        description: 'Lista de clientes retornada com sucesso.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Client' },
            },
          },
        },
      },
      500: { description: 'Erro interno no servidor.' },
    },
  },
};