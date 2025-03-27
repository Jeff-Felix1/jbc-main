const userPaths = require('./paths/users');
const userIdPaths = require('./paths/userId');
const loginPaths = require('./paths/login');
const clientPaths = require('./paths/client');
const clientIdPaths = require('./paths/clientId');
const contratoPaths = require('./paths/contrato');
const contratoIdPaths = require('./paths/contratoId');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API JBC',
      version: '1.0.0',
      description:
        'Documentação da API de cadastro, autenticação, clientes e contratos',
    },
    tags: [
      { name: 'User', description: 'Endpoints relacionados aos usuários' },
      { name: 'Auth', description: 'Endpoints de autenticação' },
      { name: 'Client', description: 'Endpoints para gerenciamento de clientes' },
      { name: 'Contrato', description: 'Endpoints para gerenciamento de contratos' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT no formato: Bearer <token>',
        },
      },
      schemas: {
        User: require('./schemas/user'),
        Client: require('./schemas/client'),
        Contrato: require('./schemas/contrato'),
      },
    },
    security: [
      {
        bearerAuth: [], // Aplica o esquema de segurança globalmente
      },
    ],
    paths: {
      '/api/users': userPaths,
      '/api/users/{id}': userIdPaths,
      '/api/login': loginPaths,
      '/api/clients': clientPaths,
      '/api/clients/{id}': clientIdPaths,
      '/api/contratos': contratoPaths,
      '/api/contratos/{id}': contratoIdPaths,
    },
  },
  apis: [],
};

module.exports = swaggerOptions;