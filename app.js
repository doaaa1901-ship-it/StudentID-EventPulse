require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Middleware
app.use(express.json());

// Database Connection Helper for Serverless Architecture
let cachedDb = null;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (process.env.MONGO_URI) {
    if (!cachedDb) {
      cachedDb = await mongoose.connect(process.env.MONGO_URI);
    }
    return cachedDb;
  }
};

// Swagger Spec Setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'EventPulse API',
    version: '1.0.0',
    description: 'API documentation for EventPulse - Real-time event management platform',
  },
  servers: [
    {
      url: 'https://student-id-event-pulse-2cov.vercel.app',
      description: 'Production Server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development Server',
    },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [path.join(__dirname, './routes/*.js'), path.join(__dirname, './app.js')],
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Health Check Handler
const healthHandler = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error during health check:', err);
  }

  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};

// Root & Health Endpoint Mounting
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to StudentID-EventPulse API' });
});
app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Mount your routers here (e.g., app.use('/api/v1', mainRouter);)

module.exports = app;