import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // OpenAPI 3.0 specification
    info: {
      title: "Booking Event API", // API title
      version: "1.0.0", // Version
      description: "API documentation for the Booking Event application", // Description
    },
    servers: [
      {
        url: "http://localhost:8081",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: [
    path.join(__dirname, "routes", "*.js"),
    path.join(__dirname, "docs", "*.yaml")
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;