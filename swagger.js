const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mock AI Server',
      version: '1.0.0',
      description: '模拟公司 Java 后端的 AI 接口，真实调用千问流式接口',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Local development server',
      },
    ],
  },
  apis: ['./server.js'],
}

function createOpenApiSpec() {
  return swaggerJsdoc(options)
}

module.exports = { createOpenApiSpec }
