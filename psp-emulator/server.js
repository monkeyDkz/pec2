const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PSP_PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
try {
  const paymentRoutes = require('./routes/payment');
  const webhookRoutes = require('./routes/webhook');
  
  app.use('/api/payment', paymentRoutes);
  app.use('/api/webhook', webhookRoutes);
  console.log('✅ PSP Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading PSP routes:', error.message);
}

// Route de health check globale
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'PSP Emulator',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('PSP Error:', err);
  res.status(500).json({
    success: false,
    error: 'PSP internal server error'
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'PSP endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`💳 PSP Emulator running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Payment API: http://localhost:${PORT}/api/payment/`);
  console.log(`🔔 Webhook API: http://localhost:${PORT}/api/webhook/`);
});