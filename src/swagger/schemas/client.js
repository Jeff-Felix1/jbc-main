module.exports = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    cpf: { type: 'string' },
    nome: { type: 'string' },
    status: { type: 'string' },
    dataNascimento: { type: 'string', format: 'date-time' },
    valorDisponivel: { type: 'number' },
    telefone: { type: 'string' }, // Novo campo
    contratos: {
      type: 'array',
      items: { $ref: '#/components/schemas/Contrato' },
    },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['cpf', 'nome', 'dataNascimento', 'valorDisponivel', 'status'],
};