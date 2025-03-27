// Add this to your swaggerOptions.js or directly in your route.js JSDoc

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         email:
 *           type: string
 *           description: The user's email
 *         role:
 *           type: string
 *           enum: [admin, vendedor]
 *           description: The user's role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was created
 *       required:
 *         - email
 *         - role
 */
const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API JBC',
        version: '1.0.0',
        description: 'Documentação da API de cadastro de usuários',
      },
    },
    apis: ['./src/app/api/**/*.js'],
    // Esse caminho deve incluir o arquivo route.js
  };
  
  export default options;
  