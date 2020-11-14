const express = require ('express');
const app = express();
const swaggerJsDoc = require ('swagger-jsdoc');
const swaggerUi = require ('swagger-ui-express');
const tokenRoutes = require("./Apis/token");
const justifyRoutes = require("./Apis/justify");
require('dotenv').config();

app.use(express.json());

//Les options de SwaggerUi
const swaggerOptions = {
  swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        version: "1.0.0",
        title: "My Tictactrip Project API",
        description: "API Information",
        contact: {
          name: "Ali Feki",
          email: "ali.feki@supcom.tn"
        },
        servers: ["http://localhost:"+(process.env.PORT || 8080)]
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ["./Apis/*.js"]
  };

//configuration de SwaggerDoc
const swaggerDocs = swaggerJsDoc(swaggerOptions);
//Route de SwaggerUI 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Routes des Apis
app.use("/api/token", tokenRoutes);
app.use("/api/justify", justifyRoutes);

//Démarrage d'Express Server
let server = app.listen(process.env.PORT || 8080,()=>{
  console.log('Serveur express démarré');
});

module.exports = server;