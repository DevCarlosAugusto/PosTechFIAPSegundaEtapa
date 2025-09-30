import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

function setupSwagger(app) {
  const options = {
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Swagger EducaBlog',
        version: '1.0.0',
        description: '<a>http://localhost:3000/swagger.json/</a>',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
      }
    },
    // Ajuste os globs conforme sua estrutura real:
    apis: [
      './app.js',
      './src/**/*.js'
    ],
  };

  const swaggerSpec = swaggerJSDoc(options);

  // JSON bruto (útil pra CI)
  app.get('/swagger.json', (_req, res) => res.json(swaggerSpec));

  // UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
}

export default setupSwagger;
