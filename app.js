require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

app.use(express.json());

// Database Connection Helper
let dbError = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    dbError = 'MONGO_URI environment variable is missing on Vercel';
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    dbError = null;
  } catch (err) {
    dbError = err.message || String(err);
    console.error('MongoDB Connection Error:', err);
  }
};

// Swagger Setup
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
  apis: ['./routes/*.js', './app.js'],
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Health Check Endpoint
const healthHandler = async (req, res) => {
  await connectDB();

  const isConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    status: 'ok',
    database: isConnected ? 'connected' : 'disconnected',
    ...(dbError && { error_details: dbError }),
    timestamp: new Date().toISOString(),
  });
};

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to StudentID-EventPulse API' });
});
app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Mount Specific Route Files Below as needed, for example:
// const eventRoutes = require('./routes/events');
// app.use('/api/v1/events', eventRoutes);

module.exports = app;