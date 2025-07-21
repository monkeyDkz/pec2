const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

/**
 * Route pour traiter un paiement (capture)
 * POST /api/payment/process
 */
router.post('/process', paymentController.processPayment);

/**
 * Route pour traiter un remboursement
 * POST /api/payment/refund
 */
router.post('/refund', paymentController.processRefund);

/**
 * Route de health check pour le PSP
 * GET /api/payment/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PSP Emulator',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;