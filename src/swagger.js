import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Play Tube API',
      version: '1.0.0',
      description: 'A You Tube Clone API for video streaming platform with Swagger docs'
    },
    tags: [
      { name: 'Health Check' },
      { name: 'Auth' },
      { name: 'User' },
      { name: 'Video' },
      { name: 'Comment' },
      { name: 'Like' },
      { name: 'Subscription' },
      { name: 'Playlist' },
      { name: 'Tweet' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    servers: [
      {
        url: process.env.API_URL,
        description: 'Version 1.0.0'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to route files
};

const swaggerSpec = swaggerJsdoc(options);

export {
  swaggerUi,
  swaggerSpec
}