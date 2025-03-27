// src/swagger/paths/contrato.js
module.exports = {
    post: {
      tags: ['Contrato'],
      summary: 'Cria um novo contrato para um cliente',
      description:
        'Cria um novo contrato e o associa a um cliente através do clientId. Todos os campos são obrigatórios.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                clientId: { type: 'integer' },
                dataContrato: { type: 'string', format: 'date-time' },
                valorContrato: { type: 'number' },
                parcelas: { type: 'integer' },
                juros: { type: 'number' },
              },
              required: ['clientId', 'dataContrato', 'valorContrato', 'parcelas', 'juros'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Contrato criado com sucesso.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Contrato' },
            },
          },
        },
        400: { description: 'Requisição inválida.' },
        500: { description: 'Erro interno no servidor.' },
      },
    },
    get: {
      tags: ['Contrato'],
      summary: 'Lista todos os contratos',
      description: 'Retorna a lista de todos os contratos cadastrados.',
      responses: {
        200: {
          description: 'Lista de contratos retornada com sucesso.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Contrato' },
              },
            },
          },
        },
        500: { description: 'Erro interno no servidor.' },
      },
    },
    put: {
      tags: ['Contrato'],
      summary: 'Atualiza um contrato',
      description:
        'Atualiza os dados de um contrato existente com base no ID informado. Permite atualização parcial dos campos.',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID do contrato a ser atualizado.',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                dataContrato: { type: 'string', format: 'date-time' },
                valorContrato: { type: 'number' },
                parcelas: { type: 'integer' },
                juros: { type: 'number' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Contrato atualizado com sucesso.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Contrato' },
            },
          },
        },
        400: { description: 'Nenhum campo para atualizar foi fornecido.' },
        404: { description: 'Contrato não encontrado.' },
        500: { description: 'Erro interno no servidor.' },
      },
    },
    delete: {
      tags: ['Contrato'],
      summary: 'Deleta um contrato',
      description: 'Remove um contrato do banco de dados com base no ID informado.',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID do contrato a ser deletado.',
        },
      ],
      responses: {
        200: { description: 'Contrato deletado com sucesso.' },
        404: { description: 'Contrato não encontrado.' },
        500: { description: 'Erro interno no servidor.' },
      },
    },
  };
  